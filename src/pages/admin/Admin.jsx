import React, { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaChartPie, FaBox, FaUser, FaTruck, FaBell, FaSignOutAlt } from "react-icons/fa";

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      axios
        .get(`https://localhost:3000/api/customer/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then((response) => setUser(response.data))
        .catch((error) => console.error("Error fetching user data:", error.response?.data || error.message));
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear();
      navigate("/");
    }
  };

  const navItems = [
    { path: "dashboard", label: "Dashboard", icon: <FaChartPie /> },
    { path: "manage-props", label: "Manage Props", icon: <FaBox /> },
    { path: "users", label: "Users", icon: <FaUser /> },
    { path: "orders", label: "Orders", icon: <FaTruck /> },
    { path: "requests", label: "Requests", icon: <FaBell /> },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-r from-gray-100 via-white to-gray-100">
      {/* Sidebar */}
      <div className="w-72 bg-black text-white flex flex-col shadow-lg">
        {/* Sidebar Header (Clickable Logo) */}
        <div className="p-6 border-b border-gray-700 flex items-center space-x-4">
          <Link to="/">
            <img
              src="/src/assets/images/logo1.png"
              alt="PropBox Logo"
              className="w-20 h-17 rounded-full cursor-pointer transition-transform transform hover:scale-105"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-wide">PropBox</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-6 py-4">
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center py-2 px-4 rounded-lg cursor-pointer transition duration-200 ${
                    location.pathname.includes(item.path)
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700"
                  }`}
                >
                  {item.icon} <span className="ml-3 text-lg">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="px-6 py-4">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-white font-semibold flex items-center justify-center shadow-md"
          >
            <FaSignOutAlt className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white shadow-md p-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1E2751]">Welcome Back, Admin</h2>
          <div className="flex items-center space-x-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 p-3 rounded-full bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751] text-gray-800 placeholder-gray-500"
            />
            {user?.image ? (
              <img
                src={`https://localhost:3000/profilePicture/${user.image}`}
                alt="Admin Avatar"
                className="w-12 h-12 rounded-full object-cover border-3 border-gray-300 hover:border-gray-500 transition-all"
              />
            ) : (
              <img
                src="https://via.placeholder.com/40"
                alt="Admin Avatar"
                className="w-12 h-12 rounded-full shadow-md"
              />
            )}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="p-8 flex-grow overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Admin;