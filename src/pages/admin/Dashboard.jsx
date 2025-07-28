import axios from "axios";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activityLogs, setActivityLogs] = useState([]);
  const [propCount, setPropCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Prevent duplicate API calls
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (actionLoading) return; // Prevent multiple API calls
      setActionLoading(true);
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "Admin") {
          throw new Error("Please log in as an admin to view dashboard activity");
        }

        const [logResponse, propCountResponse, customerCountResponse, pendingRequestResponse] = await Promise.all([
          axios.get("https://localhost:3000/api/activity-logs", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://localhost:3000/api/props/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://localhost:3000/api/customer/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://localhost:3000/api/prop-requests/pending/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Activity logs response:", logResponse.data, "Type:", Array.isArray(logResponse.data) ? "Array" : typeof logResponse.data);
        console.log("Prop count response:", propCountResponse.data);
        console.log("Customer count response:", customerCountResponse.data);
        console.log("Pending request count response:", pendingRequestResponse.data);

        // Ensure activityLogs is always an array
        setActivityLogs(Array.isArray(logResponse.data) ? logResponse.data : []);
        setPropCount(propCountResponse.data.count || 0);
        setCustomerCount(customerCountResponse.data.count || 0);
        setPendingRequestCount(pendingRequestResponse.data.count || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err.response || err);
        const errorMessage = err.response?.data?.message || err.message || "Error fetching activity";
        setError(errorMessage);
        toast.error(errorMessage);
        if (err.response?.status === 401) {
          navigate('/otp');
        }
      } finally {
        setLoading(false);
        setActionLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="p-2 bg-gray-50 flex-grow">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-r from-[#1E2751] to-[#223963] text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold">Total Props</h3>
          <p className="text-3xl font-bold mt-4">{loading ? "..." : propCount}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold">Active Users</h3>
          <p className="text-3xl font-bold mt-4">{loading ? "..." : customerCount}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold">Pending Requests</h3>
          <p className="text-3xl font-bold mt-4">{loading ? "..." : pendingRequestCount}</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-[#1E2751] mb-4">Recent Activity</h3>
        <div className="bg-white rounded-xl shadow-lg p-6 h-[353px] overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-600">Loading recent activity...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : activityLogs.length === 0 ? (
            <p className="text-center text-gray-600">No recent activity found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {activityLogs.map((log) => (
                <li key={log._id} className="py-4 flex justify-between items-center">
                  <p className="text-gray-700">
                    <span className="font-bold">{log.userId?.username || "Unknown User"}</span> ({log.role}) performed{" "}
                    <span className="font-bold">{log.action}</span>: {log.details}
                  </p>
                  <span className="text-sm text-gray-500">{formatTime(log.timestamp)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;