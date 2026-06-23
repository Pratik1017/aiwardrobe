import React, { useState, useEffect } from 'react';
import { clothingAPI, historyAPI } from '../services/api';
import { FiTrendingUp, FiDroplet, FiWind, FiStar, FiAward, FiRefreshCw, FiAlertCircle, FiHeart, FiBarChart2, FiFilter } from 'react-icons/fi';

const Sustainability = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [history, setHistory] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wardrobeRes, historyRes, donatedRes] = await Promise.all([
        clothingAPI.getClothing(),
        historyAPI.getHistory(),
        clothingAPI.getDonatedClothing()
      ]);

      const wardrobeData = wardrobeRes.data.clothing || [];
      const historyData = historyRes.data.history || [];
      const donatedData = donatedRes.data.clothing || [];

      setWardrobe(wardrobeData);
      setHistory(historyData);
      setDonations(donatedData);

      // Calculate statistics
      calculateStats(wardrobeData, historyData, donatedData);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (wardrobeData, historyData, donatedData) => {
    // Water & CO2 from donations
    const waterSavedFromDonations = donatedData.length * 2700;
    const co2SavedFromDonations = donatedData.length * 2;

    // Items wear frequency
    const wearCount = {};
    wardrobeData.forEach(item => {
      wearCount[item._id] = 0;
    });

    historyData.forEach(outfit => {
      if (outfit.top) wearCount[outfit.top] = (wearCount[outfit.top] || 0) + 1;
      if (outfit.bottom) wearCount[outfit.bottom] = (wearCount[outfit.bottom] || 0) + 1;
      if (outfit.fullBody) wearCount[outfit.fullBody] = (wearCount[outfit.fullBody] || 0) + 1;
      if (outfit.outerwear) wearCount[outfit.outerwear] = (wearCount[outfit.outerwear] || 0) + 1;
      if (outfit.footwear) wearCount[outfit.footwear] = (wearCount[outfit.footwear] || 0) + 1;
    });

    // Calculate averages
    const totalWears = Object.values(wearCount).reduce((a, b) => a + b, 0);
    const avgWears = wardrobeData.length > 0 ? Math.round(totalWears / wardrobeData.length) : 0;
    const mostWornItem = wardrobeData.reduce((max, item) => 
      (wearCount[item._id] || 0) > (wearCount[max._id] || 0) ? item : max
    );
    const mostWornCount = wearCount[mostWornItem._id] || 0;

    // Items worn 30+ times (sustainable threshold)
    const sustainableItems = wardrobeData.filter(item => (wearCount[item._id] || 0) >= 30).length;

    // Water saved from reuse (1 item worn 30 times = no need to buy 30 new items)
    const waterSavedFromReuse = sustainableItems * 2700 * 5; // Each saved item = ~5 potential new purchases

    // Total environmental impact
    const totalWaterSaved = waterSavedFromDonations + waterSavedFromReuse;
    const totalCO2Saved = co2SavedFromDonations + (sustainableItems * 5 * 2);

    // Calculate impact score
    const impactScore = Math.round(
      (totalWaterSaved / 1000) * 2 + // 1000L = 2 points
      (totalCO2Saved * 5) + // 1kg = 5 points
      (sustainableItems * 10) + // Sustainable item = 10 points
      historyData.length // Each outfit = 1 point
    );

    const calculatedStats = {
      totalItems: wardrobeData.length,
      totalWears: totalWears,
      avgWears,
      sustainableItems,
      donatedItems: donatedData.length,
      waterSavedLiters: Math.round(totalWaterSaved),
      co2SavedKg: Math.round(totalCO2Saved),
      impactScore: Math.max(0, impactScore),
      wearFrequency: wearCount,
      mostWornItem,
      mostWornCount,
      totalOutfits: historyData.length,
    };

    setStats(calculatedStats);
    calculateBadges(calculatedStats);
  };

  const calculateBadges = (statsData) => {
    const earnedBadges = [];

    // Badge system
    if (statsData.avgWears >= 5) {
      earnedBadges.push({
        id: 'frequent-wearer',
        title: 'Frequent Wearer',
        description: 'Average ' + statsData.avgWears + ' wears per item',
        icon: '👕',
        color: 'from-blue-400 to-cyan-400'
      });
    }
    if (statsData.sustainableItems >= 5) {
      earnedBadges.push({
        id: 'eco-champion',
        title: 'Eco Champion',
        description: statsData.sustainableItems + ' items worn 30+ times',
        icon: '🌱',
        color: 'from-green-400 to-emerald-400'
      });
    }
    if (statsData.donatedItems >= 3) {
      earnedBadges.push({
        id: 'generous-donor',
        title: 'Generous Donor',
        description: 'Donated ' + statsData.donatedItems + ' items',
        icon: '💝',
        color: 'from-red-400 to-pink-400'
      });
    }
    if (statsData.waterSavedLiters >= 10000) {
      earnedBadges.push({
        id: 'water-saver',
        title: 'Water Saver',
        description: statsData.waterSavedLiters.toLocaleString() + 'L saved',
        icon: '💧',
        color: 'from-blue-300 to-blue-500'
      });
    }
    if (statsData.totalOutfits >= 20) {
      earnedBadges.push({
        id: 'style-curator',
        title: 'Style Curator',
        description: statsData.totalOutfits + ' outfits created',
        icon: '✨',
        color: 'from-purple-400 to-pink-400'
      });
    }
    if (statsData.impactScore >= 500) {
      earnedBadges.push({
        id: 'sustainability-star',
        title: 'Sustainability Star',
        description: 'Impact score: ' + statsData.impactScore,
        icon: '⭐',
        color: 'from-yellow-400 to-orange-400'
      });
    }

    setBadges(earnedBadges);
  };

  const ImpactCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 md:p-8 shadow-card text-white`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>
      <p className="text-white/80 text-xs md:text-sm uppercase tracking-wide mb-2 font-semibold">{label}</p>
      <h3 className="font-heading text-3xl md:text-4xl font-bold mb-1">{value.toLocaleString()}</h3>
      <p className="text-white/70 text-xs md:text-sm">{unit}</p>
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
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <FiTrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark">Sustainability Tracker</h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">Your environmental impact</p>
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

        {/* Impact Score */}
        {stats && (
          <>
            <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500 rounded-3xl p-6 md:p-10 shadow-card text-white mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-green-50 text-xs md:text-sm uppercase tracking-wide mb-2 font-semibold">Your Impact Score</p>
                  <h2 className="font-heading text-4xl md:text-6xl font-bold">{stats.impactScore}</h2>
                </div>
                <div className="text-6xl md:text-8xl opacity-20">🌍</div>
              </div>
              <p className="text-green-50 text-sm md:text-base leading-relaxed">
                You're making a real difference! Your sustainable fashion choices are helping the environment. Keep up the great work!
              </p>
            </div>

            {/* Main Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <ImpactCard icon={FiDroplet} label="Water Saved" value={stats.waterSavedLiters} unit="liters" color="from-blue-400 to-cyan-500" />
              <ImpactCard icon={FiWind} label="CO2 Prevented" value={stats.co2SavedKg} unit="kg" color="from-green-400 to-emerald-500" />
              <ImpactCard icon={FiHeart} label="Items Donated" value={stats.donatedItems} unit="pieces" color="from-red-400 to-pink-500" />
              <ImpactCard icon={FiBarChart2} label="Sustainable Items" value={stats.sustainableItems} unit="30+ wears" color="from-purple-400 to-indigo-500" />
            </div>

            {/* Wardrobe Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
              {/* Usage Stats */}
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
                <h3 className="font-heading text-lg md:text-xl font-bold text-dark mb-6">Wardrobe Usage</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm md:text-base">Total Items</span>
                    <span className="font-heading font-bold text-dark text-lg">{stats.totalItems}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-orange" style={{ width: '100%' }} />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-gray-600 text-sm md:text-base">Total Wears</span>
                    <span className="font-heading font-bold text-dark text-lg">{stats.totalWears}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: `${Math.min(100, (stats.totalWears / stats.totalItems / 30) * 100)}%` }} />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <span className="text-gray-600 text-sm md:text-base">Average Wears per Item</span>
                    <span className="font-heading font-bold text-primary text-lg">{stats.avgWears}x</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${Math.min(100, (stats.avgWears / 30) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Most Worn Item */}
              {stats.mostWornItem && (
                <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8">
                  <h3 className="font-heading text-lg md:text-xl font-bold text-dark mb-6">Your Favorite Item</h3>
                  <div className="flex gap-4 items-center">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {stats.mostWornItem.imageUrl ? (
                        <img src={stats.mostWornItem.imageUrl} alt={stats.mostWornItem.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiFilter size={24} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-dark text-lg mb-2">{stats.mostWornItem.name}</h4>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">Worn <strong>{stats.mostWornCount} times</strong></p>
                        <p className="text-xs text-gray-400 capitalize">{stats.mostWornItem.color} {stats.mostWornItem.type}</p>
                        <div className="flex items-center gap-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} size={14} className={i < Math.min(5, Math.floor(stats.mostWornCount / 6)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            {badges.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 md:p-8 mb-8">
                <h3 className="font-heading text-lg md:text-xl font-bold text-dark mb-6 flex items-center gap-2">
                  <FiAward size={24} className="text-primary" />
                  Achievements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className={`bg-gradient-to-br ${badge.color} rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform`}>
                      <div className="text-4xl mb-3">{badge.icon}</div>
                      <h4 className="font-heading font-bold mb-1">{badge.title}</h4>
                      <p className="text-white/80 text-sm">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 md:p-8">
              <h3 className="font-heading text-lg font-bold text-dark mb-4">💡 Tips to Increase Your Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">👕</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Wear Each Item 30x</p>
                    <p className="text-xs text-gray-600 mt-1">Aim for 30 wears to maximize sustainability</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">♻️</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Donate More Items</p>
                    <p className="text-xs text-gray-600 mt-1">Each donation saves 2700L of water</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">🎨</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Try New Combinations</p>
                    <p className="text-xs text-gray-600 mt-1">Mix existing items to create fresh looks</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-2xl flex-shrink-0">📊</span>
                  <div>
                    <p className="font-semibold text-dark text-sm">Track Your Progress</p>
                    <p className="text-xs text-gray-600 mt-1">Come back to see your impact grow</p>
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

export default Sustainability;
