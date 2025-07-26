import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import axios from "axios";

const API_URL = "http://localhost:3000/api/props";

const ManageProps = () => {
  const navigate = useNavigate();
  const [propList, setPropList] = useState([]);

  useEffect(() => {
    fetchProps();
  }, []);

  const fetchProps = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPropList(response.data);
    } catch (error) {
      console.error("Error fetching props:", error.response?.data || error.message);
      alert(`Error fetching props: ${error.response?.data?.message || error.message}`);
    }
  };

  const deleteProp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prop?")) return;

    try {
      await axios.delete(`${API_URL}/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setPropList(propList.filter((prop) => prop._id !== id));
      alert('Prop deleted successfully');
    } catch (error) {
      console.error("Error deleting prop:", error.response?.data || error.message);
      alert(`Error deleting prop: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="p-8 bg-gray-50 flex-grow">
      <div className="bg-white rounded-xl shadow-lg p-6 h-[450px] overflow-y-auto">
        <h3 className="text-2xl font-semibold text-[#1E2751] mb-6">Manage Props</h3>

        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 text-left top-0 z-10">
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Category</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {propList.map((prop) => (
              <tr key={prop._id} className="border-t border-gray-200">
                <td className="px-6 py-4">{prop.name}</td>
                <td className="px-6 py-4">{prop.category.join(', ')}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-4 py-2 text-sm font-semibold rounded-full ${
                      prop.availability_status === "yes"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {prop.availability_status === "yes" ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 flex">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-4"
                    onClick={() => navigate(`/admin/update-prop/${prop._id}`)}
                  >
                    <FaEdit className="text-xl" />
                  </button>
                  <button
                    onClick={() => deleteProp(prop._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrashAlt className="text-xl" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Prop Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => navigate("/admin/add-prop")}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          Add New Prop
        </button>
      </div>
    </div>
  );
};

export default ManageProps;