import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import {
  FiUsers, FiShoppingBag, FiHeart, FiTrash2, FiActivity, FiShield,
  FiRefreshCw, FiSearch, FiDroplet, FiWind, FiCalendar, FiInfo,
  FiTrendingUp, FiDatabase, FiCpu, FiServer, FiCheck, FiX,
  FiChevronDown, FiChevronUp, FiStar, FiEye, FiUserPlus, FiUserMinus,
  FiImage, FiFilter, FiClock, FiBarChart2
} from 'react-icons/fi';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);
  const [clothing, setClothing] = useState([]);
  const [clothingTotal, setClothingTotal] = useState(0);
  const [clothingPage, setClothingPage] = useState(1);
  const [clothingFilter, setClothingFilter] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [searchUser, setSearchUser] = useState('');
  const [searchClothing, setSearchClothing] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedWardrobe, setExpandedWardrobe] = useState([]);
  const [wardrobeLoading, setWardrobeLoading] = useState(false);
  const [donationFilter, setDonationFilter] = useState('all');
  const [searchDonation, setSearchDonation] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getDonations()
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setDonations(donationsRes.data.donations || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await adminAPI.getAnalytics();
      setAnalytics(res.data.analytics);
    } catch (err) { console.error(err); }
  }, []);

  const fetchSystemInfo = useCallback(async () => {
    try {
      const res = await adminAPI.getSystemInfo();
      setSystemInfo(res.data.system);
    } catch (err) { console.error(err); }
  }, []);

  const fetchClothing = useCallback(async (page = 1, filters = {}) => {
    try {
      const res = await adminAPI.getAllClothing({ page, limit: 24, ...filters });
      setClothing(res.data.items);
      setClothingTotal(res.data.total);
      setClothingPage(res.data.page);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics' && !analytics) fetchAnalytics();
    if (activeTab === 'system' && !systemInfo) fetchSystemInfo();
    if (activeTab === 'wardrobe') fetchClothing(1, clothingFilter);
  }, [activeTab]);

  // User actions
  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Delete ${name} and ALL their data? This cannot be undone.`)) {
      try {
        setActionLoading(id);
        await adminAPI.deleteUser(id);
        setUsers(users.filter(u => u._id !== id));
        fetchData();
      } catch (err) { alert(err.response?.data?.message || 'Failed'); }
      finally { setActionLoading(null); }
    }
  };

  const handleToggleRole = async (id, currentRole, name) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const action = newRole === 'admin' ? 'Promote' : 'Demote';
    if (window.confirm(`${action} ${name} to ${newRole}?`)) {
      try {
        setActionLoading(id);
        await adminAPI.updateUserRole(id, newRole);
        setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
      } catch (err) { alert(err.response?.data?.message || 'Failed'); }
      finally { setActionLoading(null); }
    }
  };

  const handleViewWardrobe = async (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    try {
      setWardrobeLoading(true);
      setExpandedUser(userId);
      const res = await adminAPI.getUserWardrobe(userId);
      setExpandedWardrobe(res.data.wardrobe);
    } catch (err) { console.error(err); }
    finally { setWardrobeLoading(false); }
  };

  const handleDeleteClothing = async (id) => {
    if (window.confirm('Delete this clothing item permanently?')) {
      try {
        setActionLoading(id);
        await adminAPI.deleteClothing(id);
        setClothing(clothing.filter(c => c._id !== id));
        setExpandedWardrobe(expandedWardrobe.filter(c => c._id !== id));
        setClothingTotal(prev => prev - 1);
      } catch (err) { alert('Failed to delete'); }
      finally { setActionLoading(null); }
    }
  };

  // Filters
  const filteredUsers = users.filter(u => {
    if (!searchUser) return true;
    const q = searchUser.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.username?.toLowerCase().includes(q);
  });

  const filteredDonations = donations.filter(d => {
    const matchesFilter = donationFilter === 'all' || (donationFilter === 'pending' && !d.donatedTo) || (donationFilter === 'completed' && d.donatedTo);
    const matchesSearch = !searchDonation || d.name?.toLowerCase().includes(searchDonation.toLowerCase()) || d.brand?.toLowerCase().includes(searchDonation.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'users', label: 'Users', icon: FiUsers, badge: users.length },
    { id: 'wardrobe', label: 'Wardrobe', icon: FiShoppingBag },
    { id: 'donations', label: 'Donations', icon: FiHeart, badge: donations.length },
    { id: 'system', label: 'System', icon: FiServer },
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-orange">
                <FiShield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-heading text-2xl md:text-3xl font-bold text-dark">Admin Panel</h1>
                <p className="text-xs text-gray-400">Full system control & management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={fetchData} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition">
                <FiRefreshCw size={16} />
              </button>
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-green-50 border border-green-100 text-green-600 text-xs font-semibold">
                <FiActivity size={14} /> Online
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap relative ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-orange'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon size={15} />
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <div className="max-w-7xl mx-auto px-4 mt-4 bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100">{error}</div>}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ═══════════════════ OVERVIEW TAB ═══════════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-8">
                {[
                  { icon: FiUsers, label: 'Users', value: stats.totalUsers, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { icon: FiShoppingBag, label: 'Clothes', value: stats.totalClothes, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
                  { icon: FiHeart, label: 'Donated', value: stats.totalDonated, color: 'text-primary', bg: 'bg-primary-50', border: 'border-primary-200' },
                  { icon: FiStar, label: 'Outfits', value: stats.totalOutfits || 0, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                  { icon: FiWind, label: 'CO₂ Saved', value: `${stats.impact.co2PreventedKg}kg`, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
                ].map((card, i) => (
                  <div key={i} className={`bg-white p-4 rounded-xl shadow-card border-l-4 ${card.border} hover:shadow-card-hover transition-all`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                        <h3 className="font-heading text-xl md:text-2xl font-bold text-dark mt-1">{card.value}</h3>
                      </div>
                      <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center ${card.color} flex-shrink-0`}>
                        <card.icon size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Analytics Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Recent Users */}
              <div className="bg-white rounded-2xl shadow-card p-5 border border-gray-100">
                <h3 className="font-heading font-bold text-dark mb-4 flex items-center gap-2 text-sm">
                  <FiUsers size={16} className="text-blue-500" /> Recent Users
                </h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map(u => (
                    <div key={u._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-orange flex items-center justify-center text-white text-xs font-bold">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-dark">{u.name}</p>
                          <p className="text-[10px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400">{u.clothingCount} items</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-2xl shadow-card p-5 border border-gray-100">
                <h3 className="font-heading font-bold text-dark mb-4 flex items-center gap-2 text-sm">
                  <FiTrendingUp size={16} className="text-green-500" /> Platform Health
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Avg items/user', value: users.length ? Math.round(stats?.totalClothes / users.length) : 0 },
                    { label: 'Donation rate', value: stats ? `${Math.round((stats.totalDonated / Math.max(stats.totalClothes, 1)) * 100)}%` : '0%' },
                    { label: 'Admin accounts', value: users.filter(u => u.role === 'admin').length },
                    { label: 'Water saved', value: `${((stats?.totalDonated || 0) * 2.7).toFixed(0)}K L` },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <span className="text-xs text-gray-500">{item.label}</span>
                      <span className="text-sm font-bold text-dark">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════════ USERS TAB ═══════════════════ */}
        {activeTab === 'users' && (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="text" placeholder="Search users by name, email, username..."
                  value={searchUser} onChange={e => setSearchUser(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
            </div>

            {/* User Cards */}
            <div className="space-y-3">
              {filteredUsers.map(u => (
                <div key={u._id} className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-orange flex items-center justify-center text-white font-bold flex-shrink-0">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-dark text-sm truncate">{u.name}</h4>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-primary-50 text-primary border border-primary-100' : 'bg-gray-100 text-gray-500'
                          }`}>{u.role || 'user'}</span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-3">
                      {/* Stats pills */}
                      <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><FiShoppingBag size={12} /> {u.clothingCount}</span>
                        <span className="flex items-center gap-1"><FiStar size={12} /> {u.outfitCount || 0}</span>
                        <span className="flex items-center gap-1"><FiHeart size={12} /> {u.donatedCount || 0}</span>
                      </div>

                      {/* View wardrobe */}
                      <button onClick={() => handleViewWardrobe(u._id)} title="View wardrobe"
                        className={`p-2 rounded-lg transition ${expandedUser === u._id ? 'bg-primary-50 text-primary' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                        {expandedUser === u._id ? <FiChevronUp size={16} /> : <FiEye size={16} />}
                      </button>

                      {/* Toggle role */}
                      {u._id !== user?._id && (
                        <button onClick={() => handleToggleRole(u._id, u.role, u.name)} title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                          disabled={actionLoading === u._id}
                          className={`p-2 rounded-lg transition ${
                            u.role === 'admin' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                          }`}>
                          {u.role === 'admin' ? <FiUserMinus size={16} /> : <FiUserPlus size={16} />}
                        </button>
                      )}

                      {/* Delete */}
                      {u.role !== 'admin' && u._id !== user?._id && (
                        <button onClick={() => handleDeleteUser(u._id, u.name)} disabled={actionLoading === u._id}
                          className="p-2 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 hover:text-red-600 transition" title="Delete user">
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mobile stats */}
                  <div className="md:hidden px-4 pb-2 flex items-center gap-4 text-xs text-gray-400">
                    <span><FiShoppingBag size={12} className="inline mr-1" />{u.clothingCount} items</span>
                    <span><FiStar size={12} className="inline mr-1" />{u.outfitCount || 0} outfits</span>
                    <span className="ml-auto text-[10px]">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Expanded Wardrobe */}
                  {expandedUser === u._id && (
                    <div className="border-t border-gray-100 bg-gray-50 p-4">
                      {wardrobeLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <FiRefreshCw className="animate-spin text-primary" size={20} />
                        </div>
                      ) : expandedWardrobe.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">No items in wardrobe</p>
                      ) : (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                          {expandedWardrobe.map(item => (
                            <div key={item._id} className="group relative bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition">
                              <div className="aspect-square bg-gray-100">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center"><FiImage className="text-gray-300" size={20} /></div>
                                )}
                              </div>
                              <div className="p-1.5">
                                <p className="text-[10px] font-semibold text-dark truncate">{item.name}</p>
                                <p className="text-[9px] text-gray-400 capitalize">{item.color} {item.type}</p>
                              </div>
                              {/* Delete overlay */}
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteClothing(item._id); }}
                                className="absolute top-1 right-1 p-1 rounded bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity" title="Delete item">
                                <FiTrash2 size={10} />
                              </button>
                              {item.isDonated && (
                                <span className="absolute top-1 left-1 px-1 py-0.5 bg-green-500 text-white text-[8px] rounded font-bold">Donated</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ═══════════════════ WARDROBE TAB ═══════════════════ */}
        {activeTab === 'wardrobe' && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" placeholder="Search items..."
                  value={searchClothing} onChange={e => setSearchClothing(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
              </div>
              <select value={clothingFilter.type || ''} onChange={e => { const f = { ...clothingFilter, type: e.target.value || undefined }; setClothingFilter(f); fetchClothing(1, f); }}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
                <option value="">All Types</option>
                {['shirt', 't-shirt', 'pants', 'jacket', 'sweater', 'dress', 'skirt', 'shoes', 'watch', 'belt', 'sunglasses', 'cap', 'kurta'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select value={clothingFilter.donated || ''} onChange={e => { const f = { ...clothingFilter, donated: e.target.value || undefined }; setClothingFilter(f); fetchClothing(1, f); }}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-600">
                <option value="">All Status</option>
                <option value="false">Active</option>
                <option value="true">Donated</option>
              </select>
              <span className="text-xs text-gray-400 font-semibold">{clothingTotal} items total</span>
            </div>

            {clothing.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
                <FiShoppingBag className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-400 text-sm">No items found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {clothing.filter(item => {
                    if (!searchClothing) return true;
                    const q = searchClothing.toLowerCase();
                    return item.name?.toLowerCase().includes(q) || item.color?.toLowerCase().includes(q) || item.brand?.toLowerCase().includes(q);
                  }).map(item => (
                    <div key={item._id} className="group bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all relative">
                      <div className="aspect-square bg-gray-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FiImage className="text-gray-200" size={28} /></div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-semibold text-dark truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{item.color} · {item.type}</p>
                        {item.user && <p className="text-[9px] text-gray-300 mt-1 truncate">by {item.user.name}</p>}
                      </div>
                      <button onClick={() => handleDeleteClothing(item._id)} disabled={actionLoading === item._id}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" title="Delete">
                        <FiTrash2 size={12} />
                      </button>
                      {item.isDonated && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-green-500 text-white text-[9px] rounded-md font-bold shadow-sm">Donated</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: Math.ceil(clothingTotal / 24) }, (_, i) => i + 1).slice(0, 10).map(p => (
                    <button key={p} onClick={() => fetchClothing(p, clothingFilter)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                        p === clothingPage ? 'bg-primary text-white shadow-orange' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}>{p}</button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ═══════════════════ DONATIONS TAB ═══════════════════ */}
        {activeTab === 'donations' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {[
                { icon: FiHeart, label: 'Total Donated', value: donations.length, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
                { icon: FiDroplet, label: 'Water Saved', value: `${(donations.length * 2700).toLocaleString()} L`, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
                { icon: FiWind, label: 'CO₂ Prevented', value: `${donations.length * 2} kg`, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
                { icon: FiTrendingUp, label: 'Impact Score', value: donations.length * 10, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
              ].map((card, i) => (
                <div key={i} className={`bg-white p-4 rounded-xl shadow-card border-l-4 ${card.border}`}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                  <h3 className="font-heading text-lg md:text-xl font-bold text-dark mt-1">{card.value}</h3>
                </div>
              ))}
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" placeholder="Search donations..." value={searchDonation} onChange={e => setSearchDonation(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
              </div>
              {['all', 'pending', 'completed'].map(f => (
                <button key={f} onClick={() => setDonationFilter(f)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition ${
                    donationFilter === f ? 'bg-primary text-white shadow-orange' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>

            {/* Donation Grid */}
            {filteredDonations.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-12 text-center border border-gray-100">
                <FiInfo className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-gray-400 text-sm">No donations found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDonations.map(item => (
                  <div key={item._id} className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden hover:shadow-card-hover transition-all relative">
                    <div className="h-40 bg-gray-50 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                      ) : (
                        <FiShoppingBag className="text-gray-200" size={36} />
                      )}
                    </div>
                    <span className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold ${
                      item.donatedTo ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    }`}>{item.donatedTo ? 'Completed' : 'Pending'}</span>
                    <div className="p-4">
                      <h4 className="font-semibold text-dark text-sm capitalize mb-2">{item.name}</h4>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                        <p><strong>Type:</strong> {item.type}</p>
                        <p><strong>Color:</strong> {item.color}</p>
                        <p><strong>Size:</strong> {item.size}</p>
                        <p><strong>Condition:</strong> {item.condition || 'N/A'}</p>
                      </div>
                      {item.user && <p className="text-[10px] text-gray-400 mt-2">by {item.user.name} · {new Date(item.createdAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ═══════════════════ SYSTEM TAB ═══════════════════ */}
        {activeTab === 'system' && (
          <>
            {!systemInfo ? (
              <div className="flex justify-center py-12"><FiRefreshCw className="animate-spin text-primary" size={24} /></div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Server Info */}
                <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                  <h3 className="font-heading font-bold text-dark mb-5 flex items-center gap-2">
                    <FiServer size={18} className="text-blue-500" /> Server
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Node.js', value: systemInfo.nodeVersion, icon: '🟢' },
                      { label: 'Platform', value: systemInfo.platform, icon: '💻' },
                      { label: 'Uptime', value: formatUptime(systemInfo.uptime), icon: '⏱️' },
                      { label: 'Memory (RSS)', value: `${systemInfo.memoryUsage.rss} MB`, icon: '🧠' },
                      { label: 'Heap Used', value: `${systemInfo.memoryUsage.heapUsed} / ${systemInfo.memoryUsage.heapTotal} MB`, icon: '📊' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500 flex items-center gap-2">{item.icon} {item.label}</span>
                        <span className="text-sm font-semibold text-dark font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Database Info */}
                <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100">
                  <h3 className="font-heading font-bold text-dark mb-5 flex items-center gap-2">
                    <FiDatabase size={18} className="text-green-500" /> Database
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Database Name', value: systemInfo.database.name, icon: '🗄️' },
                      { label: 'Collections', value: systemInfo.database.collections, icon: '📁' },
                      { label: 'Data Size', value: `${systemInfo.database.dataSize} KB`, icon: '💾' },
                      { label: 'Storage Size', value: `${systemInfo.database.storageSize} KB`, icon: '📦' },
                      { label: 'Indexes', value: systemInfo.database.indexes, icon: '🔍' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500 flex items-center gap-2">{item.icon} {item.label}</span>
                        <span className="text-sm font-semibold text-dark font-mono">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* API Health */}
                <div className="bg-white rounded-2xl shadow-card p-6 border border-gray-100 lg:col-span-2">
                  <h3 className="font-heading font-bold text-dark mb-5 flex items-center gap-2">
                    <FiActivity size={18} className="text-amber-500" /> Service Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'MongoDB', connected: systemInfo.env.mongoConnected },
                      { label: 'Cloudinary', connected: systemInfo.env.cloudinaryConfigured },
                      { label: 'HuggingFace AI', connected: systemInfo.env.huggingfaceConfigured },
                      { label: 'Weather API', connected: systemInfo.env.weatherApiConfigured },
                    ].map((svc, i) => (
                      <div key={i} className={`p-4 rounded-xl border-2 text-center ${
                        svc.connected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                          svc.connected ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                        }`}>
                          {svc.connected ? <FiCheck size={16} /> : <FiX size={16} />}
                        </div>
                        <p className="text-xs font-semibold text-dark">{svc.label}</p>
                        <p className={`text-[10px] font-bold mt-1 ${svc.connected ? 'text-green-600' : 'text-red-500'}`}>
                          {svc.connected ? 'Connected' : 'Not Configured'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Refresh */}
                <div className="lg:col-span-2 text-center">
                  <button onClick={fetchSystemInfo}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    <FiRefreshCw size={14} /> Refresh System Info
                  </button>
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
