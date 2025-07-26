import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  { id: 1, name: "Victorian Sofa", img: "/src/assets/images/image1.png", detailsPropId: "688397333f24744ffdcc5734" },
  { id: 2, name: "French Style Rotary Phone", img: "/src/assets/images/image2.png", detailsPropId: "688398863f24744ffdcc5736" },
  { id: 3, name: "Slot Machine: CASINO KING", img: "/src/assets/images/image3.png", detailsPropId: "6883969c3f24744ffdcc5732" },
  { id: 4, name: "Casual Props", img: "/src/assets/images/image4.png", detailsPropId: "688082ff342797c1bed5e3a9" },
  { id: 5, name: "Upright Vintage Piano: Sames", img: "/src/assets/images/image5.png", detailsPropId: "688395bb3f24744ffdcc5730" },
];

const Slideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gray-300 py-20 min-h-[700px] mb-8">
      <div className="max-w-screen-xl mx-auto grid md:grid-cols-3 gap-2 items-center">
        {/* Left Side - Text (1/3 space) */}
        <div className="px-4 md:col-span-1">
          <p className="mb-2 text-sm text-black opacity-75">
            Bring your stage and screen to life with the perfect props — from vintage treasures to dramatic essentials.
          </p>
          <h1 className="text-4xl font-bold mb-4 leading-tight text-black">
            Discover. Rent. Create.<br />
          </h1>
          <Link to="/category">
          <button className="mt-2 px-6 py-2 bg-white text-black font-large font-semibold rounded border-[3px] border-black">
            Explore Collection
          </button>
          </Link>
        </div>

        {/* Right Side - Slideshow (2/3 space) */}
        <div className="w-full px-4 md:col-span-2">
          <div className="relative group overflow-hidden rounded-lg border border-gray-500">
            <img
              src={slides[currentSlide].img}
              alt={slides[currentSlide].name}
              className="w-full h-[500px] object-cover transition-all duration-500 rounded-lg"
            />

            {/* Gradient Overlay on hover with Slide Name and Arrow Button */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-800/70 via-gray-800/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-auto">
              <div className="absolute bottom-4 right-4 flex items-center gap-4">
                <p className="text-white text-xl font-semibold">{slides[currentSlide].name}</p>
                <a
                  href={`/props/${slides[currentSlide].detailsPropId}`}
                  className="w-10 h-10 rounded-full bg-transparent border-2 border-white flex items-center justify-center hover:bg-white/20 cursor-pointer"
                >
                  <ChevronRight className="text-white" size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* Dot Progress Bar */}
          <div className="flex justify-center mt-4 gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full cursor-pointer transition-colors duration-300 ${
                  index === currentSlide ? 'bg-gray-800' : 'bg-gray-400 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Slideshow;