import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";

const PaymentSuccessPage = () => {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Verifying your payment...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPaymentSession = async () => {
      const sessionId = searchParams.get("session_id");
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (!sessionId || !token || !userId) {
        setMessage("Invalid payment session or user not logged in.");
        setLoading(false);
        return;
      }

      try {
        // Optional: verify session info from backend (paymentIntent etc)
        await axios.get(`http://localhost:3000/api/payments/session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Optional: clear local cart here or just let webhook clear backend cart
        // localStorage.removeItem("cart"); // if you store cart locally

        setMessage("🎉 Payment successful! Your order is being processed.");
        setLoading(false);

        // Redirect after a delay
        setTimeout(() => {
          navigate("/orders"); // redirect to orders page or wherever
        }, 3000);
      } catch (err) {
        console.error("Error verifying payment session:", err);
        setMessage("Payment successful but failed to verify payment.");
        setLoading(false);
      }
    };

    verifyPaymentSession();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading ? (
        <p>{message}</p>
      ) : (
        <>
          <p>{message}</p>
          {!message.includes("successful") && (
            <button onClick={() => navigate("/cart")}>Back to Cart</button>
          )}
        </>
      )}
    </div>
  );
};

export default PaymentSuccessPage;
