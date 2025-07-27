import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";

const stripePromise = loadStripe("pk_test_51Roge591HJqvjmUhXPywsJe1Yel29BfpPBCmhp37ZkfqI7uPbkv2XDpfuj10KIn3uCtm7skq3RfXUSHrzwu1tZ7g00pEb3800o");

const BuyNow = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const location = useLocation();
  const navigate = useNavigate();
  const buyData = location.state || {};

  const handleContinueShopping = () => {
    const { prop_id } = buyData;
    if (prop_id) {
      navigate(`/props/${prop_id}`);
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchPropDetails = async () => {
      const { prop_id, quantity, type, rentalDays } = buyData;

      if (!prop_id) return;

      try {
        const response = await axios.get(`http://localhost:3000/api/props/${prop_id}`);
        const prop = response.data;

        const cartItem = {
          _id: `${prop_id}-${Date.now()}`,
          prop_id: {
            _id: prop._id,
            name: prop.name,
            category: prop.category,
            image: prop.image,
          },
          purchasePrice: prop.purchase_price,
          rentalPrice: prop.hasDiscount &&
            prop.discount_percent &&
            new Date() >= new Date(prop.discount_start) &&
            new Date() <= new Date(prop.discount_end)
            ? prop.rental_price * (1 - prop.discount_percent / 100)
            : prop.rental_price,
          quantity: quantity || 1,
          type: type || "purchase",
          rentalDays: type === "rental" ? rentalDays || 7 : undefined,
        };

        setCartItems([cartItem]);
      } catch (error) {
        console.error("Error fetching prop details:", error);
      }
    };

    fetchPropDetails();
  }, [buyData]);

  const calculateItemPrice = (item) => {
    if (item.type === "purchase") {
      return item.purchasePrice;
    } else {
      return item.rentalPrice * (item.rentalDays / 7);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
  const deliveryFee = cartItems.length > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      toast.error("Please log in to proceed.");
      return;
    }

    const orderData = {
      user_id: userId,
      items: cartItems.map((item) => ({
        prop_id: item.prop_id._id,
        quantity: item.quantity,
        type: item.type,
        rentalDays: item.rentalDays || 0,
      })),
      deliveryFee,
      total_price: total,
      paymentMethod: paymentMethod === "cod" ? "cod" : "online",
    };

    if (paymentMethod === "online") {
  try {
    // Add successUrl for BuyNow payment success page
    const response = await axios.post(
      "http://localhost:3000/api/payments/create-checkout-session",
      {
        ...orderData,
        successUrl: `http://localhost:5173/payment-buy?session_id={CHECKOUT_SESSION_ID}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const stripe = await stripePromise;
    await stripe.redirectToCheckout({ sessionId: response.data.sessionId });
  } catch (err) {
    console.error("Stripe session error:", err);
    toast.error("Stripe session creation failed.");
  }
}else {
      try {
        const response = await axios.post("http://localhost:3000/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("🎉 COD Order Placed!");
        navigate("/orders", {
          state: {
            orderId: response.data._id,
            paymentStatus: response.data.paymentStatus,
          },
        });
      } catch (err) {
        console.error("COD order error:", err);
        toast.error("COD Order failed.");
      }
    }
  };

  useEffect(() => {
    const handleStripeSuccess = async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!sessionId || !userId || !token || cartItems.length === 0) return;

      try {
        const sessionRes = await axios.get(`http://localhost:3000/api/payments/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const paymentIntentId = sessionRes.data.payment_intent;

        const existsRes = await axios.get(`http://localhost:3000/api/orders/check/${paymentIntentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (existsRes.data.exists) {
          toast.success("Order already placed.");
          return;
        }

        const orderData = {
          user_id: userId,
          items: cartItems.map((item) => ({
            prop_id: item.prop_id._id,
            quantity: item.quantity,
            type: item.type,
            rentalDays: item.rentalDays || 0,
          })),
          deliveryFee,
          total_price: total,
          paymentMethod: "online",
          paymentIntentId,
          paymentStatus: "done",
        };

        const orderRes = await axios.post("http://localhost:3000/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("✅ Stripe Order Placed!");
        navigate("/orders", {
          state: {
            orderId: orderRes.data._id,
            paymentStatus: orderRes.data.paymentStatus,
          },
        });
      } catch (err) {
        console.error("Error placing Stripe order:", err);
        toast.error("Payment done, but order failed.");
      }
    };

    handleStripeSuccess(); // don't depend on cartItems!
  }, []);

  const removeItem = (id) => {
    setCartItems((items) => items.filter((item) => item._id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <button
              onClick={handleContinueShopping}
              className="group flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Continue Shopping
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-grow space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Buy Prop</h1>
                <span className="text-gray-500">{cartItems.length} item</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">No prop selected.</p>
                  <p className="text-gray-500 mt-2">
                    Please select a prop to buy now!
                  </p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-black text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-blue-100"
                  >
                    <div className="flex gap-6">
                      <div className="relative group">
                        <img
                          src={`http://localhost:3000/prop_images/${item.prop_id.image}`}
                          alt={item.prop_id.name}
                          className="w-28 h-40 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex-1 flex gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{item.prop_id.name}</h3>
                          <p className="text-gray-600 mt-1">{item.prop_id.category.join(", ")}</p>
                          <p className="text-gray-600 mt-2">
                            Purchase Price: Rs {item.purchasePrice.toFixed(0)}
                          </p>
                          <p className="text-gray-600 mt-1">
                            Rental Price: Rs {item.rentalPrice.toFixed(0)}/week
                          </p>
                        </div>
                        <div className="flex flex-col gap-4 w-1/3">
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-gray-600">
                              Status: {item.type === "purchase" ? "Purchase" : "Rent"}
                            </p>
                            <p className="text-gray-600 mt-1">
                              {item.type === "purchase"
                                ? `Quantity: ${item.quantity}`
                                : `Rental Weeks: ${Math.round(item.rentalDays / 7)}`}
                            </p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-gray-800 font-semibold">
                              Total: Rs {(calculateItemPrice(item) * item.quantity).toFixed(0)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-2 hover:bg-red-50 rounded-full group self-start"
                        >
                          <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="lg:w-96">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>Rs {subtotal.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Fee</span>
                      <span>Rs {deliveryFee.toFixed(0)}</span>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span>Rs {total.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="payment-method" className="block text-gray-700 font-semibold mb-2">
                        Payment Method
                      </label>
                      <select
                        id="payment-method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="cod">Cash on Delivery</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg"
                    >
                      Checkout Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BuyNow;
