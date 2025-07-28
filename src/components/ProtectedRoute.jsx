import { useRef } from "react";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const toastShown = useRef(false); // 👈 Prevents duplicate toasts

  if (!token) {
    if (!toastShown.current) {
      toast.error("Please log in to continue.");
      toastShown.current = true;
    }
    return <Navigate to="/otp" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (!toastShown.current) {
      toast.error("Access denied. Only admin can access the admin panel.");
      toastShown.current = true;
    }
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
