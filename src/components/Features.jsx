import React from 'react';
import { useNavigate } from 'react-router-dom';

const Features = () => {
  const navigate = useNavigate();
  const featureImages = [
    { src: "/src/assets/images/image6.png", alt: "Feature 1", title: "Medieval Armor", subtitle: "Premium Experience" },
    { src: "/src/assets/images/image7.png", alt: "Feature 2", title: "Victorian Sofa", subtitle: "Exclusive Access" },
    { src: "/src/assets/images/image8.png", alt: "Feature 3", title: "Vintage Blush", subtitle: "Ultimate Quality" },
    { src: "/src/assets/images/image9.png", alt: "Feature 4", title: "BigFrame Sunglasses", subtitle: "Dynamic Display" },
    { src: "/src/assets/images/image10.png", alt: "Feature 5", title: "Vintage Suitcase", subtitle: "Ultimate Quality" },
  ];

  return (
    <section className="bg-whitesmoke text-white px-6 py-16 w-4/5 mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10 text-black">Featured Products</h2>

      {/* Group: Image 1 (Left) + Image 2 and 3 (Right in column) */}
      <div className="flex flex-col md:flex-row gap-4 max-w-5xl mx-auto mb-4">
        {/* Image 1 */}
        <div
          className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 w-full md:w-1/2 h-[520px] cursor-pointer"
          onClick={() => navigate('/props/68822ff9b30ba29b14184ae5')}
        >
          <img
            src={featureImages[0].src}
            alt={featureImages[0].alt}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div className="absolute bottom-0 left-5 right-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="text-lg font-bold">{featureImages[0].title}</div>
            <div className="text-sm text-white/80">{featureImages[0].subtitle}</div>
          </div>
        </div>

        {/* Grouped: Image 2 and Image 3 (column) */}
        <div className="flex flex-col gap-4 w-full md:w-1/2">
          {/* Image 2 */}
          <div
            className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 h-64 cursor-pointer"
            onClick={() => navigate('/props/688397333f24744ffdcc5734')}
          >
            <img
              src={featureImages[1].src}
              alt={featureImages[1].alt}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="absolute bottom-8 left-4 right-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="text-lg font-bold">{featureImages[1].title}</div>
              <div className="text-sm text-white/80">{featureImages[1].subtitle}</div>
            </div>
          </div>

          {/* Image 3 */}
          <div
            className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 h-64 cursor-pointer"
            onClick={() => navigate('/props/68845bb53f24744ffdcc58e2')}
          >
            <img
              src={featureImages[2].src}
              alt={featureImages[2].alt}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            <div className="absolute bottom-8 left-4 right-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <div className="text-lg font-bold">{featureImages[2].title}</div>
              <div className="text-sm text-white/80">{featureImages[2].subtitle}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image 4 and 5: Stays the same */}
      <div className="col-span-2 flex flex-row gap-4 max-w-5xl mx-auto">
        {/* Image 4 */}
        <div
          className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 flex-1 h-64 cursor-pointer"
          onClick={() => navigate('/props/688455a73f24744ffdcc58dd')}
        >
          <img
            src={featureImages[3].src}
            alt={featureImages[3].alt}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div className="absolute bottom-8 left-4 right-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="text-lg font-bold">{featureImages[3].title}</div>
            <div className="text-sm text-white/80">{featureImages[3].subtitle}</div>
          </div>
        </div>

        {/* Image 5 */}
        <div
          className="group relative overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 flex-1 h-64 cursor-pointer"
          onClick={() => navigate('/props/68822ef6b30ba29b14184adf')}
        >
          <img
            src={featureImages[4].src}
            alt={featureImages[4].alt}
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
          <div className="absolute bottom-8 left-4 right-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="text-lg font-bold">{featureImages[4].title}</div>
            <div className="text-sm text-white/80">{featureImages[4].subtitle}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;