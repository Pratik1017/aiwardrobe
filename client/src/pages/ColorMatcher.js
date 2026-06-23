import React, { useState, useEffect } from 'react';
import { clothingAPI } from '../services/api';
import { FiSearch, FiFilter, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiTool, FiArrowRight } from 'react-icons/fi';

const ColorMatcher = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [matchingItems, setMatchingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    try {
      setLoading(true);
      const res = await clothingAPI.getClothing();
      const activeItems = res.data.clothing?.filter(item => !item.isDonated) || [];
      setWardrobe(activeItems);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  // Color harmony database
  const COLOR_HARMONY = {
    'black': { complementary: ['white', 'gray', 'cream', 'navy', 'red'], name: 'Black' },
    'white': { complementary: ['black', 'gray', 'navy', 'cream', 'any'], name: 'White' },
    'gray': { complementary: ['black', 'white', 'navy', 'cream', 'any'], name: 'Gray' },
    'navy': { complementary: ['white', 'cream', 'gray', 'red', 'gold'], name: 'Navy' },
    'red': { complementary: ['white', 'black', 'navy', 'cream', 'gold'], name: 'Red' },
    'blue': { complementary: ['white', 'orange', 'cream', 'navy', 'yellow'], name: 'Blue' },
    'green': { complementary: ['white', 'cream', 'brown', 'gray', 'red'], name: 'Green' },
    'yellow': { complementary: ['blue', 'purple', 'navy', 'black', 'orange'], name: 'Yellow' },
    'orange': { complementary: ['blue', 'navy', 'cream', 'black', 'white'], name: 'Orange' },
    'pink': { complementary: ['navy', 'green', 'gray', 'white', 'cream'], name: 'Pink' },
    'purple': { complementary: ['yellow', 'cream', 'white', 'green', 'orange'], name: 'Purple' },
    'brown': { complementary: ['cream', 'white', 'yellow', 'green', 'orange'], name: 'Brown' },
    'cream': { complementary: ['navy', 'black', 'brown', 'gray', 'red'], name: 'Cream' },
  };

  const getColorHarmony = (baseColor) => {
    const lowerColor = baseColor?.toLowerCase() || '';
    // Find exact match or partial match
    for (let key in COLOR_HARMONY) {
      if (lowerColor.includes(key) || key.includes(lowerColor)) {
        return COLOR_HARMONY[key];
      }
    }
    return COLOR_HARMONY['gray']; // Default fallback
  };

  const findMatches = (item) => {
    if (!item) return;
    
    setSelectedItem(item);
    const harmony = getColorHarmony(item.color);
    
    // Filter items that match the color harmony
    const matches = wardrobe.filter(w => {
      if (w._id === item._id) return false; // Exclude self
      const itemColor = w.color?.toLowerCase() || '';
      return harmony.complementary.some(c => itemColor.includes(c) || c === 'any');
    });

    setMatchingItems(matches);
  };

  const ColorCard = ({ item, isSelected = false }) => (
    <div
      onClick={() => findMatches(item)}
      className={`cursor-pointer rounded-2xl overflow-hidden shadow-card border-2 transition-all transform hover:scale-105 ${
        isSelected
          ? 'border-primary shadow-lg ring-4 ring-primary-200'
          : 'border-gray-100 hover:border-primary-100'
      }`}
    >
      <div className="aspect-square bg-gray-50 overflow-hidden relative">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <FiTool size={40} />
          </div>
        )}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-white p-2 rounded-full">
            <FiCheckCircle size={20} />
          </div>
        )}
      </div>
      <div className="p-3 bg-white">
        <h4 className="font-semibold text-dark text-sm truncate">{item.name}</h4>
        <p className="text-xs text-gray-400 capitalize">{item.color} {item.type}</p>
      </div>
    </div>
  );

  const filteredWardrobe = wardrobe.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-light">
        <div className="w-12 h-12 rounded-2xl bg-gradient-orange animate-pulse-soft shadow-orange flex items-center justify-center">
          <FiRefreshCw size={20} className="text-white animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-lg">
              <FiTool size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark">Color Matcher</h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Find perfect color combinations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        {!selectedItem && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-purple-100 mb-8">
            <div className="flex items-start gap-4">
              <FiTool size={28} className="text-purple-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-heading font-bold text-dark text-lg mb-2">How it works</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Select any item from your wardrobe below, and we'll show you all the pieces that coordinate perfectly with it. Our color harmony algorithm finds complementary colors and styles that work together beautifully. Mix and match to create stunning outfits!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-8 flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-3.5 text-gray-300" size={18} />
            <input
              type="text"
              placeholder="Search by name, color, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8 border border-red-100 text-sm">
            <FiAlertCircle size={20} /> {error}
          </div>
        )}

        {selectedItem ? (
          <>
            {/* Selected Item Display */}
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 md:p-8 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
                  <FiTool size={28} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Base Item</p>
                  <h2 className="font-heading text-2xl font-bold text-dark">{selectedItem.name}</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-4 shadow-lg">
                    {selectedItem.imageUrl ? (
                      <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiTool size={60} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-semibold">Item Details</p>
                    <div className="space-y-2 text-sm">
                      <p><strong className="text-gray-600">Type:</strong> <span className="capitalize text-dark">{selectedItem.type}</span></p>
                      <p><strong className="text-gray-600">Category:</strong> <span className="capitalize text-dark">{selectedItem.category}</span></p>
                      <p><strong className="text-gray-600">Color:</strong> <span className="capitalize text-dark">{selectedItem.color}</span></p>
                      <p><strong className="text-gray-600">Size:</strong> <span className="text-dark">{selectedItem.size}</span></p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <p className="text-xs text-purple-600 uppercase tracking-wide mb-3 font-semibold">Matching Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {getColorHarmony(selectedItem.color).complementary.map((color, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-medium text-dark capitalize">
                          {color === 'any' ? '+ Any Color' : color}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedItem(null); setMatchingItems([]); }}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all font-medium text-sm"
                  >
                    Choose Different Item
                  </button>
                </div>
              </div>
            </div>

            {/* Matching Items */}
            <div>
              <div className="mb-6">
                <h3 className="font-heading text-xl md:text-2xl font-bold text-dark mb-2">Perfect Matches</h3>
                <p className="text-gray-400 text-sm">{matchingItems.length} items coordinate with this piece</p>
              </div>

              {matchingItems.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-card">
                  <FiAlertCircle size={40} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="font-heading font-semibold text-gray-600 mb-1">No matches found</h3>
                  <p className="text-sm text-gray-400">Try selecting a different item or adding more pieces to your wardrobe.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {matchingItems.map((item) => (
                    <ColorCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Select Item Section */}
            <div>
              <div className="mb-6">
                <h3 className="font-heading text-xl md:text-2xl font-bold text-dark mb-2">Your Wardrobe</h3>
                <p className="text-gray-400 text-sm">{filteredWardrobe.length} items available</p>
              </div>

              {filteredWardrobe.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-card">
                  <FiFilter size={40} className="mx-auto text-gray-300 mb-3" />
                  <h3 className="font-heading font-semibold text-gray-600 mb-1">No items found</h3>
                  <p className="text-sm text-gray-400">Try adjusting your search or add more clothes to your wardrobe.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredWardrobe.map((item) => (
                    <ColorCard key={item._id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ColorMatcher;
