import axios from 'axios';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const highlightMatch = (text, query) => {
  if (!query || !text) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => (
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200">{part}</span>
    ) : (
      <span key={index}>{part}</span>
    )
  ));
};

const SearchPopup = ({ onClose }) => {
  const [searchType, setSearchType] = useState('name');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debouncedQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();

  const categories = [
    "Costume",
    "Accessory & Props",
    "Makeup & Hair",
    "Set & Stage Decor"
  ];

  useEffect(() => {
    const searchProps = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (searchType === 'name') {
          const response = await axios.get(
            `http://localhost:3000/api/props/search?name=${encodeURIComponent(debouncedQuery)}`
          );
          setResults(response.data);
        } else {
          // For category search, fetch all props and filter client-side
          const response = await axios.get(`http://localhost:3000/api/props/`);
          const filteredProps = response.data.filter(prop =>
            prop.category.some(cat =>
              cat.toLowerCase().includes(debouncedQuery.toLowerCase())
            )
          );
          setResults(filteredProps);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching search results');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchProps();
  }, [debouncedQuery, searchType]);

  const handleResultClick = (propId) => {
    navigate(`/prop/${propId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 mx-4 sm:mx-0">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Search Props</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setSearchType('name')}
            className={`px-4 py-2 rounded-lg font-medium ${
              searchType === 'name' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-black hover:text-white transition`}
          >
            Name
          </button>
          <button
            onClick={() => setSearchType('category')}
            className={`px-4 py-2 rounded-lg font-medium ${
              searchType === 'category' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-black hover:text-white transition`}
          >
            Category
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchType === 'name' ? 'Enter prop name...' : 'Enter category name...'}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="transition-opacity duration-300 ease-in-out">
          {loading && (
            <p className="text-gray-600 text-center opacity-75">Loading...</p>
          )}
          {error && (
            <p className="text-red-500 text-center opacity-75">{error}</p>
          )}
          {results.length > 0 && (
            <div className="max-h-64 overflow-y-auto border-t border-gray-200 pt-4">
              {results.map((prop) => (
                <div 
                  key={prop._id} 
                  onClick={() => handleResultClick(prop._id)}
                  className="flex items-center gap-4 p-3 hover:bg-gray-100 rounded-lg transition-opacity duration-200 ease-in-out cursor-pointer"
                >
                  <img
                    src={
                      prop.image
                        ? `http://localhost:3000/prop_images/${prop.image}`
                        : "/default-prop-image.jpg"
                    }
                    alt={prop.name}
                    className="w-16 h-24 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {highlightMatch(prop.name, searchType === 'name' ? searchQuery : '')}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Category: {highlightMatch(prop.category.join(', '), searchType === 'category' ? searchQuery : '')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchQuery && !loading && results.length === 0 && !error && (
            <p className="text-gray-600 text-center opacity-75">No props found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPopup;