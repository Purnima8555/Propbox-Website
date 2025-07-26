import axios from 'axios';
import { BookOpen, ChevronRight, LogOut, Package, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderCounts, setOrderCounts] = useState({ purchaseCount: 0, rentCount: 0 });
  const [currentlyReading, setCurrentlyReading] = useState({ count: 0, props: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    contact_no: '',
    address: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        console.error("Missing credentials:", { userId, token });
        setError("Please log in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile
        console.log(`Fetching user profile for userId: ${userId}`);
        const userResponse = await axios.get(`http://localhost:3000/api/customer/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("User response:", userResponse.data);
        setUser(userResponse.data.user || userResponse.data);
        setFormData({
          full_name: userResponse.data.user?.full_name || userResponse.data.full_name || '',
          username: userResponse.data.user?.username || userResponse.data.username || '',
          email: userResponse.data.user?.email || userResponse.data.email || '',
          contact_no: userResponse.data.user?.contact_no || userResponse.data.contact_no || '',
          address: userResponse.data.user?.address || userResponse.data.address || '',
        });
        setImagePreview(
          userResponse.data.user?.image || userResponse.data.image
            ? `http://localhost:3000/profilePicture/${userResponse.data.user?.image || userResponse.data.image}`
            : "/api/placeholder/150/150"
        );

        // Fetch recent orders
        try {
          console.log(`Fetching orders for userId: ${userId}`);
          const ordersResponse = await axios.get(`http://localhost:3000/api/orders/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Orders response:", ordersResponse.data);
          setRecentOrders(ordersResponse.data || []);
        } catch (err) {
          console.error("Error fetching orders:", err.response?.data || err.message);
          setRecentOrders([]);
        }

        // Fetch order counts
        try {
          console.log(`Fetching order counts for userId: ${userId}`);
          const countsResponse = await axios.get(`http://localhost:3000/api/orders/counts/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Order counts response:", countsResponse.data);
          setOrderCounts(countsResponse.data || { purchaseCount: 0, rentCount: 0 });
        } catch (err) {
          console.error("Error fetching order counts:", err.response?.data || err.message);
          setOrderCounts({ purchaseCount: 0, rentCount: 0 });
        }

        // Fetch currently reading
        try {
          console.log(`Fetching currently reading for userId: ${userId}`);
          const readingResponse = await axios.get(`http://localhost:3000/api/orders/currently-reading/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Currently reading response:", readingResponse.data);
          setCurrentlyReading(readingResponse.data || { count: 0, props: [] });
        } catch (err) {
          console.error("Error fetching currently reading:", err.response?.data || err.message);
          setCurrentlyReading({ count: 0, props: [] });
        }
      } catch (err) {
        console.error("Error fetching user profile:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Error fetching profile data. Please try again or contact support.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleEditProfile = () => {
    setIsEditPopupOpen(true);
  };

  const handleChangePassword = () => {
    navigate('/password-reset');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('username', formData.username);
    data.append('email', formData.email);
    data.append('contact_no', formData.contact_no);
    data.append('address', formData.address);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      console.log(`Updating profile for userId: ${userId}`);
      const response = await axios.put(
        `http://localhost:3000/api/customer/${userId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      console.log("Profile updated:", response.data);
      setUser(response.data.customer || response.data.user || response.data);
      setImageFile(null);
      setIsEditPopupOpen(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error.response?.data || error.message);
      alert(`Failed to update profile: ${error.response?.data?.message || "Please try again."}`);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return <div className="text-center py-4">Loading...</div>;
    }

    if (error) {
      return <div className="text-center py-4 text-red-500">{error}</div>;
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
              <h3 className="font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{user?.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Username</p>
                  <p className="font-medium">{user?.username || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user?.contact_no || "N/A"}</p>
                </div>
                <div className="col-span-2 flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">{user?.address || "N/A"}</p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleEditProfile}
                      className="px-4 py-2 bg-black text-white rounded-md"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={handleChangePassword}
                      className="px-4 py-2 bg-black text-white rounded-md"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-300">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{currentlyReading.count}</p>
                  <p className="text-sm text-gray-600">Currently Renting</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{orderCounts.rentCount}</p>
                  <p className="text-sm text-gray-600">Total Rented</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{orderCounts.purchaseCount}</p>
                  <p className="text-sm text-gray-600">Total Purchased</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-300">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Recent Orders</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {recentOrders.length === 0 ? (
                  <p className="text-gray-600">No recent orders found.</p>
                ) : (
                  recentOrders.map(order => (
                    <div key={order.id} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Date: {new Date(order.order_date).toLocaleDateString()}</p>
                        <p>Type: {order.items[0].type}</p>
                        <p>Items: {order.items.map(item => item.prop_id.name).join(", ")}</p>
                        <p>Total: Rs {order.total_price}</p>
                        <p>Payment Status: {order.paymentStatus}</p>
                      </div>
                      <button className="text-blue-600 text-sm mt-2 flex items-center">
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      case 'currentlyReading':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-300">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Currently Renting</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {currentlyReading.props.length === 0 ? (
                  <p className="text-gray-600">No props currently being rented.</p>
                ) : (
                  currentlyReading.props.map(prop => (
                    <div key={prop.prop_id} className="border border-gray-300 rounded-lg p-4 flex items-center">
                      <div className="mr-4">
                        {prop.image ? (
                          <img
                            src={`http://localhost:3000/prop_images/${prop.image}`}
                            alt={prop.name}
                            className="w-15 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-15 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{prop.name}</span>
                          <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>Prop ID: {prop.prop_id}</p>
                          <p>Quantity: {prop.quantity}</p>
                          <p>Rental Price: Rs {prop.rental_price}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-6xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-300">
              <div className="flex items-center">
                <img
                  src={user?.image ? `http://localhost:3000/profilePicture/${user.image}` : "/api/placeholder/150/150"}
                  alt={user?.username || "User"}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">{user?.full_name || "Loading..."}</h1>
                  <p className="text-gray-600">{user?.email || "Loading..."}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-300">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`w-full flex items-center px-4 py-3 text-sm ${
                        activeTab === 'profile'
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <User className="w-5 h-5 mr-3" />
                      Profile
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={`w-full flex items-center px-4 py-3 text-sm ${
                        activeTab === 'orders'
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Package className="w-5 h-5 mr-3" />
                      Orders
                    </button>
                    <button
                      onClick={() => setActiveTab('currentlyReading')}
                      className={`w-full flex items-center px-4 py-3 text-sm ${
                        activeTab === 'currentlyReading'
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <BookOpen className="w-5 h-5 mr-3" />
                      Currently Renting
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5 mr-3" />
                      Logout
                    </button>
                  </nav>
                </div>
              </div>

              {/* Main Content */}
              <div className="md:col-span-3">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Popup */}
      {isEditPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={imagePreview}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover cursor-pointer"
                  onClick={() => document.getElementById('imageInput').click()}
                />
                <input
                  id="imageInput"
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  name="contact_no"
                  value={formData.contact_no}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditPopupOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Profile;