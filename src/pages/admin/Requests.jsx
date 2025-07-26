import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRegIdCard } from "react-icons/fa";

const API_URL = "http://localhost:3000/api/book-request";

const Requests = () => {
  const [requestList, setRequestList] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Please log in to view book requests");
        }

        const response = await axios.get(`${API_URL}/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Fetched book requests:", response.data);
        setRequestList(response.data);
      } catch (err) {
        console.error("Error fetching book requests:", err.response || err);
        setError(err.response?.data?.message || err.message || "Error fetching book requests");
      } finally {
        setLoading(false);
      }
    };

    fetchBookRequests();
  }, []);

  // Update status with API call
  const updateRequestStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in to update request status");
      }

      const response = await axios.put(
        `${API_URL}/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`Updated request ${id} to status: ${status}`, response.data);
      setRequestList(
        requestList.map((request) =>
          request._id === id ? response.data.bookRequest : request
        )
      );
    } catch (err) {
      console.error(`Error updating request to ${status}:`, err.response || err);
      setError(err.response?.data?.message || `Error updating request to ${status}`);
    }
  };

  // Action handlers using updateRequestStatus
  const approveRequest = (id) => updateRequestStatus(id, "approved");
  const rejectRequest = (id) => updateRequestStatus(id, "rejected");
  const fulfillRequest = (id) => updateRequestStatus(id, "fulfilled");

  const handleView = (id) => {
    const request = requestList.find((r) => r._id === id);
    if (request) {
      setSelectedRequest(request);
      setShowForm(true);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedRequest(null);
  };

  return (
    <div className="p-8 bg-gray-50 flex-grow">
      {/* Requests Management Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 h-[500px] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-[#1E2751] mb-6">Manage Requests</h3>

        {loading ? (
          <p className="text-center text-gray-600">Loading book requests...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : requestList.length === 0 ? (
          <p className="text-center text-gray-600">No book requests found.</p>
        ) : (
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100 text-left sticky top-0 z-10">
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Book Title</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Request Date</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requestList.map((request) => (
                <tr key={request._id} className="border-t border-gray-200">
                  <td className="px-6 py-4">{request.userId?.full_name || request.userId?.username || "Unknown"}</td>
                  <td className="px-6 py-4">{request.title}</td>
                  <td className="px-6 py-4">{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-4 py-2 text-sm font-semibold rounded-full ${
                        request.status === "pending"
                          ? "bg-yellow-500 text-white"
                          : request.status === "approved"
                          ? "bg-green-500 text-white"
                          : request.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex items-center">
                    <button
                      onClick={() => handleView(request._id)}
                      className="text-blue-600 hover:text-blue-800 mr-4"
                    >
                      <FaRegIdCard className="inline-block" size={20} />
                    </button>
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => approveRequest(request._id)}
                          className="text-green-600 hover:text-green-800 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(request._id)}
                          className="text-red-600 hover:text-red-800 mr-4"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => fulfillRequest(request._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Fulfilled
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Request Form */}
      {showForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-8 w-[28rem] max-w-full">
            <h3 className="text-2xl font-bold text-[#1E2751] mb-6 border-b pb-2">Book Request Details</h3>

            <div className="space-y-6">
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">User:</label>
                <p className="w-2/3 text-gray-900">
                  {selectedRequest.userId?.full_name || selectedRequest.userId?.username || "Unknown"}
                </p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Book Title:</label>
                <p className="w-2/3 text-gray-900">{selectedRequest.title}</p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Author:</label>
                <p className="w-2/3 text-gray-900">{selectedRequest.author}</p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">ISBN:</label>
                <p className="w-2/3 text-gray-900 italic">
                  {selectedRequest.isbn || "Not provided"}
                </p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Urgency:</label>
                <p className="w-2/3 text-gray-900">
                  {selectedRequest.urgency.charAt(0).toUpperCase() + selectedRequest.urgency.slice(1)}
                </p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Reason:</label>
                <p className="w-2/3 text-gray-900">
                  {selectedRequest.reason
                    .replace("not-in-system", "Not in System")
                    .replace("out-of-stock", "Out of Stock")
                    .replace("new-release", "New Release")}
                </p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Additional Info:</label>
                <p className="w-2/3 text-gray-900 italic">
                  {selectedRequest.additionalInfo || "Not provided"}
                </p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Status:</label>
                <p className="w-2/3 text-gray-900">
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </p>
              </div>
              <div className="flex items-start">
                <label className="w-1/3 font-semibold text-gray-700">Request Date:</label>
                <p className="w-2/3 text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeForm}
                className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;