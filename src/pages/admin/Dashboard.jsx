import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [bookCount, setBookCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (!token || role !== "Admin") {
          throw new Error("Please log in as an admin to view dashboard activity");
        }

        const [notifResponse, bookCountResponse, customerCountResponse, pendingRequestResponse] = await Promise.all([
          axios.get("http://localhost:3000/api/notifications/all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/books/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/customer/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3000/api/book-request/pending/count", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Admin notifications response:", notifResponse.data);
        console.log("Book count response:", bookCountResponse.data);
        console.log("Customer count response:", customerCountResponse.data);
        console.log("Pending request count response:", pendingRequestResponse.data);

        setNotifications(notifResponse.data);
        setBookCount(bookCountResponse.data.count);
        setCustomerCount(customerCountResponse.data.count);
        setPendingRequestCount(pendingRequestResponse.data.count);
      } catch (err) {
        console.error("Error fetching dashboard data:", err.response || err);
        setError(err.response?.data?.message || err.message || "Error fetching activity");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseNotification = (notif) => {
    const message = notif.message;

    // Handle order notifications from placeOrder
    const orderRegex = /New order #(.+?) placed by (.+?) for "(.+?)"(?: and (\d+) other book\(s\))?\. Total: Rs (\d+\.?\d*)\. Payment: (.+?)\./;
    const orderMatch = message.match(orderRegex);
    if (orderMatch) {
      return {
        type: "order",
        orderId: orderMatch[1],
        user: orderMatch[2],
        firstBook: orderMatch[3],
        otherBooks: orderMatch[4] ? parseInt(orderMatch[4], 10) : 0,
        total: orderMatch[5],
        paymentMethod: orderMatch[6],
      };
    }

    // Handle book request notifications
    const requestRegex = /New book request awaiting approval: "(.+?)" by (.+?) \(User: (.+?), Request ID: (.+?)\)/;
    const requestMatch = message.match(requestRegex);
    if (requestMatch) {
      return {
        type: "bookRequest",
        bookTitle: requestMatch[1],
        author: requestMatch[2],
        user: requestMatch[3],
        requestId: requestMatch[4],
      };
    }

    // Fallback for other or old notifications
    return {
      type: "unknown",
      user: "Unknown User",
      details: "Unknown action",
    };
  };

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
      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-gradient-to-r from-[#1E2751] to-[#223963] text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold">Total Books</h3>
          <p className="text-3xl font-bold mt-4">{loading ? "..." : bookCount}</p>
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
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-600">No recent activity found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notif) => {
                const parsed = parseNotification(notif);
                return (
                  <li key={notif._id} className="py-4 flex justify-between items-center">
                    <p className="text-gray-700">
                      {parsed.type === "order" ? (
                        <>
                          Order <span className="font-bold">#{parsed.orderId}</span> placed by{" "}
                          <span className="font-bold">{parsed.user}</span> for{" "}
                          <span className="font-bold">"{parsed.firstBook}"</span>
                          {parsed.otherBooks > 0 ? ` and ${parsed.otherBooks} other book(s)` : ""}.
                          Total: Rs <span className="font-bold">{parsed.total}</span>, Paid via{" "}
                          <span className="font-bold">{parsed.paymentMethod}</span>.
                        </>
                      ) : parsed.type === "bookRequest" ? (
                        <>
                          <span className="font-bold">{parsed.user}</span> requested{" "}
                          <span className="font-bold">"{parsed.bookTitle}"</span> by {parsed.author}.
                        </>
                      ) : (
                        notif.message
                      )}
                    </p>
                    <span className="text-sm text-gray-500">{formatTime(notif.createdAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;