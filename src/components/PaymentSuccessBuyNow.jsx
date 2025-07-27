import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

const PaymentSuccessBuyNow = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your Buy Now payment...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAndPlaceOrder = async () => {
      const sessionId = searchParams.get("session_id");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!sessionId || !token || !userId) {
        setMessage("Invalid session or not logged in.");
        setLoading(false);
        return;
      }

      try {
        // Get Stripe session details
        const sessionRes = await axios.get(`http://localhost:3000/api/payments/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { metadata, payment_intent: paymentIntentId } = sessionRes.data;

        // Check if order already exists
        const existsRes = await axios.get(`http://localhost:3000/api/orders/check/${paymentIntentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (existsRes.data.exists) {
          setMessage("Order already placed.");
          setLoading(false);
          return;
        }

        // Construct order data from Stripe metadata
        const orderData = {
          user_id: userId,
          items: JSON.parse(metadata.items),
          deliveryFee: Number(metadata.deliveryFee),
          total_price: Number(metadata.total_price),
          paymentIntentId,
          paymentMethod: "online",
          paymentStatus: "done",
        };

        // Place order
        const orderRes = await axios.post("http://localhost:3000/api/orders", orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast.success("Order Placed!");
        navigate("/orders", {
          state: {
            orderId: orderRes.data._id,
            paymentStatus: orderRes.data.paymentStatus,
          },
        });
      } catch (err) {
        console.error("Order placement error:", err);
        toast.error("⚠️ Payment done, but order failed.");
        setMessage("Payment successful but order placement failed.");
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
          {!message.includes("success") && (
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Back to Home
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentSuccessBuyNow;
