import React, { useState, useEffect } from 'react';
import { adminAPI, clothingAPI } from '../services/api';
import { FiUsers, FiShoppingBag, FiHeart, FiTrash2, FiActivity, FiGlobe, FiShield, FiRefreshCw, FiFilter, FiSearch, FiDroplet, FiWind, FiCalendar, FiMapPin, FiInfo, FiTrendingUp } from 'react-icons/fi';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // overview, donations
  const [donationFilter, setDonationFilter] = useState('all'); // all, pending, completed
  const [searchDonation, setSearchDonation] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        adminAPI.getStats(), 
        adminAPI.getUsers(),
        adminAPI.getDonations() // Fetch all donations from admin endpoint
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      
      // Set donations directly from admin endpoint
      setDonations(donationsRes.data.donations || []);
      setError('');
    } catch (err) { 
      console.error(err); 
      setError('Failed to fetch admin data.'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Delete ${name} and all their data? This cannot be undone.`)) {
      try { 
        await adminAPI.deleteUser(id); 
        setUsers(users.filter(u => u._id !== id)); 
        fetchData(); 
      }
      catch (err) { alert(err.response?.data?.message || 'Failed to delete user'); }
    }
  };

  // Donation statistics
  const donationStats = {
    totalDonated: donations.length,
    waterSaved: donations.length * 2700, // liters per item
    carbonSaved: donations.length * 2, // kg CO2 per item
    byCondition: {
      'Like New': donations.filter(d => d.condition === 'Like New').length,
      'Gently Used': donations.filter(d => d.condition === 'Gently Used').length,
      'Worn Out': donations.filter(d => d.condition === 'Worn Out').length,
    },
    byType: {}
  };

  // Calculate by type
  donations.forEach(d => {
    donationStats.byType[d.type] = (donationStats.byType[d.type] || 0) + 1;
  });

  // Filter donations
  const filteredDonations = donations.filter(d => {
    const matchesFilter = donationFilter === 'all' || (donationFilter === 'pending' && !d.donatedTo) || (donationFilter === 'completed' && d.donatedTo);
    const matchesSearch = searchDonation === '' || 
      d.name?.toLowerCase().includes(searchDonation.toLowerCase()) ||
      d.brand?.toLowerCase().includes(searchDonation.toLowerCase()) ||
      d.color?.toLowerCase().includes(searchDonation.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-orange">
                <FiShield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark">Admin Dashboard</h1>
                <p className="text-xs md:text-sm text-gray-400">System overview & management</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 border border-green-100 text-green-600 text-xs font-semibold">
              <FiActivity size={14} /> System Online
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6 md:mt-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview'
                  ? 'bg-primary text-white shadow-orange'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'donations'
                  ? 'bg-primary text-white shadow-orange'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Donations
              {donations.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {donations.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">{error}</div>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
                {[
                  { icon: FiUsers, label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-50 text-blue-500', border: 'border-blue-200' },
                  { icon: FiShoppingBag, label: 'Clothes Uploaded', value: stats.totalClothes, color: 'bg-purple-50 text-purple-500', border: 'border-purple-200' },
                  { icon: FiHeart, label: 'Items Donated', value: stats.totalDonated, color: 'bg-primary-50 text-primary', border: 'border-primary-200' },
                  { icon: FiGlobe, label: 'CO2 Prevented', value: `${stats.impact.co2PreventedKg} kg`, color: 'bg-green-50 text-green-500', border: 'border-green-200' },
                ].map((card, i) => (
                  <div key={i} className={`bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-card border-l-4 ${card.border} hover:shadow-card-hover transition-all duration-200`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-dark mt-2">{card.value}</h3>
                      </div>
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                        <card.icon size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* User Table */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-card overflow-hidden border border-gray-100">
              <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
                <h2 className="font-heading text-lg md:text-xl font-bold text-dark">User Management</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-400 text-xs border-b border-gray-100">
                      <th className="py-3 md:py-4 px-4 md:px-6 font-semibold uppercase tracking-wider">User</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-semibold uppercase tracking-wider hidden md:table-cell">Role</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-semibold uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-semibold uppercase tracking-wider">Items</th>
                      <th className="py-3 md:py-4 px-4 md:px-6 font-semibold uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-primary-50/20 transition">
                        <td className="py-3 md:py-4 px-4 md:px-6">
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-orange flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-dark text-xs md:text-sm">{u.name}</div>
                              <div className="text-xs text-gray-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 hidden md:table-cell">
                          <span className={`px-2 py-1 text-[10px] rounded-lg font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-primary-50 text-primary border border-primary-100' : 'bg-gray-100 text-gray-500'}`}>
                            {(u.role || 'user')}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-gray-400 hidden lg:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 md:py-4 px-4 md:px-6">
                          <span className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-dark">
                            <FiShoppingBag className="text-gray-300" size={14} /> {u.clothingCount}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-4 md:px-6 text-right">
                          {u.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-2 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 transition" title="Delete User">
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* DONATIONS TAB */}
        {activeTab === 'donations' && (
          <>
            {/* Donation Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
              {[
                { icon: FiHeart, label: 'Total Donated', value: donationStats.totalDonated, color: 'bg-red-50 text-red-500', border: 'border-red-200' },
                { icon: FiDroplet, label: 'Water Saved', value: `${donationStats.waterSaved.toLocaleString()} L`, color: 'bg-blue-50 text-blue-500', border: 'border-blue-200' },
                { icon: FiWind, label: 'CO2 Prevented', value: `${donationStats.carbonSaved} kg`, color: 'bg-green-50 text-green-500', border: 'border-green-200' },
                { icon: FiTrendingUp, label: 'Impact Score', value: `${(donationStats.totalDonated * 10).toLocaleString()}`, color: 'bg-purple-50 text-purple-500', border: 'border-purple-200' },
              ].map((card, i) => (
                <div key={i} className={`bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-card border-l-4 ${card.border} hover:shadow-card-hover transition-all`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{card.label}</p>
                      <h3 className="font-heading text-lg md:text-2xl font-bold text-dark mt-2">{card.value}</h3>
                    </div>
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl ${card.color} flex items-center justify-center flex-shrink-0`}>
                      <card.icon size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Donation Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              {/* By Condition */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-card p-4 md:p-6 border border-gray-100">
                <h3 className="font-heading font-bold text-dark mb-4 text-sm md:text-base">By Condition</h3>
                <div className="space-y-3">
                  {['Like New', 'Gently Used', 'Worn Out'].map((condition) => (
                    <div key={condition} className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600">{condition}</span>
                      <span className="font-bold text-dark">{donationStats.byCondition[condition] || 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Types Donated */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-card p-4 md:p-6 border border-gray-100">
                <h3 className="font-heading font-bold text-dark mb-4 text-sm md:text-base">Top Types</h3>
                <div className="space-y-3">
                  {Object.entries(donationStats.byType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-xs md:text-sm text-gray-600 capitalize">{type}</span>
                        <span className="font-bold text-dark">{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Donation Status */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-card p-4 md:p-6 border border-gray-100">
                <h3 className="font-heading font-bold text-dark mb-4 text-sm md:text-base">Status</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Pending', count: donations.filter(d => !d.donatedTo).length, color: 'text-yellow-600' },
                    { label: 'Completed', count: donations.filter(d => d.donatedTo).length, color: 'text-green-600' },
                  ].map(({ label, count, color }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-gray-600">{label}</span>
                      <span className={`font-bold ${color}`}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-card p-4 md:p-6 border border-gray-100 mb-6 md:mb-8">
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-3 text-gray-300 md:top-1/2 md:-translate-y-1/2" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, brand, color..."
                    value={searchDonation}
                    onChange={(e) => setSearchDonation(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'pending', 'completed'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDonationFilter(filter)}
                      className={`px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                        donationFilter === filter
                          ? 'bg-primary text-white shadow-orange'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Donations List */}
            {filteredDonations.length === 0 ? (
              <div className="bg-white rounded-xl md:rounded-2xl shadow-card border border-gray-100 p-8 md:p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <FiInfo size={28} className="text-gray-300" />
                </div>
                <h3 className="font-heading text-lg font-bold text-gray-600 mb-2">No donations found</h3>
                <p className="text-sm text-gray-400">Try adjusting your filters or search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredDonations.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedDonation(item)}
                    className="bg-white rounded-xl md:rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all cursor-pointer transform hover:-translate-y-1"
                  >
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        item.donatedTo 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {item.donatedTo ? 'Completed' : 'Pending'}
                      </span>
                    </div>

                    {/* Image Placeholder */}
                    <div className="h-40 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <FiShoppingBag className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-xs text-gray-400 capitalize">{item.type}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4 md:p-5">
                      <h4 className="font-bold text-dark text-sm md:text-base mb-1 capitalize">{item.name}</h4>
                      <div className="space-y-2 mb-4">
                        <p className="text-xs text-gray-500"><strong>Brand:</strong> {item.brand || 'N/A'}</p>
                        <p className="text-xs text-gray-500"><strong>Color:</strong> <span className="capitalize">{item.color}</span></p>
                        <p className="text-xs text-gray-500"><strong>Condition:</strong> {item.condition || 'Not specified'}</p>
                        <p className="text-xs text-gray-500"><strong>Size:</strong> {item.size}</p>
                      </div>
                      
                      {item.donatedTo && (
                        <div className="bg-green-50 rounded-lg p-2 mb-3 border border-green-200">
                          <p className="text-xs text-green-700"><strong>Donated to:</strong> {item.donatedTo}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-400 flex items-center gap-1">
                        <FiCalendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Donation Detail Modal */}
            {selectedDonation && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedDonation(null)}>
                <div className="bg-white rounded-2xl shadow-elevated max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in" onClick={e => e.stopPropagation()}>
                  <div className="sticky top-0 bg-white border-b border-gray-100 p-4 md:p-6 flex justify-between items-center">
                    <h2 className="font-heading font-bold text-dark text-lg">Donation Details</h2>
                    <button onClick={() => setSelectedDonation(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                  </div>

                  <div className="p-4 md:p-6 space-y-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl h-48 flex items-center justify-center">
                      <div className="text-center">
                        <FiShoppingBag className="mx-auto text-gray-300 mb-2" size={48} />
                        <p className="text-sm text-gray-400 capitalize">{selectedDonation.type}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-dark text-lg capitalize mb-1">{selectedDonation.name}</h3>
                      <p className="text-xs text-gray-500">ID: {selectedDonation._id}</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <p><strong className="text-gray-600">Brand:</strong> <span className="text-gray-700">{selectedDonation.brand || 'N/A'}</span></p>
                      <p><strong className="text-gray-600">Color:</strong> <span className="text-gray-700 capitalize">{selectedDonation.color}</span></p>
                      <p><strong className="text-gray-600">Type:</strong> <span className="text-gray-700 capitalize">{selectedDonation.type}</span></p>
                      <p><strong className="text-gray-600">Category:</strong> <span className="text-gray-700 capitalize">{selectedDonation.category}</span></p>
                      <p><strong className="text-gray-600">Size:</strong> <span className="text-gray-700">{selectedDonation.size}</span></p>
                      <p><strong className="text-gray-600">Condition:</strong> <span className="text-gray-700">{selectedDonation.condition || 'Not specified'}</span></p>
                    </div>

                    {selectedDonation.description && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Description</p>
                        <p className="text-xs text-gray-700">{selectedDonation.description}</p>
                      </div>
                    )}

                    <div className={`rounded-lg p-3 border ${
                      selectedDonation.donatedTo
                        ? 'bg-green-50 border-green-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <p className={`text-xs font-bold ${selectedDonation.donatedTo ? 'text-green-700' : 'text-yellow-700'}`}>
                        Status: {selectedDonation.donatedTo ? `Completed - ${selectedDonation.donatedTo}` : 'Pending'}
                      </p>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 space-y-2">
                      <p className="text-xs font-bold text-blue-700">Environmental Impact</p>
                      <div className="space-y-1">
                        <p className="text-xs text-blue-600 flex items-center gap-2"><FiDroplet size={12} /> 2,700 L water saved</p>
                        <p className="text-xs text-blue-600 flex items-center gap-2"><FiWind size={12} /> 2 kg CO2 prevented</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Uploaded: {new Date(selectedDonation.createdAt).toLocaleString()}</p>
                      <p>Last Updated: {new Date(selectedDonation.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
