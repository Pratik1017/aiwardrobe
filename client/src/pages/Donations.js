import React, { useState, useEffect } from 'react';
import { clothingAPI } from '../services/api';
import { FiHeart, FiRefreshCw, FiPackage, FiCheckCircle } from 'react-icons/fi';

const Donations = () => {
  const [donatedItems, setDonatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonatedClothing();
  }, []);

  const fetchDonatedClothing = async () => {
    try {
      setLoading(true);
      const response = await clothingAPI.getDonatedClothing();
      setDonatedItems(response.data.donatedClothes || []);
      setError('');
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to fetch donated clothing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-orange text-white">
            <FiHeart size={24} />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark">Your Impact</h1>
            <p className="text-gray-500 mt-1">Track the clothing you've donated to make a difference.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 mb-8 flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-500">
            <FiPackage size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Items Donated</p>
            <h3 className="font-heading text-4xl font-bold text-dark">{donatedItems.length}</h3>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-orange animate-pulse-soft shadow-orange flex items-center justify-center text-white">
              <FiRefreshCw size={20} className="animate-spin" />
            </div>
            <p className="text-sm text-gray-400">Loading your impact history...</p>
          </div>
        ) : donatedItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
              <FiHeart size={28} />
            </div>
            <h3 className="font-heading text-xl font-bold text-dark mb-2">No donations yet</h3>
            <p className="text-gray-500 mb-6">Start making an impact by donating clothes from your gallery.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {donatedItems.map(item => (
              <div key={item._id} className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all duration-300">
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover grayscale-[20%]"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-sm border border-white flex items-center gap-1.5 text-xs font-semibold text-green-600">
                    <FiCheckCircle size={14} /> Donated
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-bold text-dark text-lg mb-1">{item.name}</h3>
                  <p className="text-xs text-gray-400 mb-4 capitalize">{item.color} {item.type}</p>
                  
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-500 font-medium">Donated To:</span>
                      <span className="text-xs font-semibold text-dark">{item.donatedTo || 'Unknown NGO'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 font-medium">Condition:</span>
                      <span className="text-xs font-semibold text-dark">{item.condition || 'Gently Used'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Donations;
