import axios from "axios";
import { Clock, Sparkles } from "lucide-react";
import { FaHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";

const NewArrivalsPage = () => {
  const [newProps, setNewProps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const propsResponse = await axios.get("http://localhost:3000/api/props/new");
        const props = propsResponse.data;
        setNewProps(props);
        return props;
      } catch (error) {
        console.error("Error fetching new props:", error);
        setError("Failed to load props.");
        return [];
      }
    };

    const fetchFavorites = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId || !token) return;

      try {
        const favResponse = await axios.get(
          `http://localhost:3000/api/favorites/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const favMap = {};
        favResponse.data.forEach((fav) => {
          if (fav.isFavorite) {
            favMap[fav.prop_id._id] = true;
          }
        });
        setFavorites(favMap);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchProps(), fetchFavorites()]);
      setLoading(false);
    };

    loadData();
  }, []);

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
          `http://localhost:3000/api/favorites/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const favoriteToRemove = response.data.find(
          (fav) => fav.prop_id._id === propId && fav.isFavorite
        );

        if (favoriteToRemove) {
          await axios.delete(
            `http://localhost:3000/api/favorites/${favoriteToRemove._id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setFavorites((prev) => ({ ...prev, [propId]: false }));
        }
      } else {
        await axios.post(
          "http://localhost:3000/api/favorites/",
          {
            user_id: userId,
            prop_id: propId, // Note: Should be prop_id
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E2751] to-black py-6">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Sparkles className="w-12 h-12 text-yellow-300 fill-yellow-300" />
            <h1 className="text-5xl font-bold text-white">New Arrivals</h1>
            <Sparkles className="w-12 h-12 text-yellow-300 fill-yellow-300" />
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Discover our latest collection of props
          </p>
        </div>
      </div>

      {/* Props Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <p className="text-center text-lg text-gray-600">Loading props...</p>
        ) : error ? (
          <p className="text-center text-lg text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-10">
            {newProps.map((prop) => (
              <div
                key={prop._id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-all duration-300 cursor-pointer relative border border-gray-300"
                onClick={() => navigate(`/props/${prop._id}`)}
              >
                <div className="flex flex-col md:flex-row h-full">
                  {/* Prop Image */}
                  <div className="md:w-2/5 relative">
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-purple-600">
                      New Release
                    </div>
                    <div
                      className={`absolute top-6 right-6 p-2 rounded-full border-2 transition-colors ${
                        favorites[prop._id] ? "bg-white border-gray-400" : "bg-black border"
                                    }`}
                          onClick={(e) => toggleFavorite(prop._id, e)}
                          >
                          <FaHeart
                          className={`h-5 w-5 ${favorites[prop._id] ? "text-red-500" : "text-white"}`}                              />
                      </div>
                    <img
                      src={
                        prop.image
                          ? `http://localhost:3000/prop_images/${prop.image}`
                          : "/default-prop-image.jpg"
                      }
                      alt={prop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Prop Details */}
                  <div className="md:w-3/5 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{prop.name}</h3>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          Added: {new Date(prop.createdAt).toISOString().split("T")[0]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {prop.category.map((category, index) => (
                          <span
                            key={index}
                            className="bg-blue-200 font-semibold text-xs px-2 py-1 rounded text-blue-800"
                          >
                            {category}
                          </span>
                        ))}
                        <span className="bg-green-200 font-semibold text-xs px-2 py-1 rounded text-green-800">
                          {prop.available_stock} in stock
                        </span>
                      </div>
                    </div>

                    {/* Pricing and Actions */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-300">
                        <div>
                          <span className="text-sm text-gray-600">Purchase</span>
                          <p className="font-bold text-gray-800">Rs. {prop.purchase_price}</p>
                        </div>
                        <button className="bg-black text-white px-4 py-2 rounded-lg">
                          Buy Now
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-300">
                        <div>
                          <span className="text-sm text-gray-600">Rent</span>
                          <p className="font-bold text-gray-800">Rs. {prop.rental_price}/day</p>
                        </div>
                        <button className="border border-black text-black px-4 py-2 rounded-lg">
                          Rent Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default NewArrivalsPage;