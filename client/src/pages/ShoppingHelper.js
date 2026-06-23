import React, { useState, useEffect } from 'react';
import { clothingAPI } from '../services/api';
import { FiShoppingBag, FiRefreshCw, FiAlertCircle, FiTrendingUp, FiDollarSign, FiExternalLink, FiCheckCircle, FiInfo, FiFilter } from 'react-icons/fi';

const ShoppingHelper = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gaps, setGaps] = useState(null);
  const [budget, setBudget] = useState(2000);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchWardrobe();
  }, []);

  const fetchWardrobe = async () => {
    try {
      setLoading(true);
      const res = await clothingAPI.getClothing();
      const activeItems = res.data.clothing?.filter(item => !item.isDonated) || [];
      setWardrobe(activeItems);
      analyzeGaps(activeItems);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  const analyzeGaps = (wardrobeData) => {
    const categories = {};
    const types = {};
    const colors = {};

    // Count items by category, type, and color
    wardrobeData.forEach(item => {
      categories[item.category] = (categories[item.category] || 0) + 1;
      types[item.type] = (types[item.type] || 0) + 1;
      colors[item.color] = (colors[item.color] || 0) + 1;
    });

    // Define ideal minimalist wardrobe
    const idealCategories = {
      'casual': 8,
      'formal': 4,
      'sports': 3,
      'ethnic': 2,
    };

    const idealTypes = {
      'shirt': 5,
      'pants': 4,
      'sweater': 3,
      'dress': 2,
      'jacket': 2,
      'shoes': 4,
      'skirt': 2,
      'kurta': 1,
    };

    const recommendations = [];

    // Category recommendations
    Object.entries(idealCategories).forEach(([cat, ideal]) => {
      const current = categories[cat] || 0;
      if (current < ideal) {
        const gap = ideal - current;
        recommendations.push({
          type: 'category',
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          gap,
          current,
          ideal,
          priority: gap >= 3 ? 'high' : gap >= 2 ? 'medium' : 'low',
          reason: `You need ${gap} more ${cat} item${gap > 1 ? 's' : ''}`,
          suggestion: getCategorySuggestion(cat),
          priceRange: getCategoryPrice(cat)
        });
      }
    });

    // Type recommendations
    Object.entries(idealTypes).forEach(([typeKey, ideal]) => {
      const current = types[typeKey] || 0;
      if (current < ideal) {
        const gap = ideal - current;
        const priority = gap >= 2 ? 'high' : 'medium';
        // Avoid duplicates from category recommendations
        if (!recommendations.some(r => r.name.toLowerCase().includes(typeKey))) {
          recommendations.push({
            type: 'type',
            name: typeKey.charAt(0).toUpperCase() + typeKey.slice(1),
            gap,
            current,
            ideal,
            priority,
            reason: `You could use ${gap} more ${typeKey}${gap > 1 ? 's' : ''}`,
            suggestion: getTypeSuggestion(typeKey),
            priceRange: getTypePrice(typeKey)
          });
        }
      }
    });

    // Color diversity recommendations
    const colorCount = Object.keys(colors).length;
    if (colorCount < 6) {
      recommendations.push({
        type: 'color',
        name: 'Color Variety',
        gap: 6 - colorCount,
        current: colorCount,
        ideal: 6,
        priority: colorCount < 3 ? 'high' : 'medium',
        reason: 'Add more color variety to your wardrobe',
        suggestion: 'Try jewel tones: emerald, sapphire, amethyst',
        priceRange: [500, 2000]
      });
    }

    // Footwear check
    if ((types['shoes'] || 0) < 3) {
      recommendations.push({
        type: 'footwear',
        name: 'Footwear',
        gap: 3 - (types['shoes'] || 0),
        current: types['shoes'] || 0,
        ideal: 3,
        priority: 'high',
        reason: 'Essential: Casual, formal, and athletic shoes',
        suggestion: 'Sneakers, heels, and formal shoes',
        priceRange: [1000, 3000]
      });
    }

    // Sort by priority
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    setGaps({
      totalItems: wardrobeData.length,
      categories,
      types,
      colors,
      recommendations,
      colorDiversity: colorCount,
      completeness: Math.round((wardrobeData.length / 30) * 100) // 30 items = 100% complete
    });
  };

  const getShoppingLinks = (searchTerm) => {
    const platforms = [
      { name: 'Myntra', url: `https://www.myntra.com/search?q=${searchTerm}`, icon: '🛍️' },
      { name: 'Flipkart', url: `https://www.flipkart.com/search?q=${searchTerm}`, icon: '📦' },
      { name: 'Amazon', url: `https://www.amazon.in/s?k=${searchTerm}`, icon: '🎁' },
    ];
    return platforms;
  };

  const getCategoryPrice = (cat) => {
    const prices = {
      'casual': [500, 1500],
      'formal': [1000, 3000],
      'sports': [800, 2000],
      'ethnic': [1000, 3500],
    };
    return prices[cat] || [500, 2000];
  };

  const getTypePrice = (type) => {
    const prices = {
      'shirt': [400, 1200],
      'pants': [600, 1800],
      'sweater': [800, 2000],
      'dress': [1000, 3000],
      'jacket': [1500, 4000],
      'shoes': [1000, 2500],
      'skirt': [600, 1500],
      'kurta': [800, 2000],
    };
    return prices[type] || [500, 1500];
  };

  const getCategoryDescription = (cat) => {
    const descriptions = {
      'casual': 'Comfortable everyday wear for relaxed settings and casual outings',
      'formal': 'Professional attire for meetings, events, and formal occasions',
      'sports': 'Active wear and athletic clothing for fitness and workouts',
      'ethnic': 'Traditional and culturally inspired clothing for festivals and special occasions',
    };
    return descriptions[cat] || 'Essential wardrobe piece';
  };

  const getTypeSuggestion = (type) => {
    const suggestions = {
      'shirt': 'Versatile for both casual and formal looks. Mix patterns and colors.',
      'pants': 'Timeless staple. Consider neutral tones and a fitted silhouette.',
      'sweater': 'Great for layering and cold weather. Invest in quality fabrics.',
      'dress': 'A-line or wrap dresses work for multiple body types and occasions.',
      'jacket': 'Blazer for formal, denim or leather for casual.',
      'shoes': 'Mix of sneakers, heels, and loafers for every occasion.',
      'skirt': 'A-line, pencil, or maxi. Match with your existing tops.',
      'kurta': 'Perfect for ethnic events. Pair with leggings or bottoms.',
    };
    return suggestions[type] || 'Consider quality and timeless design.';
  };

  const getCategorySuggestion = (cat) => {
    const suggestions = {
      'casual': 'T-shirts, jeans, comfortable sneakers',
      'formal': 'Blazers, dress shirts, dress pants',
      'sports': 'Yoga pants, sports bra, running shoes',
      'ethnic': 'Kurtis, sarees, traditional footwear',
    };
    return suggestions[cat] || 'Check what matches your existing style';
  };

  const RecommendationCard = ({ rec }) => (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 hover:shadow-card-hover transition-all">
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-heading text-lg md:text-xl font-bold text-dark">{rec.name}</h3>
          {rec.gap > 0 && (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
              rec.priority === 'high'
                ? 'bg-red-100 text-red-700'
                : rec.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {rec.priority === 'high' ? '⚠️ High' : rec.priority === 'medium' ? '📌 Medium' : '✅ Low'}
            </span>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progress</span>
          <span className="text-sm font-semibold text-dark">{rec.current} / {rec.ideal}</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-orange transition-all" style={{ width: `${(rec.current / rec.ideal) * 100}%` }} />
        </div>
      </div>

      {/* Details */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
        <p className="text-sm text-gray-600 mb-3">{rec.reason}</p>
        <p className="text-sm font-semibold text-dark mb-2">💡 Suggestion:</p>
        <p className="text-sm text-gray-600 mb-4">{rec.suggestion}</p>
        <div className="flex items-center gap-2">
          <FiDollarSign size={16} className="text-primary" />
          <span className="text-sm font-semibold text-dark">₹{rec.priceRange[0].toLocaleString()} - ₹{rec.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Shopping Links */}
      <div className="flex flex-wrap gap-2">
        {getShoppingLinks(rec.name).map((platform) => (
          <a
            key={platform.name}
            href={platform.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            <span>{platform.icon}</span>
            {platform.name}
            <FiExternalLink size={14} />
          </a>
        ))}
      </div>
    </div>
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
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-lg">
              <FiShoppingBag size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark">Shopping Helper</h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Smart wardrobe gap analysis & recommendations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8 border border-red-100 text-sm">
            <FiAlertCircle size={20} /> {error}
          </div>
        )}

        {gaps && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Wardrobe Size */}
              <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-6 md:p-8 shadow-card text-white">
                <FiShoppingBag size={28} className="mb-3" />
                <p className="text-blue-50 text-xs uppercase tracking-wide mb-2 font-semibold">Wardrobe Size</p>
                <h3 className="font-heading text-3xl md:text-4xl font-bold mb-2">{gaps.totalItems}</h3>
                <p className="text-blue-50 text-sm">Items in your collection</p>
              </div>

              {/* Completeness */}
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-6 md:p-8 shadow-card text-white">
                <FiCheckCircle size={28} className="mb-3" />
                <p className="text-emerald-50 text-xs uppercase tracking-wide mb-2 font-semibold">Wardrobe Completeness</p>
                <h3 className="font-heading text-3xl md:text-4xl font-bold mb-2">{gaps.completeness}%</h3>
                <p className="text-emerald-50 text-sm">Build towards 100% complete</p>
              </div>

              {/* Color Diversity */}
              <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-6 md:p-8 shadow-card text-white">
                <FiFilter size={28} className="mb-3" />
                <p className="text-purple-50 text-xs uppercase tracking-wide mb-2 font-semibold">Color Variety</p>
                <h3 className="font-heading text-3xl md:text-4xl font-bold mb-2">{gaps.colorDiversity}</h3>
                <p className="text-purple-50 text-sm">Different colors (ideal: 6+)</p>
              </div>
            </div>

            {/* Budget Selector */}
            <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-dark mb-2">Shopping Budget</label>
                  <p className="text-xs text-gray-400 mb-4">Set your budget to filter recommendations</p>
                </div>
                <div className="w-full md:w-48">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500">₹</span>
                    <input
                      type="range"
                      min="500"
                      max="10000"
                      step="500"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-bold text-primary">{budget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <div className="mb-6">
                <h2 className="font-heading text-2xl font-bold text-dark mb-2">Recommended Items</h2>
                <p className="text-gray-400 text-sm">{gaps.recommendations.length} gaps found in your wardrobe</p>
              </div>

              {gaps.recommendations.length === 0 ? (
                <div className="bg-green-50 rounded-2xl p-12 text-center border border-green-200 shadow-card">
                  <FiCheckCircle size={48} className="mx-auto text-green-500 mb-4" />
                  <h3 className="font-heading font-bold text-green-700 text-lg mb-2">You're All Set! 🎉</h3>
                  <p className="text-green-600">Your wardrobe is well-rounded and balanced. Great job building a versatile collection!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {gaps.recommendations
                    .filter(rec => rec.priceRange[0] <= budget)
                    .map((rec, idx) => (
                      <RecommendationCard key={idx} rec={rec} />
                    ))}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 md:p-8">
              <h3 className="font-heading text-lg font-bold text-dark mb-4">🛍️ Smart Shopping Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">📋</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Make a List</p>
                    <p className="text-xs text-gray-600 mt-1">Use these recommendations as a shopping list</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🎨</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Color Coordination</p>
                    <p className="text-xs text-gray-600 mt-1">Match new items with existing pieces</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">⏰</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Take Your Time</p>
                    <p className="text-xs text-gray-600 mt-1">Don't rush. Build gradually and intentionally</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">💚</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Quality Over Quantity</p>
                    <p className="text-xs text-gray-600 mt-1">Invest in pieces that last and fit well</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingHelper;
