import React, { useState, useEffect } from 'react';
import { recommendAPI, historyAPI } from '../services/api';
import { FiMapPin, FiSun, FiCloud, FiCloudRain, FiWind, FiCheckCircle, FiRefreshCw, FiAlertCircle, FiThumbsUp, FiThumbsDown, FiShoppingBag, FiExternalLink, FiStar, FiCalendar } from 'react-icons/fi';

// Mood/Occasion definitions
const MOODS = [
  { id: 'auto', label: 'Auto-Detect', icon: '🤖', description: 'AI decides for you', color: 'from-purple-50 to-blue-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700' },
  { id: 'casual', label: 'Casual', icon: '😎', description: 'Relaxed & comfy', color: 'from-blue-50 to-cyan-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  { id: 'formal', label: 'Formal', icon: '💼', description: 'Professional & sharp', color: 'from-slate-50 to-gray-50', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-700' },
  { id: 'trendy', label: 'Trendy', icon: '✨', description: 'Fashion forward', color: 'from-pink-50 to-rose-50', border: 'border-pink-200', badge: 'bg-pink-100 text-pink-700' },
  { id: 'sporty', label: 'Sporty', icon: '⚡', description: 'Active & energetic', color: 'from-orange-50 to-amber-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700' },
  { id: 'festival', label: 'Festival', icon: '🎉', description: 'Ethnic & festive', color: 'from-red-50 to-orange-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
  { id: 'cozy', label: 'Cozy', icon: '🏠', description: 'Warm & comfortable', color: 'from-amber-50 to-yellow-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
  { id: 'romantic', label: 'Romantic', icon: '💕', description: 'Elegant & charming', color: 'from-red-50 to-pink-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700' },
];

const Recommend = () => {
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState('');
  const [location, setLocation] = useState({ city: 'Mumbai', lat: null, lon: null });
  const [occasion, setOccasion] = useState('auto');
  const [autoDetectInfo, setAutoDetectInfo] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [showAllMoods, setShowAllMoods] = useState(false);

  useEffect(() => {
    fetchWeather();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { const lat = pos.coords.latitude; const lon = pos.coords.longitude; setLocation(prev => ({ ...prev, lat, lon })); fetchWeather(lat, lon); },
        (err) => { console.log("Geolocation denied:", err); }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWeather = async (lat = location.lat, lon = location.lon, city = location.city) => {
    try {
      const params = (lat && lon) ? { lat, lon } : { city };
      const res = await recommendAPI.getWeather(params);
      if (res.data.success) { setWeather(res.data.weather); if (res.data.weather.city && (!city || lat)) setLocation(prev => ({ ...prev, city: res.data.weather.city })); }
    } catch (err) { console.error("Failed to fetch weather", err); }
  };

  const handleCitySubmit = (e) => { e.preventDefault(); fetchWeather(null, null, location.city); setRecommendation(null); };

  const generateOutfit = async () => {
    setLoading(true); setError(''); setAutoDetectInfo(null); setFeedbackStatus(null); setSaveStatus('');
    try {
      const params = { occasion };
      if (location.lat && location.lon) { params.lat = location.lat; params.lon = location.lon; } else { params.city = location.city; }
      const res = await recommendAPI.getOutfit(params);
      if (res.data.success) { setRecommendation(res.data.recommendation); setWeather(res.data.weather); if (res.data.autoDetected) setAutoDetectInfo(res.data.autoDetected); }
    } catch (err) {
      if (err.response?.data?.recommendation?.shoppingSuggestions) setRecommendation(err.response.data.recommendation);
      else { setError(err.response?.data?.message || 'Failed to generate recommendation.'); setRecommendation(null); }
    } finally { setLoading(false); }
  };

  const saveOutfit = async () => {
    if (!recommendation) return; setSaveStatus('saving');
    try {
      const payload = { outfitType: recommendation.type || 'partial', occasion, weather,
        top: recommendation.top?._id, bottom: recommendation.bottom?._id, fullBody: recommendation.fullBody?._id,
        outerwear: recommendation.outerwear?._id, footwear: recommendation.footwear?._id };
      const res = await historyAPI.saveOutfit(payload);
      if (res.data.success) setSaveStatus('saved');
    } catch (err) { console.error(err); setSaveStatus('error'); }
  };

  const handleFeedback = async (type) => {
    if (!recommendation) return;
    setFeedbackStatus(type === 'like' ? 'liking' : 'disliking');
    try {
      const payload = { top: recommendation.top?._id, bottom: recommendation.bottom?._id, fullBody: recommendation.fullBody?._id,
        outerwear: recommendation.outerwear?._id, footwear: recommendation.footwear?._id, feedback: type };
      await recommendAPI.submitFeedback(payload);
      if (type === 'like') { setFeedbackStatus('liked'); setTimeout(() => setFeedbackStatus(null), 3000); }
      else { setFeedbackStatus('disliked'); setTimeout(() => { generateOutfit(); }, 800); }
    } catch (err) { console.error(err); setFeedbackStatus(null); }
  };

  const renderWeatherWidget = () => {
    if (!weather) return null;
    let WeatherIcon = FiSun;
    if (weather.condition === 'rain') WeatherIcon = FiCloudRain;
    else if (weather.condition === 'cloudy') WeatherIcon = FiCloud;
    else if (weather.temp < 20) WeatherIcon = FiWind;

    return (
      <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 mb-8 flex items-center justify-between hover:shadow-card-hover transition-all">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary">
            <WeatherIcon size={28} />
          </div>
          <div>
            <h3 className="font-heading text-2xl font-bold text-dark">{weather.temp}°C</h3>
            <p className="text-sm text-gray-400 capitalize">{weather.description}</p>
          </div>
        </div>
        <div className="text-right">
          <form onSubmit={handleCitySubmit} className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200">
            <FiMapPin size={14} className="text-primary" />
            <input type="text" value={location.city} onChange={e => setLocation({...location, city: e.target.value, lat: null, lon: null})}
              className="bg-transparent border-none focus:ring-0 text-right w-20 text-sm font-medium outline-none text-dark" placeholder="City" />
            <button type="submit" className="hidden">Submit</button>
          </form>
          <p className="text-xs text-gray-300 mt-1">Humidity: {weather.humidity}%</p>
        </div>
      </div>
    );
  };

  const ClothingItemCard = ({ item, label }) => {
    if (!item) return null;
    return (
      <div className="flex flex-col items-center bg-white rounded-2xl shadow-card border border-gray-100 p-4 transform transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-3 bg-primary-50 px-3 py-1 rounded-lg">{label}</span>
        <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-50 mb-3">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>
        <h4 className="font-heading font-semibold text-dark text-center text-sm line-clamp-1">{item.name}</h4>
        <p className="text-xs text-gray-400 capitalize">{item.color} {item.type}</p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-4">
          <FiStar size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">AI-Powered</span>
        </div>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-2">AI Stylist</h1>
        <p className="text-gray-400 text-sm">Intelligent outfit recommendations based on weather and occasion.</p>
      </div>

      {renderWeatherWidget()}

      {/* Mood Selection Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading text-lg md:text-xl font-bold text-dark">How are you feeling today?</h2>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Select a mood to get personalized outfit suggestions</p>
          </div>
          {showAllMoods && (
            <button onClick={() => setShowAllMoods(false)} className="text-xs text-primary hover:underline font-medium">Show Less</button>
          )}
        </div>

        {/* Mood Cards - Show 4 on mobile, all on desktop or if expanded */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
          {MOODS.map((mood) => (
            (showAllMoods || MOODS.indexOf(mood) < 4) && (
              <button
                key={mood.id}
                onClick={() => { setOccasion(mood.id); setRecommendation(null); }}
                className={`flex flex-col items-center justify-center p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-200 border-2 transform hover:scale-105 ${
                  occasion === mood.id
                    ? `bg-gradient-to-br ${mood.color} border-primary shadow-lg ring-2 ring-primary-300`
                    : `bg-white border-gray-200 hover:border-primary-200 hover:shadow-md`
                }`}
              >
                <span className="text-xl md:text-2xl mb-1">{mood.icon}</span>
                <span className={`font-semibold text-xs md:text-sm ${occasion === mood.id ? 'text-dark' : 'text-gray-600'}`}>{mood.label}</span>
                <span className={`text-[10px] md:text-xs mt-0.5 ${occasion === mood.id ? 'text-gray-600' : 'text-gray-400'}`}>{mood.description}</span>
              </button>
            )
          ))}
        </div>

        {/* Show More/Less button for mobile */}
        {!showAllMoods && MOODS.length > 4 && (
          <button onClick={() => setShowAllMoods(true)} className="mt-3 text-xs text-primary hover:underline font-medium w-full text-center">
            View All Moods ({MOODS.length})
          </button>
        )}
      </div>

      {/* Get Outfit Button */}
      <div className="flex justify-center mb-8">
        <button onClick={generateOutfit} disabled={loading}
          className={`w-full md:w-auto px-8 md:px-12 py-3.5 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base text-white shadow-lg transform transition-all duration-300 ${
            loading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-orange shadow-orange hover:shadow-orange-lg hover:-translate-y-1'
          }`}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <FiRefreshCw className="animate-spin" size={18} /> 
              <span>Generating outfit...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FiStar size={18} />
              What Should I Wear?
            </span>
          )}
        </button>
      </div>

      {/* Mood Tips */}
      {occasion && occasion !== 'auto' && (
        <div className="mb-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl md:rounded-2xl border border-primary-100 p-4 md:p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{MOODS.find(m => m.id === occasion)?.icon}</span>
            <div>
              <h3 className="font-heading font-bold text-dark mb-1 text-sm md:text-base">{MOODS.find(m => m.id === occasion)?.label} Style Tips</h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {occasion === 'casual' && '💡 Go comfortable but stylish! Mix and match your favorite pieces. Sneakers, denim, and relaxed fits are your friends.'}
                {occasion === 'formal' && '💡 Keep it professional and polished. Structured pieces, neutral colors, and minimalist accessories work best. Make a sharp impression!'}
                {occasion === 'trendy' && '💡 Express yourself boldly! Experiment with colors, patterns, and accessories. Mix unexpected pieces for a unique look.'}
                {occasion === 'sporty' && '💡 Comfort meets style. Choose breathable materials, athleisure pieces, and active-wear that looks great off the gym too.'}
                {occasion === 'festival' && '💡 Celebrate with colors and tradition! Embrace ethnic wear, vibrant colors, and cultural pieces. Be bold and festive!'}
                {occasion === 'cozy' && '💡 Layer up for comfort! Soft textures, warm tones, and relaxed silhouettes create that perfect cozy vibe.'}
                {occasion === 'romantic' && '💡 Show elegance and charm! Flowy fabrics, soft colors, and refined details create a romantic impression.'}
                {occasion === 'auto' && '💡 Our AI will automatically suggest the perfect outfit based on time, weather, and your style!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-8 border border-red-100 text-sm">
          <FiAlertCircle size={20} className="flex-shrink-0" /><p>{error}</p>
        </div>
      )}

      {recommendation && !loading && (
        <div className="bg-primary-50 rounded-3xl shadow-card p-6 md:p-8 border border-primary-100 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FiCheckCircle size={24} className="text-green-500" />
            <h2 className="font-heading text-xl font-bold text-dark">Your Perfect Outfit</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {recommendation.type === 'two-piece' ? (
              <>
                <ClothingItemCard item={recommendation.top} label="Top" />
                <ClothingItemCard item={recommendation.bottom} label="Bottom" />
                {recommendation.outerwear && <ClothingItemCard item={recommendation.outerwear} label="Outerwear" />}
              {recommendation.footwear && <ClothingItemCard item={recommendation.footwear} label="Footwear" />}
              {recommendation.accessories && recommendation.accessories.length > 0 && <ClothingItemCard item={recommendation.accessories[0]} label="Accessory" />}
              </>
            ) : recommendation.type === 'one-piece' ? (
              <>
                <div className="sm:col-start-2"><ClothingItemCard item={recommendation.fullBody} label="Main Outfit" /></div>
                {recommendation.outerwear && <ClothingItemCard item={recommendation.outerwear} label="Outerwear" />}
                {!recommendation.outerwear && recommendation.footwear && <ClothingItemCard item={recommendation.footwear} label="Footwear" />}
              </>
            ) : (
              <>
                {recommendation.top && <ClothingItemCard item={recommendation.top} label="Top Match" />}
                {recommendation.bottom && <ClothingItemCard item={recommendation.bottom} label="Bottom Match" />}
              </>
            )}
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-white/60">
            <h4 className="font-heading font-bold text-dark mb-2 flex items-center gap-2 text-sm">
              <FiStar size={16} className="text-primary" /> AI Reasoning
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">{recommendation.reasonText || recommendation.reason || "Selected based on your available wardrobe."}</p>
            {autoDetectInfo && (
              <div className="mt-3 p-3 bg-primary-50 border border-primary-100 rounded-xl">
                <p className="text-primary-700 text-xs font-medium flex items-center gap-2"><FiStar size={12} /> {autoDetectInfo.reason}</p>
              </div>
            )}
            {recommendation.partial && <p className="text-amber-600 mt-2 text-xs">* Your wardrobe doesn't have enough items for a complete combo. Add more tops and bottoms!</p>}
          </div>

          {/* Shopping */}
          {recommendation.shoppingSuggestions && recommendation.shoppingSuggestions.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl p-6 border border-primary-100 shadow-card">
              <h3 className="font-heading text-lg font-bold text-dark mb-2 flex items-center gap-2"><FiShoppingBag size={20} className="text-primary" /> Complete the Look!</h3>
              <p className="text-xs text-gray-400 mb-6">AI-curated recommendations to elevate your style.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.shoppingSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between hover:shadow-card-hover transition">
                    <div className="mb-4">
                      <h4 className="font-heading font-bold text-dark text-base mb-1">{suggestion.title}</h4>
                      <p className="text-gray-500 text-xs">{suggestion.reason}</p>
                    </div>
                    <a href={suggestion.link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition">
                      Shop on Myntra <FiExternalLink size={14} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="mt-6 border-t border-primary-100 pt-6">
            <p className="text-center text-xs font-medium text-gray-400 mb-4 flex items-center justify-center gap-2">
              Teach the AI your style
              {(feedbackStatus === 'liking' || feedbackStatus === 'disliking') && <FiRefreshCw className="animate-spin text-primary" size={12} />}
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handleFeedback('like')} disabled={!!feedbackStatus}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  feedbackStatus === 'liked' ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}`}>
                <FiThumbsUp size={14} /> {feedbackStatus === 'liked' ? 'AI Learned!' : 'Love it!'}
              </button>
              <button onClick={() => handleFeedback('dislike')} disabled={!!feedbackStatus}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  feedbackStatus === 'disliked' ? 'bg-red-500 text-white shadow-lg' : 'bg-white text-red-500 border border-red-200 hover:bg-red-50'}`}>
                <FiThumbsDown size={14} /> {feedbackStatus === 'disliked' ? 'Re-rolling...' : 'Not my style'}
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button onClick={saveOutfit} disabled={saveStatus === 'saved' || saveStatus === 'saving'}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all ${
                saveStatus === 'saved' ? 'bg-green-50 text-green-700 border border-green-200' :
                saveStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                'bg-white text-primary border-2 border-primary-200 hover:bg-primary-50 hover:border-primary'}`}>
              <FiCalendar size={16} />
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Outfit Saved to History!' : 'Mark as Worn Today'}
            </button>
          </div>
        </div>
      )}

      {loading && !recommendation && (
        <div className="bg-gray-50 rounded-3xl h-80 w-full flex items-center justify-center border border-gray-100 animate-pulse">
          <div className="flex flex-col items-center">
            <FiRefreshCw size={32} className="text-primary animate-spin mb-4" />
            <p className="text-sm text-gray-400 font-medium">Analyzing weather and wardrobe...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommend;
