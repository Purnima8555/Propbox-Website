import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';

const PropCard = ({ name, rental_price, image, category, altText, onClick }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = (e) => {
    e.stopPropagation(); // Prevent click from bubbling to the card
    setIsFavorited(!isFavorited);
  };

  return (
    <div
      className="relative max-w-[17rem] bg-white rounded-lg shadow-lg overflow-hidden h-[350px] transition-transform duration-200 hover:scale-105 cursor-pointer"
      onClick={onClick} // Attach onClick for navigation
    >
      <div className="relative">
        <img
          src={image ? `http://localhost:3000/prop_images/${image}` : "/default-prop-image.jpg"}
          alt={altText || `${name} image`}
          className="w-full h-64 object-cover rounded-t-lg transition-transform duration-200"
        />
        <button
          className={`absolute top-3 right-3 p-2 rounded-full border-2
            ${isFavorited ? "bg-white border-gray-400" : "bg-black border"}`
          }
          onClick={toggleFavorite}
        >
          <FaHeart
            className={`h-5 w-5 transition-colors duration-200 
              ${isFavorited ? 'text-red-500' : 'text-white'}`}
          />
        </button>
      </div>

      {/* Prop Info */}
      <div className="p-4">
        <h3 className="font-semibold text-xl text-[#1E2751]">{name}</h3>
        <p className="text-sm text-gray-600">Rs. {rental_price}/week</p>
        <p className="text-sm text-gray-600">{category.join(', ')}</p>
      </div>
    </div>
  );
};

export default PropCard;