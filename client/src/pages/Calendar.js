import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { historyAPI } from '../services/api';
import './CalendarCustom.css';
import 'react-calendar/dist/Calendar.css';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  const [outfitHistory, setOutfitHistory] = useState([]);
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOutfitHistory();
  }, []);

  const fetchOutfitHistory = async () => {
    try {
      setLoading(true);
      const response = await historyAPI.getHistory();
      setOutfitHistory(response.data.history || []);
      setError('');
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load outfit history');
    } finally {
      setLoading(false);
    }
  };

  const getOutfitsForDate = (selectedDate) => {
    return outfitHistory.filter(outfit => {
      const outfitDate = new Date(outfit.createdAt);
      return (
        outfitDate.getDate() === selectedDate.getDate() &&
        outfitDate.getMonth() === selectedDate.getMonth() &&
        outfitDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  };

  const handleDateChange = (selectedDate) => {
    setDate(selectedDate);
    const outfits = getOutfitsForDate(selectedDate);
    setSelectedOutfit(outfits.length > 0 ? outfits[0] : null);
  };

  const hasOutfitOnDate = (date) => {
    return getOutfitsForDate(date).length > 0;
  };

  const selectedDayOutfits = getOutfitsForDate(date);

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-orange text-white">
            <FiCalendar size={24} />
          </div>
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark">Outfit History</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Track your daily outfits and discover patterns.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Calendar Side */}
          <div className="lg:col-span-5 xl:col-span-4 animate-slide-up">
            <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 sticky top-24">
              <div className="calendar-wrapper-custom">
                <Calendar
                  onChange={handleDateChange}
                  value={date}
                  tileClassName={({ date }) => hasOutfitOnDate(date) ? 'has-outfit' : ''}
                  navigationLabel={({ date }) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  prevLabel={<FiChevronLeft />}
                  nextLabel={<FiChevronRight />}
                />
              </div>
            </div>
          </div>

          {/* Details Side */}
          <div className="lg:col-span-7 xl:col-span-8 animate-slide-up" style={{animationDelay: '100ms'}}>
            {loading ? (
              <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center mb-4 animate-pulse">
                  <FiCalendar size={24} className="animate-spin-slow" />
                </div>
                <h3 className="font-heading font-semibold text-dark text-lg mb-1">Loading History</h3>
                <p className="text-sm text-gray-500">Retrieving your wardrobe timeline...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-2xl border border-red-100 p-6 text-red-600">
                {error}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-card border border-gray-100 p-6 md:p-8 min-h-[500px]">
                <div className="border-b border-gray-100 pb-5 mb-6">
                  <h2 className="font-heading text-2xl font-bold text-dark flex items-center gap-2">
                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                </div>

                {selectedDayOutfits.length > 0 ? (
                  <div className="space-y-6">
                    {selectedDayOutfits.map((outfit, index) => (
                      <div key={outfit._id || index} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:shadow-card-hover transition-shadow duration-300">
                        
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-heading font-bold text-dark text-lg flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary flex items-center justify-center text-xs">
                              {index + 1}
                            </span>
                            Outfit Record
                          </h3>
                          <span className="bg-white px-3 py-1 rounded-lg text-xs font-semibold text-primary border border-gray-100 shadow-sm">
                            {new Date(outfit.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {outfit.clothingItems && outfit.clothingItems.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {outfit.clothingItems.map((item, idx) => (
                              <div key={idx} className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col hover:-translate-y-1 transition-transform">
                                {item.imageUrl && (
                                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2">
                                    <img 
                                      src={item.imageUrl} 
                                      alt={item.name || item.type} 
                                      crossOrigin="anonymous"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                <div className="text-center px-1">
                                  <p className="text-[10px] font-bold text-primary uppercase tracking-wider line-clamp-1">{item.category}</p>
                                  <p className="text-xs text-dark font-medium truncate">{item.color} {item.type}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-white p-4 rounded-xl border border-gray-100 text-center text-gray-500 text-sm">
                            No clothing items logged for this outfit.
                          </div>
                        )}

                        {outfit.notes && (
                          <div className="mt-4 p-4 bg-white rounded-xl border border-primary-100">
                            <p className="text-sm text-gray-600 italic">"{outfit.notes}"</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <FiCalendar size={24} className="text-gray-300" />
                    </div>
                    <h3 className="font-heading font-semibold text-dark text-lg mb-1">No Outfits Recorded</h3>
                    <p className="text-sm text-gray-400 max-w-xs">You didn't mark any outfits as worn on this date. Use the AI Stylist to generate and save your looks!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
