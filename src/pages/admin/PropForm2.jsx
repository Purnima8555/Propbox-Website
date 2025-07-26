import axios from 'axios';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';

const PropForm2 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  console.log("Prop ID from useParams:", id);

  const [prop, setProp] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);

  const categoryOptions = [
    { value: 'Costume', label: 'Costume' },
    { value: 'Accessory & Props', label: 'Accessory & Props' },
    { value: 'Makeup & Hair', label: 'Makeup & Hair' },
    { value: 'Set & Stage Decor', label: 'Set & Stage Decor' }
  ];

  useEffect(() => {
    if (!id) {
      console.error("Prop ID is missing!");
      return;
    }

    axios.get(`http://localhost:3000/api/props/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        console.log("Fetched Prop:", response.data);

        const propData = response.data;

        // Format dates if they exist
        if (propData.discount_start) {
          propData.discount_start = format(new Date(propData.discount_start), 'yyyy-MM-dd');
        }
        if (propData.discount_end) {
          propData.discount_end = format(new Date(propData.discount_end), 'yyyy-MM-dd');
        }

        setProp(propData);
      })
      .catch(error => {
        console.error("Error fetching prop:", error.response?.data || error.message);
        alert(`Error fetching prop: ${error.response?.data?.message || error.message}`);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", prop.name);
    formData.append("category", JSON.stringify(prop.category));
    formData.append("description", prop.description);
    formData.append("purchase_price", prop.purchase_price);
    formData.append("rental_price", prop.rental_price);
    formData.append("available_stock", prop.available_stock);
    formData.append("availability_status", prop.availability_status);
    formData.append("hasDiscount", prop.hasDiscount);
    formData.append("discount_type", prop.discount_type || '');
    formData.append("discount_percent", prop.discount_percent || '');
    formData.append("discount_start", prop.discount_start || '');
    formData.append("discount_end", prop.discount_end || '');

    if (newImage) {
      formData.append("image", newImage);
    }

    try {
      const response = await axios.put(`http://localhost:3000/api/props/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log("Prop updated:", response.data);
      alert('Prop updated successfully');
      navigate('/admin/manage-props');
    } catch (error) {
      console.error("Error updating prop:", error.response?.data || error.message);
      alert(`Error updating prop: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleCategoryChange = (selectedCategories) => {
    const categories = selectedCategories ? selectedCategories.map(option => option.value) : [];
    setProp(prevProp => ({
      ...prevProp,
      category: categories
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProp(prevProp => {
      const updatedProp = { ...prevProp, [name]: value };

      // Update rental_price based on purchase_price
      if (name === 'purchase_price') {
        const priceValue = parseFloat(value);
        if (!isNaN(priceValue)) {
          updatedProp.rental_price = Math.round(priceValue * 0.05);
        }
      }

      // Update availability_status based on available_stock
      if (name === 'available_stock') {
        updatedProp.availability_status = parseInt(value) > 0 ? 'yes' : 'no';
      }

      return updatedProp;
    });
  };

  const handleDiscountChange = (e) => {
    setProp(prevProp => ({
      ...prevProp,
      hasDiscount: e.target.value === "yes"
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {prop ? (
        <div className="bg-white rounded-xl shadow-lg p-6 w-3/4 mx-auto">
          <h1 className="text-2xl font-semibold text-center text-[#1E2751] mb-6">Edit Prop Information</h1>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-48 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {imagePreview || prop.image ? (
                  <img
                    src={imagePreview ? imagePreview : `http://localhost:3000/prop_images/${prop.image}`}
                    alt="Prop Image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-gray-500">Upload Prop Image</p>
                    <p className="text-sm text-gray-400">(Max size: 5MB)</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={prop.name}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                  placeholder="Enter prop name"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700">Category:</label>
                <Select
                  options={categoryOptions}
                  isMulti
                  value={categoryOptions.filter(option => prop.category.includes(option.value))}
                  onChange={handleCategoryChange}
                  className="mt-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="purchase_price">Purchase Price (Rs.):</label>
                <input
                  type="number"
                  id="purchase_price"
                  name="purchase_price"
                  value={prop.purchase_price}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                  placeholder="Enter purchase price"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="rental_price">Rental Price (Rs./day):</label>
                <input
                  type="number"
                  id="rental_price"
                  name="rental_price"
                  value={prop.rental_price}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                  placeholder="Enter rental price"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700" htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={prop.description}
                onChange={handleInputChange}
                className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                placeholder="Enter prop description"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700">Availability Status</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="availability_status"
                    value="yes"
                    checked={prop.availability_status === 'yes'}
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
                    checked={prop.availability_status === 'no'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>
            </div>

            {prop.availability_status === 'yes' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700" htmlFor="available_stock">Available Stock</label>
                <input
                  type="number"
                  id="available_stock"
                  name="available_stock"
                  value={prop.available_stock}
                  onChange={handleInputChange}
                  className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                  required
                  min="0"
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700">Apply Discount?</label>
              <div className="mt-2 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasDiscount"
                    value="yes"
                    checked={prop.hasDiscount === true}
                    onChange={handleDiscountChange}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="hasDiscount"
                    value="no"
                    checked={prop.hasDiscount === false}
                    onChange={handleDiscountChange}
                    className="mr-2"
                  />
                  No
                </label>
              </div>

              {prop.hasDiscount && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700">Discount Type:</label>
                    <input
                      type="text"
                      name="discount_type"
                      value={prop.discount_type || ''}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                      placeholder="e.g., percentage, flat"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700">Discount Percent:</label>
                    <input
                      type="number"
                      name="discount_percent"
                      value={prop.discount_percent || ''}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                      placeholder="Enter discount percentage"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700">Discount Start:</label>
                    <input
                      type="date"
                      name="discount_start"
                      value={prop.discount_start || ''}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700">Discount End:</label>
                    <input
                      type="date"
                      name="discount_end"
                      value={prop.discount_end || ''}
                      onChange={handleInputChange}
                      className="w-full mt-2 p-2 border rounded-md bg-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E2751]"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#1E2751] text-white px-6 py-2 rounded-md hover:bg-[#2a3a7a] mt-10"
            >
              Update Prop
            </button>
          </form>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default PropForm2;