import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegIdCard, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedStatus, setUpdatedStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setError("Please log in to view orders.");
        setLoading(false);
        navigate('/otp');
        return;
      }

      try {
        const response = await axios.get("https://localhost:3000/api/orders/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.message || "Error fetching orders");
        if (err.response?.status === 401) {
          console.error("Unauthorized access. Redirecting to login.");
          navigate('/otp');
        } else if (err.response?.status === 403) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleView = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setUpdatedStatus(order.status);
      setShowForm(true);
    } else {
      console.error("Order not found in state!");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to delete orders.");
      navigate('/otp');
      return;
    }

    try {
      await axios.delete(`https://localhost:3000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter(order => order.id !== orderId));
      alert("Order deleted successfully!");
    } catch (err) {
      console.error("Error deleting order:", err);
      alert(err.response?.data?.message || "Failed to delete order.");
      if (err.response?.status === 401) {
        console.error("Unauthorized access. Redirecting to login.");
        navigate('/otp');
      }
    }
  };

  const handleStatusChange = (e) => {
    setUpdatedStatus(e.target.value);
  };

  const handleUpdateStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please log in to update order status.");
      navigate('/otp');
      return;
    }

    try {
      const response = await axios.patch(
        `https://localhost:3000/api/orders/status/${selectedOrder.id}`,
        { status: updatedStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders(orders.map(order =>
        order.id === selectedOrder.id ? { ...order, status: updatedStatus } : order
      ));
      setSelectedOrder({ ...selectedOrder, status: updatedStatus });
      alert("Order status updated successfully!");
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(err.response?.data?.message || "Failed to update order status.");
      if (err.response?.status === 401) {
        console.error("Unauthorized access. Redirecting to login.");
        navigate('/otp');
      }
    }
  };

  const handleAddOrder = () => {
    navigate('/admin/orders/add');
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedOrder(null);
    setUpdatedStatus("");
  };

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-8 bg-gray-50 flex-grow">
      {/* Orders List Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 h-[450px] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-[#1E2751] mb-6">Orders</h3>

        {/* Order Table */}
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Order ID</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No orders found.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-200">
                  <td className="px-6 py-4">{order.id}</td>
                  <td className="px-6 py-4">{order.user?.full_name || "Unknown User"}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-4 py-2 text-sm font-semibold rounded-full ${
                        order.status === "Shipped"
                          ? "bg-green-500 text-white"
                          : order.status === "Processing"
                          ? "bg-yellow-500 text-white"
                          : order.status === "Delivered"
                          ? "bg-blue-500 text-white"
                          : order.status === "Pending"
                          ? "bg-gray-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleView(order.id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaRegIdCard className="inline-block mr-2" size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <FaTrashAlt className="inline-block mr-2" size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* View Order Form */}
      {showForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <h3 className="text-2xl font-semibold text-[#1E2751] mb-6">Order Details</h3>

            {/* User Info */}
            <div className="mb-4">
              <label className="font-semibold">User:</label>
              <p>{selectedOrder.user?.full_name || "Unknown User"}</p>
            </div>

            {/* Order ID */}
            <div className="mb-4">
              <label className="font-semibold">Order ID:</label>
              <p>{selectedOrder.id}</p>
            </div>

            {/* Items */}
            <div className="mb-4">
              <label className="font-semibold">Items:</label>
              <p>{selectedOrder.items.map(item => item.prop_id?.name || "Unknown Prop").join(", ") || "No items"}</p>
            </div>

            {/* Grid Layout for Specific Fields */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="font-semibold">Total Price:</label>
                <p>Rs {selectedOrder.total_price || 0}</p>
              </div>
              <div>
                <label className="font-semibold">Delivery Fee:</label>
                <p>Rs {selectedOrder.deliveryFee || 0}</p>
              </div>
              <div>
                <label className="font-semibold">Payment Method:</label>
                <p>{selectedOrder.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <label className="font-semibold">Payment Status:</label>
                <p>{selectedOrder.paymentStatus || "N/A"}</p>
              </div>
              <div>
                <label className="font-semibold">Order Status:</label>
                <select
                  value={updatedStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="font-semibold">Order Date:</label>
                <p>{new Date(selectedOrder.order_date).toLocaleDateString() || "N/A"}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={closeForm}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;