import React, { useState } from "react";
import axios from "axios";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaHome, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UserForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    image: null,
    full_name: "",
    username: "",
    email: "",
    role: "User",
    address: "",
    phone_no: "",
    password: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handle text and select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // Prepare form data for multipart/form-data request
    const data = new FormData();
    data.append("image", formData.image);
    data.append("full_name", formData.full_name);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("role", formData.role);
    data.append("address", formData.address);
    data.append("contact_no", formData.phone_no);
    data.append("password", formData.password);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please log in as an admin to add a user");
      }

      const response = await axios.post("https://localhost:3000/api/customer/save", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("User added successfully:", response.data);
      setSuccess(true);

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          image: null,
          full_name: "",
          username: "",
          email: "",
          role: "User",
          address: "",
          phone_no: "",
          password: "",
        });
        setImagePreview(null);
        setSuccess(false);
        navigate("/admin/users");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error adding user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-4 border border-gray-300">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25"></div>
              <FaUser className="w-20 h-20 text-green-500 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1E2751] to-green-600 mb-4">
              User Added Successfully!
            </h2>
            <p className="text-gray-700 text-center">The new user has been added to the system.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Image Upload */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer flex items-center justify-center w-32 h-32 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <FaCamera className="text-gray-500 text-2xl" />
                  )}
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500">Click to upload an image</p>
              </div>
            </div>

            {/* Grid Layout for Fields */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="group">
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Full Name*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Enter full name"
                    />
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaUser className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                  </div>
                </div>

                {/* Username */}
                <div className="group">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Username*
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Enter username"
                    />
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaUser className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Email*
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Enter email"
                    />
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaEnvelope className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div className="group">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Role*
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 appearance-none transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaUser className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="https://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Address */}
                <div className="group">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Enter address"
                    />
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaHome className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="group">
                  <label htmlFor="phone_no" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Phone Number*
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone_no"
                      name="phone_no"
                      value={formData.phone_no}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Enter phone number"
                    />
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaPhone className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-[#1E2751] transition-colors">
                    Password*
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#1E2751] pl-12 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                      placeholder="Enter password"
                    />
                    <div className="absolute left-3 top-2 bg-[#1E2751]/10 p-1 rounded-md">
                      <FaLock className="h-4 w-4" style={{ color: "#1E2751" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#1E2751] text-white font-medium rounded-lg hover:bg-[#2A3A7A] focus:outline-none focus:ring-2 focus:ring-[#1E2751] focus:ring-offset-2 transition-all transform hover:scale-[1.01] shadow-md disabled:opacity-50"
              >
                {loading ? "Adding User..." : "Add User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserForm;