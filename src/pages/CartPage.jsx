import { ArrowLeft, Trash2, PlusCircle, MinusCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51Roge591HJqvjmUhXPywsJe1Yel29BfpPBCmhp37ZkfqI7uPbkv2XDpfuj10KIn3uCtm7skq3RfXUSHrzwu1tZ7g00pEb3800o");

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [stripeSessionId, setStripeSessionId] = useState(null);
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = cartItems.length > 0 ? 100 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const fetchCart = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) {
        setError("Please log in to view your cart.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(response.data || []);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setCartItems([]);
        } else {
          setError(err.response?.data?.message || "Error fetching cart items");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  useEffect(() => {
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  if (!sessionId) return;

  alert("🎉 Payment successful! Your order has been placed.");
  navigate("/category"); // or "/category" or a custom success page
}, []);


  const handleQuantityChange = (id, delta) => {
    const item = cartItems.find((item) => item._id === id);
    const newQuantity = Math.max(1, item.quantity + delta);
    updateCartItem(id, { quantity: newQuantity });
  };

  const handleRentalDaysChange = (id, delta) => {
    const item = cartItems.find((item) => item._id === id);
    const newRentalDays = Math.max(7, (item.rentalDays || 7) + delta * 7);
    updateCartItem(id, { rentalDays: newRentalDays });
  };

  const updateCartItem = async (id, updates) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`http://localhost:3000/api/cart/update/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((items) =>
        items.map((item) => (item._id === id ? { ...item, ...response.data.cart } : item))
      );
    } catch (err) {
      console.error("Error updating cart item:", err);
      alert("Failed to update cart item.");
    }
  };

  const removeItem = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/cart/remove/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems((items) => items.filter((item) => item._id !== id));
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item.");
    }
  };

  const handleCheckout = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("Please log in to proceed with checkout.");
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
        const response = await axios.post(
          "http://localhost:3000/api/payments/create-checkout-session",
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const stripe = await stripePromise;
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.sessionId,
        });
        if (error) {
          console.error("Stripe redirect error:", error);
          alert("Failed to redirect to Stripe Checkout.");
        }
      } catch (err) {
        console.error("Stripe session error:", err);
        alert("Failed to create checkout session.");
      }
    } else {
      try {
        const response = await axios.post("http://localhost:3000/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await axios.delete(`http://localhost:3000/api/cart/clear/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems([]);
        alert(`Order placed successfully!`);
        navigate("/orders");
      } catch (error) {
        console.error("COD order error:", error);
        alert("Failed to place order.");
      }
    }
  };

  const handleContinueShopping = () => {
    navigate("/category");
  };

  if (loading) return <div className="text-center p-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 p-10">{error}</div>;

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
                <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
                <span className="text-gray-500">{cartItems.length} items</span>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">Your cart is empty.</p>
                  <p className="text-gray-500 mt-2">Start adding props to your cart now!</p>
                  <button
                    onClick={() => navigate("/")}
                    className="mt-4 bg-black hover:bg-black text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:border-blue-100 transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      <div className="relative group">
                        <img
                          src={
                            item.prop_id.image
                              ? `http://localhost:3000/prop_images/${item.prop_id.image}`
                              : "/default-prop-cover.jpg"
                          }
                          alt={item.prop_id.name}
                          className="w-28 h-40 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex-1 flex gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">{item.prop_id.name}</h3>
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
                            {item.type === "purchase" ? (
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => handleQuantityChange(item._id, -1)}
                                  className="hover:text-blue-600"
                                >
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                                <input
                                  type="number"
                                  value={item.quantity}
                                  readOnly
                                  className="w-16 px-2 py-1 border rounded text-center"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item._id, 1)}
                                  className="hover:text-blue-600"
                                >
                                  <PlusCircle className="w-5 h-5" />
                                </button>
                                <span className="text-gray-600">Quantity</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mt-1">
                                <button
                                  onClick={() => handleRentalDaysChange(item._id, -1)}
                                  className="hover:text-blue-600"
                                >
                                  <MinusCircle className="w-5 h-5" />
                                </button>
                                <input
                                  type="number"
                                  value={Math.round(item.rentalDays / 7)}
                                  readOnly
                                  className="w-16 px-2 py-1 border rounded text-center"
                                />
                                <button
                                  onClick={() => handleRentalDaysChange(item._id, 1)}
                                  className="hover:text-blue-600"
                                >
                                  <PlusCircle className="w-5 h-5" />
                                </button>
                                <span className="text-gray-600">Rental Weeks</span>
                              </div>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-gray-800 font-semibold">
                              Total: Rs {item.totalPrice.toFixed(0)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item._id)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors group self-start"
                        >
                          <Trash2 className="h-5 w-5 text-gray-400 group-hover:text-red-500 transition-colors" />
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
                      <label
                        htmlFor="payment-method"
                        className="block text-gray-700 font-semibold mb-2"
                      >
                        Payment Method
                      </label>
                      <select
                        id="payment-method"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                      >
                        <option value="cod">Cash on Delivery</option>
                        <option value="online">Online Payment</option>
                      </select>
                    </div>
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-black hover:bg-black text-white font-semibold py-3 px-4 rounded-lg transition-colors"
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

export default CartPage;