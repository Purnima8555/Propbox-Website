import axios from "axios";
import { useEffect, useState } from "react";
import { FaRegIdCard, FaTrashAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  // Fetch data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found. Redirecting to login.");
      navigate("/otp");
      return;
    }

    axios
      .get("https://localhost:3000/api/customer", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("There was an error fetching the user data!", error);
        if (error.response?.status === 401) {
          console.error("Unauthorized access. Redirecting to login.");
          navigate("/otp");
        }
      });
  }, [navigate]);

  // Function to handle deleting a user by ID
  const handleDelete = async (userId) => {
    if (!userId) {
      console.error("User ID is missing!");
      return;
    }

    // Add confirmation prompt
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in.");
      }

      const response = await axios.delete(`https://localhost:3000/api/customer/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("User deleted successfully:", response.data);
      // Update the state to remove the deleted user
      setUsers(users.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("There was an error deleting the user:", error.response || error);
      alert(error.response?.data?.message || "Failed to delete user. Please try again.");
    }
  };

  // Function to handle viewing a user by ID
  const handleView = (userId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found. Redirecting to login.");
      navigate("/otp");
      return;
    }

    axios
      .get(`https://localhost:3000/api/customer/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setSelectedUser(response.data);
        setShowForm(true);
      })
      .catch((error) => {
        console.error("There was an error fetching the user details!", error);
        if (error.response?.status === 401) {
          console.error("Unauthorized access. Redirecting to login.");
          navigate("/otp");
        }
      });
  };

  // Close the view form
  const closeForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  return (
    <div className="p-8 bg-gray-50 flex-grow">
      {/* Users List Section */}
      <div className="bg-white rounded-xl shadow-lg p-6 h-[450px] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-[#1E2751] mb-6">Users</h3>

        {/* User Table */}
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left top-0 z-10">
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Full Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-gray-200">
                <td className="px-6 py-4">{user.full_name}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full ${
                      user.role === "Admin" ? "bg-blue-500 text-white" : "bg-yellow-500 text-white"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => handleView(user._id)}
                  >
                    <FaRegIdCard className="inline-block mr-2" size={20} />
                  </button>
                  <button
                    className="ml-4 text-red-600 hover:text-red-800"
                    onClick={() => handleDelete(user._id)}
                  >
                    <FaTrashAlt className="inline-block mr-2" size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate("/admin/userForm")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      {/* View User Form */}
      {showForm && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <h3 className="text-2xl font-semibold text-[#1E2751] mb-6">User Details</h3>

            {/* Image Preview */}
            <div className="absolute top-6 right-6">
              {selectedUser.image ? (
                <img
                  src={
                    selectedUser.imagePreview
                      ? selectedUser.imagePreview
                      : `https://localhost:3000/profilePicture/${selectedUser.image}`
                  }
                  alt="User"
                  className="w-24 h-24 object-cover border-2 border-gray-300"
                />
              ) : (
                <p className="text-gray-500 font-semibold text-xs">*No Image uploaded!</p>
              )}
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label className="font-semibold">Full Name:</label>
              <p>{selectedUser.full_name}</p>
            </div>

            {/* Username */}
            <div className="mb-4">
              <label className="font-semibold">Username:</label>
              <p>{selectedUser.username}</p>
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="font-semibold">Email:</label>
              <p>{selectedUser.email}</p>
            </div>

            {/* Contact Number */}
            <div className="mb-4">
              <label className="font-semibold">Contact No:</label>
              <p>{selectedUser.contact_no}</p>
            </div>

            {/* Role */}
            <div className="mb-4">
              <label className="font-semibold">Role:</label>
              <p>{selectedUser.role}</p>
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="font-semibold">Address:</label>
              <p className={selectedUser.address ? "text-gray-700" : "text-gray-500 font-semibold text-xs"}>
                {selectedUser.address ? selectedUser.address : "*Address not provided!"}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeForm}
                className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700"
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

export default Users;