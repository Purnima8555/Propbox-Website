import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';

const PropForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: [],
    description: '',
    purchase_price: '',
    rental_price: '',
    available_stock: '',
    availability_status: 'no',
    hasDiscount: 'no',
    discount_type: '',
    discount_percent: '',
    discount_start: '',
    discount_end: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categories = [
    "Costume",
    "Accessory & Props",
    "Makeup & Hair",
    "Set & Stage Decor"
  ];
  
  const categoryOptions = categories.map(c => ({ value: c, label: c }));
  
  const handleCategoryChange = (selectedOptions) => {
    setFormData(prev => ({
      ...prev,
      category: selectedOptions.map(option => option.value)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };

      // Recalculate rental_price when purchase_price changes
      if (name === 'purchase_price') {
        const priceValue = parseFloat(value);
        if (!isNaN(priceValue)) {
          updatedData.rental_price = Math.round(priceValue * 0.05);
        }
      }

      // Update availability_status based on available_stock
      if (name === 'available_stock') {
        updatedData.availability_status = parseInt(value) > 0 ? 'yes' : 'no';
      }

      return updatedData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    for (const [key, value] of Object.entries(formData)) {
      if (key === 'image' && value) {
        formDataToSend.append('image', value);
      } else if (key === 'category') {
        formDataToSend.append('category', JSON.stringify(value));
      } else {
        formDataToSend.append(key, value);
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await axios.post('https://localhost:3000/api/props/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Prop added:', response.data);
      alert('Prop added successfully');
      setFormData({
        name: '',
        category: [],
        description: '',
        purchase_price: '',
        rental_price: '',
        available_stock: '',
        availability_status: 'no',
        hasDiscount: 'no',
        discount_type: '',
        discount_percent: '',
        discount_start: '',
        discount_end: '',
        image: null
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error adding prop:', error.response?.data || error.message);
      alert(`Error adding prop: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-3/4 mx-auto">
        <h1 className="text-2xl font-semibold text-center text-[#1E2751] mb-6">Prop Detail Form</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-gray-500">Upload Prop Image</p>
                  <p className="text-sm text-gray-400">(Max size: 5MB)</p>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-100"
            >
              Choose Image
            </label>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Category</label>
              <Select
                options={categoryOptions}
                isMulti
                value={categoryOptions.filter(option => formData.category.includes(option.value))}
                onChange={handleCategoryChange}
                className="mt-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Purchase Price (Rs.)</label>
              <input
                type="number"
                name="purchase_price"
                value={formData.purchase_price}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">Rental Price (Rs./day)</label>
              <input
                type="number"
                name="rental_price"
                value={formData.rental_price}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
              required
            />
          </div>

          {/* Availability Status */}
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-semibold text-gray-700">Availability Status</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="availability_status"
                    value="yes"
                    checked={formData.availability_status === 'yes'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="availability_status"
                    value="no"
                    checked={formData.availability_status === 'no'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {formData.availability_status === 'yes' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700">Available Stock</label>
                <input
                  type="number"
                  name="available_stock"
                  value={formData.available_stock}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                  required
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-semibold text-gray-700">Discount Available</p>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasDiscount"
                    value="yes"
                    checked={formData.hasDiscount === 'yes'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="hasDiscount"
                    value="no"
                    checked={formData.hasDiscount === 'no'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {formData.hasDiscount === 'yes' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Discount Type</label>
                    <input
                      type="text"
                      name="discount_type"
                      value={formData.discount_type}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Discount Percentage</label>
                    <input
                      type="number"
                      name="discount_percent"
                      value={formData.discount_percent}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                      required
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Discount Start Date</label>
                    <input
                      type="date"
                      name="discount_start"
                      value={formData.discount_start}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Discount End Date</label>
                    <input
                      type="date"
                      name="discount_end"
                      value={formData.discount_end}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-[#1E2751] text-white px-6 py-2 rounded-md hover:bg-[#2a3a7a]"
            >
              Submit Prop
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropForm;