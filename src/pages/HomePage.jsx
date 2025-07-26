import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Slideshow from '../components/Slideshow';
import PropCard from '../components/PropCard';
import Features from '../components/Features';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Homepage = () => {
  const [newProps, setNewProps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewProps = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/props/new?limit=5');
        setNewProps(response.data.slice(0, 5)); // Ensure max 5 items
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching new props:', error);
        setError(
          error.response
            ? `Error: ${error.response.status} - ${error.response.data?.message || 'Not Found'}`
            : 'Error: Could not connect to the server'
        );
        setIsLoading(false);
      }
    };
    fetchNewProps();
  }, []);

  return (
    <div className="bg-whitesmoke text-white font-sans">
      {/* Header Section */}
      <Header />

      {/* Slideshow Section */}
      <Slideshow />

      {/* New Arrivals Section */}
      <section className="bg-whitesmoke text-gray-800 px-6 py-16 w-4/5 mx-auto mb-8">
        <div className="new-arrivals-container">
          <div className="new-arrivals-header mb-8">
            <span className="section-label text-3xl font-bold text-black">New Arrivals</span>
          </div>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {isLoading ? (
            <p className="text-gray-800 text-center">Loading new arrivals...</p>
          ) : newProps.length === 0 ? (
            <p className="text-gray-800 text-center">No new arrivals available.</p>
          ) : (
            <div className="new-arrivals grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 py-4">
              {newProps.map((prop, index) => (
                <PropCard
                  key={prop._id || index}
                  name={prop.name}
                  rental_price={prop.rental_price}
                  image={prop.image}
                  imageClassName="w-full h-50 object-cover mb-4 rounded-md"
                  category={prop.category}
                  altText={prop.name}
                  onClick={() => navigate(`/props/${prop._id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Homepage;