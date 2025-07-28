import React, { useState, useEffect } from "react";
import { FaBookOpen, FaRegClock } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer.jsx";
import Header from "../components/Header.jsx";

const CategoryPage = () => {
  const [isFilterByOpen, setIsFilterByOpen] = useState(true);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || null);
  const [props, setProps] = useState([]);
  const [sortBy, setSortBy] = useState("default");
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();

  console.log("category:", category);

  const categories = [
    "Costume",
    "Accessory & Props",
    "Makeup & Hair",
    "Set & Stage Decor"
  ];

  useEffect(() => {
    const fetchFavorites = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const response = await axios.get(
          `https://localhost:3000/api/favorites/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const favMap = {};
        response.data.forEach((fav) => {
          if (fav.isFavorite) {
            favMap[fav.prop_id._id] = true;
          }
        });
        setFavorites(favMap);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        // Normalize category from URL to match category names
        const normalizedCategory = category
          ? categories.find(
              (cat) =>
                cat.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-") === category.toLowerCase()
            )
          : null;
        
        setSelectedCategory(normalizedCategory || null);

        let url = normalizedCategory
          ? `https://localhost:3000/api/props/category/${normalizedCategory}`
          : "https://localhost:3000/api/props/";
        const response = await axios.get(url);
        let filteredProps = response.data;

        if (selectedFilter === "inStock") {
          filteredProps = filteredProps.filter((prop) => prop.availability_status === "yes");
        } else if (selectedFilter === "outOfStock") {
          filteredProps = filteredProps.filter((prop) => prop.availability_status === "no");
        }

        setProps(filteredProps);
      } catch (error) {
        console.error("Error fetching props:", error);
      }
    };

    fetchProps();
  }, [selectedFilter, category]);

  const toggleFavorite = async (propId, e) => {
    e.stopPropagation();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      alert("Please log in to favorite props");
      return;
    }

    const isCurrentlyFavorited = favorites[propId] || false;

    try {
      if (isCurrentlyFavorited) {
        const response = await axios.get(
          `https://localhost:3000/api/favorites/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const favoriteToRemove = response.data.find(
          (fav) => fav.prop_id._id === propId && fav.isFavorite
        );

        if (favoriteToRemove) {
          await axios.delete(
            `https://localhost:3000/api/favorites/${favoriteToRemove._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setFavorites((prev) => ({ ...prev, [propId]: false }));
        }
      } else {
        await axios.post(
          "https://localhost:3000/api/favorites/",
          {
            user_id: userId,
            prop_id: propId,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFavorites((prev) => ({ ...prev, [propId]: true }));
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Failed to update favorite status. Please try again.");
    }
  };

  const sortedProps = [...props].sort((a, b) => {
    if (sortBy === "priceLowHigh") {
      return a.rental_price - b.rental_price;
    } else if (sortBy === "priceHighLow") {
      return b.rental_price - a.rental_price;
    }
    return 0;
  });

  const handleSelect = async (category) => {
    setSelectedCategory(category);
    setIsCategoriesOpen(false);
    navigate(`/category/${category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-")}`);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />

      <div className="w-5/6 mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 mt-12">
        <aside className="hidden lg:block bg-gray-100 p-4 rounded-lg">
          <div className="space-y-6">
            <div className="bg-white p-4 shadow rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium mb-2">Filter by</h3>
                <button
                  onClick={() => setIsFilterByOpen(!isFilterByOpen)}
                  className="text-gray-500"
                >
                  {isFilterByOpen ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
                </button>
              </div>
              <div
                className={`transition-all ease-in-out duration-500 overflow-hidden ${
                  isFilterByOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {isFilterByOpen && (
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="all"
                        checked={selectedFilter === "all"}
                        onChange={() => setSelectedFilter("all")}
                        className="mr-2 cursor-pointer"
                      />
                      <FaBookOpen className="text-gray-500" size={18} />
                      <label className="text-gray-700">All</label>
                    </li>
                    <li className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="inStock"
                        checked={selectedFilter === "inStock"}
                        onChange={() => setSelectedFilter("inStock")}
                        className="mr-2 cursor-pointer"
                      />
                      <FaBookOpen className="text-green-500" size={18} />
                      <label className="text-gray-700">In Stock</label>
                    </li>
                    <li className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="outOfStock"
                        checked={selectedFilter === "outOfStock"}
                        onChange={() => setSelectedFilter("outOfStock")}
                        className="mr-2 cursor-pointer"
                      />
                      <FaRegClock className="text-blue-500" size={18} />
                      <label className="text-gray-700">Out of Stock</label>
                    </li>
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-white p-4 shadow rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium mb-2">All Categories</h3>
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="text-gray-500"
                >
                  {isCategoriesOpen ? <IoIosArrowUp size={20} /> : <IoIosArrowDown size={20} />}
                </button>
              </div>

              {selectedCategory && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-2">Selected Category:</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-gray-700 font-bold">{selectedCategory}</span>
                  </div>
                  <div className="my-4 border-t border-gray-300"></div>
                </div>
              )}

              {isCategoriesOpen && (
                <ul className="space-y-2 mt-4">
                  {categories.map((category) => (
                    <li
                      key={category}
                      onClick={() => handleSelect(category)}
                      className={`flex items-center space-x-2 cursor-pointer ${
                        selectedCategory === category ? "text-gray-700 font-bold" : "text-gray-700"
                      } hover:text-blue-500 hover:font-bold`}
                    >
                      <span>{category}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <div className="text-sm text-gray-600">
              <span className="hover:text-blue-500 cursor-pointer">Home</span> /{" "}
              <span className="hover:text-blue-500 cursor-pointer">Category</span> /{" "}
              <span className="font-semibold">{selectedCategory || "All Props"}</span>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="sort" className="mr-2 text-gray-600">
                Sort by:
              </label>
              <select
                id="sort"
                className="border border-gray-300 rounded px-2 py-1 text-gray-700"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="priceLowHigh">Price: Low to High</option>
                <option value="priceHighLow">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {sortedProps.length > 0 ? (
              sortedProps.map((prop, i) => (
                <div
                  key={i}
                  className="bg-white shadow-lg p-4 rounded-md w-full cursor-pointer transform transition-transform duration-100 hover:scale-105 relative"
                  onClick={() => navigate(`/props/${prop._id}`)}
                >
                  <img
                    src={
                      prop.image
                        ? `https://localhost:3000/prop_images/${prop.image}`
                        : "/default-prop-image.jpg"
                    }
                    alt={prop.name}
                    className="w-full h-64 object-cover rounded-t-lg transition-transform duration-200"
                  />
                  <div
                    className={`absolute top-6 right-6 p-2 rounded-full border-2 transition-colors ${
                      favorites[prop._id] ? "bg-white border-gray-400" : "bg-black border"
                    }`}
                    onClick={(e) => toggleFavorite(prop._id, e)}
                  >
                    <FaHeart
                      className={`h-5 w-5 ${favorites[prop._id] ? "text-red-500" : "text-white"}`}
                    />
                  </div>
                  <h4 className="font-semibold text-md">{prop.name}</h4>
                  <p className="font-bold text-xl text-gray-700 mt-2">Rs{prop.rental_price}</p>
                </div>
              ))
            ) : (
              <p>No props found in this category.</p>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;