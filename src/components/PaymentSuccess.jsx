import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAndPlaceOrder = async () => {
      const sessionId = searchParams.get("session_id");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!sessionId || !token || !userId) {
        setMessage("Invalid payment session or user not logged in.");
        setLoading(false);
        return;
      }

      try {
        // Verify payment session
        const sessionRes = await axios.get(`http://localhost:3000/api/payments/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const paymentIntentId = sessionRes.data.payment_intent;

        // Check if order already exists
        const existingOrderRes = await axios.get(`http://localhost:3000/api/orders/check/${paymentIntentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (existingOrderRes.data.exists) {
          console.log("🔁 Order already exists for this paymentIntentId, skipping.");
          setMessage("Order already placed successfully.");
          setLoading(false);
          return;
        }

        // Fetch cart items
        const cartResponse = await axios.get(`http://localhost:3000/api/cart/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cart = cartResponse.data;
        if (!cart || cart.length === 0) throw new Error("Cart is empty or invalid.");

        // Build order data
        const orderData = {
          user_id: userId,
          items: cart.map(item => ({
            prop_id: item.prop_id._id || item.prop_id,
            quantity: item.quantity,
            type: item.type,
            rentalDays: item.rentalDays || 0,
          })),
          deliveryFee: 0,
          total_price: cart.reduce((sum, item) => sum + item.totalPrice, 0),
          paymentMethod: "online",
          paymentIntentId,
          paymentStatus: "done",
        };

        // Place order
        const response = await axios.post("http://localhost:3000/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // clear cart
        await axios.delete(`http://localhost:3000/api/cart/clear/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        toast.success(`✅ Order placed successfully!\nPayment Status: ${response.data.paymentStatus}`);

        navigate("/category", {
          state: {
            orderId: response.data._id,
            paymentStatus: response.data.paymentStatus,
          },
        });

      } catch (err) {
        console.error("❌ Error placing order after payment:", err);
        if (err.response?.status === 403) {
          toast.error("⚠️ Unauthorized: Please login again.");
          navigate("/signIn");
        } else {
          toast.error(`❌ Failed to place order: ${err.response?.data?.message || err.message}`);
        }
        setMessage("Payment successful but failed to place order.");
        setLoading(false);
      }
    };

    verifyAndPlaceOrder();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-4">
      {loading ? (
        <p>{message}</p>
      ) : (
        <>
          <p>{message}</p>
          {!message.includes("successfully") && (
            <button
              onClick={() => navigate("/cart")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Cart
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
