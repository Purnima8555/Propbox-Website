import axios from 'axios';
import { ArrowRight, MinusCircle, PlusCircle, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('purchase');
  const [rentalWeeks, setRentalWeeks] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [prop, setProp] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [error, setError] = useState(null);

  const description = prop?.description || 'No description available';

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  // Fetch prop details
  useEffect(() => {
    const fetchProp = async () => {
      try {
        const response = await axios.get(`https://localhost:3000/api/props/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Fetched prop data:', response.data);
        setProp({
          id: response.data._id,
          name: response.data.name,
          image: response.data.image
            ? `https://localhost:3000/prop_images/${response.data.image}`
            : '/default-prop-cover.jpg',
          category: Array.isArray(response.data.category) ? response.data.category : [],
          description: response.data.description || 'No description available',
          purchase_price: response.data.purchase_price,
          rental_price: response.data.rental_price,
          available_stock: response.data.available_stock,
          availability_status: response.data.availability_status || 'yes',
          hasDiscount: response.data.hasDiscount || false,
          discount_type: response.data.discount_type,
          discount_percent: response.data.discount_percent || 0,
          discount_start: response.data.discount_start,
          discount_end: response.data.discount_end,
        });
      } catch (error) {
        console.error('Error fetching prop details:', error);
        setError(error.response?.data?.message || 'Failed to load prop details.');
      }
    };

    fetchProp();
  }, [id]);

  // Check favorite status
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');
      if (userId && token && id) {
        try {
          const response = await axios.get(`https://localhost:3000/api/favorites/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const isPropFavorited = response.data.some(fav => fav.prop_id?._id === id && fav.isFavorite);
          setIsFavorited(isPropFavorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [id]);

  // Fetch user details
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      axios
        .get(`https://localhost:3000/api/customer/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error('Error fetching user details:', error);
        });
    }
  }, []);

  // Fetch average rating and total reviews
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await axios.get(`https://localhost:3000/api/feedback/average-rating/${id}`);
        setAverageRating(response.data.averageRating || 0);
        setTotalReviews(response.data.totalReviews || 0);
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };

    fetchAverageRating();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    axios
      .get(`https://localhost:3000/api/feedback/prop/${id}`)
      .then((response) => {
        setReviews(response.data || []);
      })
      .catch((error) => {
        console.error('Error fetching reviews:', error);
      });
  }, [id]);

  const handleSubmitReview = () => {
    if (rating === 0) {
      alert('Please provide a rating before submitting.');
      return;
    }
    if (!user) {
      alert('User not found. Please log in first.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Authentication token not found. Please log in.');
      return;
    }

    const reviewData = {
      user_id: user._id,
      prop_id: id,
      rating: rating,
      comment: review,
    };

    axios
      .post('https://localhost:3000/api/feedback', reviewData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert('Review submitted successfully!');
        setRating(0);
        setReview('');
        // Refresh average rating and reviews
        axios.get(`https://localhost:3000/api/feedback/average-rating/${id}`)
          .then((response) => {
            setAverageRating(response.data.averageRating || 0);
            setTotalReviews(response.data.totalReviews || 0);
          })
          .catch((error) => {
            console.error('Error fetching average rating:', error);
          });
        axios.get(`https://localhost:3000/api/feedback/prop/${id}`)
          .then((response) => {
            setReviews(response.data || []);
          })
          .catch((error) => {
            console.error('Error fetching reviews:', error);
          });
      })
      .catch((error) => {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
      });
  };

  const toggleFavorite = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      alert('Please log in to favorite props');
      return;
    }

    setIsLoadingFavorite(true);
    try {
      if (isFavorited) {
        const favorites = await axios.get(`https://localhost:3000/api/favorites/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const favoriteToRemove = favorites.data.find(fav => fav.prop_id?._id === id && fav.isFavorite);
        if (favoriteToRemove) {
          await axios.delete(`https://localhost:3000/api/favorites/${favoriteToRemove._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsFavorited(false);
        }
      } else {
        await axios.post(
          'https://localhost:3000/api/favorites/',
          { user_id: userId, prop_id: id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite status. Please try again.');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Add to Cart Handler
  const handleAddToCart = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      alert('Please log in to add items to your cart.');
      return;
    }

    const cartData = {
      user_id: userId,
      prop_id: id,
      quantity,
      type: selectedOption === 'rent' ? 'rental' : 'purchase',
      ...(selectedOption === 'rent' && { rentalDays: rentalWeeks * 7 }),
    };

    try {
      const response = await axios.post('https://localhost:3000/api/cart/add', cartData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Cart response:', response.data);
      alert('Prop added to cart successfully!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error.response?.data || error.message);
      alert(`Failed to add prop to cart: ${error.response?.data?.message || 'Please try again.'}`);
    }
  };

  // Buy Now Handler
  const handleBuyNow = () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (!userId || !token) {
      alert('Please log in to proceed with buying.');
      return;
    }

    const buyData = {
      user_id: userId,
      prop_id: id,
      quantity,
      type: selectedOption === 'rent' ? 'rental' : 'purchase',
      ...(selectedOption === 'rent' && { rentalDays: rentalWeeks * 7 }),
    };

    navigate('/buy', { state: buyData });
  };

  // Quantity Handlers
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  // Rental Weeks Handlers
  const increaseRentalWeeks = () => {
    setRentalWeeks(prev => prev + 1);
  };

  const decreaseRentalWeeks = () => {
    setRentalWeeks(prev => Math.max(1, prev - 1));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} fill={i < rating ? 'orange' : 'none'} stroke="orange" className="w-5 h-5" />
    ));
  };

  const getUserName = (review) => {
    return review.username || (review.user_id && review.user_id.username) || 'Anonymous';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6 flex justify-center items-center">
          <p className="text-xl text-red-500">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!prop) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-6 flex justify-center items-center">
          <p className="text-xl text-gray-600">Loading prop details...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 mt-3">
        <div className="grid md:grid-cols-2 gap-4 mb-20">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={prop.image}
                alt={prop.name}
                className="max-w-full h-[450px] object-cover rounded-lg shadow-lg"
              />
              <button
                disabled={isLoadingFavorite}
                className={`absolute top-3 right-4 p-2 rounded-full border-2 transition-colors
                  ${isFavorited ? 'bg-white border-gray-400' : 'bg-[#1E2751] border-[#1E2751]'}`}
                onClick={toggleFavorite}
              >
                <FaHeart
                  className={`h-6 w-6 transition-colors duration-200
                    ${isFavorited ? 'text-red-500' : 'text-white'}`}
                />
              </button>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2 text-black">{prop.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-orange-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    fill={i < Math.floor(averageRating) ? 'currentColor' : 'none'}
                    className="w-5 h-5"
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({averageRating.toFixed(1)} | {totalReviews} reviews)
              </span>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Categories</p>
                  <div className="flex flex-wrap gap-2 mt-1 max-w-full">
                    {prop.category.length > 0 ? (
                      prop.category.map(category => (
                        <span
                          key={category}
                          className="bg-blue-200 font-semibold text-xs px-2 py-1 rounded text-blue-800 whitespace-nowrap"
                        >
                          {category}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No categories available</span>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center">
                  <p className="text-sm text-gray-500">Status:</p>
                  <span
                    className={`ml-2 text-xs font-semibold px-2 py-1 rounded ${
                      prop.availability_status === 'yes'
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {prop.availability_status === 'yes' ? 'In Stock' : 'Out of Stock'}
                  </span>
                  {prop.hasDiscount && (
                    <span className="ml-3 text-xs font-semibold px-2 py-1 rounded bg-yellow-200 text-yellow-800">
                      {prop.discount_percent}% Off
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative">
              <p
                className={`text-gray-700 overflow-hidden ${!isExpanded ? 'line-clamp-7' : ''}`}
                style={{ WebkitLineClamp: !isExpanded ? 6 : 'none', display: '-webkit-box', WebkitBoxOrient: 'vertical' }}
              >
                {description}
              </p>
              {description.length > 200 && (
                <div className="text-right">
                  <button
                    onClick={toggleDescription}
                    className="text-blue-600 text-xs mt-1 underline"
                  >
                    {isExpanded ? '...Show less' : '...Show more'}
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="purchase"
                    checked={selectedOption === 'purchase'}
                    onChange={() => setSelectedOption('purchase')}
                    className="text-blue-600"
                  />
                  <span>Purchase (Rs {prop.purchase_price})</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="rent"
                    checked={selectedOption === 'rent'}
                    onChange={() => setSelectedOption('rent')}
                    className="text-blue-600"
                  />
                  <span>Rent (Rs {prop.rental_price}/week)</span>
                </label>
              </div>

              {selectedOption === 'purchase' && (
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={decreaseQuantity} className="hover:text-blue-600">
                    <MinusCircle className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    readOnly
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                  <button onClick={increaseQuantity} className="hover:text-blue-600">
                    <PlusCircle className="w-5 h-5" />
                  </button>
                  <span>Quantity</span>
                </div>
              )}

              {selectedOption === 'rent' && (
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={decreaseRentalWeeks} className="hover:text-blue-600">
                    <MinusCircle className="w-5 h-5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={rentalWeeks}
                    readOnly
                    className="w-20 px-2 py-1 border rounded text-center"
                  />
                  <button onClick={increaseRentalWeeks} className="hover:text-blue-600">
                    <PlusCircle className="w-5 h-5" />
                  </button>
                  <span>Rental Weeks</span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg"
                >
                  <ShoppingCart /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center gap-2 border border-black text-black font-bold px-6 py-3 rounded-lg"
                >
                  Buy Now <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gray-100 p-6 rounded-lg shadow-lg border border-gray-300">
          <h2 className="text-2xl font-semibold mb-4 text-center">Rate & Review</h2>
          <div className="w-4/5 mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={user?.image ? `https://localhost:3000/profilePicture/${user.image}` : '/default-profile.png'}
                alt={'ProfilePic'}
                className="w-12 h-12 rounded-full border border-gray-300"
              />
              <div className="flex flex-col ml-3">
                <p className="font-semibold">{user?.username || 'User'}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      fill={i < hoverRating ? 'orange' : 'none'}
                      stroke="orange"
                      className="w-6 h-6 cursor-pointer"
                      onMouseEnter={() => setHoverRating(i + 1)}
                      onMouseLeave={() => setHoverRating(rating)}
                      onClick={() => setRating(i + 1)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <textarea
              placeholder="Write your review..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
            ></textarea>
            <button
              onClick={handleSubmitReview}
              className="bg-[#1E2751] text-white px-6 py-3 rounded-lg hover:bg-[#0e1e67] transition"
            >
              Submit Review
            </button>
          </div>
        </div>

        <div className="container mx-auto py-6 px-4" style={{ width: '90%', outline: '1px solid #E5E7EB', borderRadius: '8px' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-6 mt-4">Customer Reviews:</h2>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="border-b border-gray-200 pb-8 last:border-b-0">
                <div className="flex items-start">
                  <img
                    src={review.image ? `https://localhost:3000/profilePicture/${review.image}` : '/default-profile.png'}
                    alt={getUserName(review)}
                    className="w-14 h-14 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-semibold text-lg text-gray-900 mr-3">{getUserName(review)}</h3>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-gray-800 text-base">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No reviews yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DetailPage;