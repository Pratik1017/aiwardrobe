import React, { useState, useEffect, useCallback } from 'react';
import { clothingAPI } from '../services/api';
import ClothingCard from '../components/ClothingCard';
import { FiFilter, FiX, FiSearch, FiRefreshCw, FiPlus, FiGrid, FiList, FiActivity, FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [clothing, setClothing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({ type: '', color: '', category: '', size: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClothing = useCallback(async (filterParams = {}) => {
    try {
      setLoading(true);
      let response;
      if (Object.values(filterParams).some(val => val)) {
        response = await clothingAPI.filterClothing(filterParams);
      } else {
        response = await clothingAPI.getClothing();
      }
      setClothing(response.data.clothing);
      setError('');
    } catch (err) {
      setError('Failed to fetch clothing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchClothing(); }, [fetchClothing]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = Object.fromEntries(Object.entries(filter).filter(([, v]) => v));
    fetchClothing(activeFilters);
  };

  const resetFilters = () => { 
    setFilter({ type: '', color: '', category: '', size: '' }); 
    setSearchQuery('');
    fetchClothing(); 
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await clothingAPI.deleteClothing(id);
        setClothing(prev => prev.filter(c => c._id !== id));
      } catch (err) { setError('Failed to delete clothing'); }
    }
  };

  const handleEditOpen = (clothingItem) => {
    setEditItem(clothingItem);
    setEditForm({
      name: clothingItem.name || '', type: clothingItem.type || '', color: clothingItem.color || '',
      category: clothingItem.category || '', size: clothingItem.size || 'One Size',
      description: clothingItem.description || '', brand: clothingItem.brand || '',
      tags: clothingItem.tags ? clothingItem.tags.join(', ') : ''
    });
    setEditError('');
  };

  const handleEditClose = () => { setEditItem(null); setEditForm({}); setEditError(''); };
  const handleEditChange = (e) => { const { name, value } = e.target; setEditForm(prev => ({ ...prev, [name]: value })); };

  const handleEditSave = async () => {
    try {
      setEditLoading(true); setEditError('');
      const updateData = { ...editForm };
      if (updateData.tags && typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean).join(',');
      }
      const response = await clothingAPI.updateClothing(editItem._id, updateData);
      setClothing(prev => prev.map(c => c._id === editItem._id ? response.data.clothing : c));
      handleEditClose();
    } catch (err) { setEditError(err.response?.data?.message || 'Failed to update clothing'); }
    finally { setEditLoading(false); }
  };

  // Filter by search query
  const filteredClothing = clothing.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.color?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate statistics
  const stats = {
    total: clothing.length,
    byType: clothing.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {}),
    byCategory: clothing.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}),
    byColor: clothing.reduce((acc, item) => {
      acc[item.color] = (acc[item.color] || 0) + 1;
      return acc;
    }, {})
  };

  const typeOptions = ['shirt','t-shirt','pants','dress','skirt','jacket','sweater','shoes','accessories','kurta','watch','belt','sunglasses','cap','other'];
  const categoryOptions = ['casual','formal','sports','sleepwear','other'];
  const sizeOptions = ['XS','S','M','L','XL','XXL','One Size'];

  const selectClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5";

  return (
    <div className="min-h-screen bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-2">Your Wardrobe</h1>
          <p className="text-gray-500 text-sm md:text-base">Welcome back, <span className="font-semibold text-dark">{user.name}</span></p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
            <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-1 md:mb-2">Total Items</p>
            <p className="font-heading text-2xl md:text-3xl font-bold text-dark">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
            <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-1 md:mb-2">Categories</p>
            <p className="font-heading text-2xl md:text-3xl font-bold text-primary">{Object.keys(stats.byCategory).length}</p>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
            <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-1 md:mb-2">Types</p>
            <p className="font-heading text-2xl md:text-3xl font-bold text-primary">{Object.keys(stats.byType).length}</p>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all">
            <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-1 md:mb-2">Colors</p>
            <p className="font-heading text-2xl md:text-3xl font-bold text-primary">{Object.keys(stats.byColor).length}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8">
          <button 
            onClick={() => navigate('/upload')}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3 rounded-xl md:rounded-2xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all duration-300 flex-1 sm:flex-none"
          >
            <FiUpload size={18} />
            Upload New Item
          </button>
          <button 
            onClick={() => navigate('/recommend')}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3 rounded-xl md:rounded-2xl text-sm font-semibold text-primary border-2 border-primary-200 hover:border-primary hover:bg-primary-50 transition-all flex-1 sm:flex-none"
          >
            <FiActivity size={18} />
            Get Recommendations
          </button>
        </div>

        {/* Search and View Controls */}
        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-stretch md:items-center justify-between">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
              <input 
                type="text" 
                placeholder="Search by name, color, or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all"
              />
            </div>
            <div className="flex gap-2 md:gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${showFilters ? 'bg-primary text-white shadow-orange' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <FiFilter size={16} />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <div className="hidden md:flex gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                >
                  <FiGrid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                >
                  <FiList size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 md:mb-6">
                <div>
                  <label className={labelClass}>Type</label>
                  <select name="type" value={filter.type} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All Types</option>
                    {typeOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Color</label>
                  <input type="text" name="color" value={filter.color} onChange={handleFilterChange} placeholder="e.g., blue"
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Category</label>
                  <select name="category" value={filter.category} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All Categories</option>
                    {categoryOptions.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Size</label>
                  <select name="size" value={filter.size} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All Sizes</option>
                    {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={applyFilters} className="flex-1 sm:flex-none px-6 py-2.5 md:py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all">Apply Filters</button>
                <button onClick={resetFilters} className="flex-1 sm:flex-none px-6 py-2.5 md:py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition-all">Reset</button>
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-orange animate-pulse-soft shadow-orange flex items-center justify-center">
              <FiRefreshCw size={20} className="text-white animate-spin" />
            </div>
            <p className="text-sm text-gray-400">Loading your wardrobe...</p>
          </div>
        ) : filteredClothing.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <FiSearch size={24} className="text-gray-300" />
            </div>
            <p className="text-gray-500 mb-2 font-heading font-semibold">No items found</p>
            <p className="text-sm text-gray-400 mb-6">
              {clothing.length === 0 ? 'Start by uploading your first clothing item' : 'Try adjusting your filters or search query'}
            </p>
            {clothing.length === 0 && (
              <button
                onClick={() => navigate('/upload')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all"
              >
                <FiUpload size={18} />
                Upload Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            : "space-y-3 md:space-y-4"
          }>
            {filteredClothing.map((item) => (
              <ClothingCard key={item._id} clothing={item} onDelete={handleDelete} onEdit={handleEditOpen} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleEditClose}>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="font-heading text-xl font-bold text-dark">Edit Item</h2>
              <button onClick={handleEditClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {editError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{editError}</div>}
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" name="name" value={editForm.name} onChange={handleEditChange} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Type</label>
                  <select name="type" value={editForm.type} onChange={handleEditChange} className={selectClass}>
                    {typeOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Color</label>
                  <input type="text" name="color" value={editForm.color} onChange={handleEditChange} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Category</label>
                  <select name="category" value={editForm.category} onChange={handleEditChange} className={selectClass}>
                    {categoryOptions.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div><label className={labelClass}>Size</label>
                  <select name="size" value={editForm.size} onChange={handleEditChange} className={selectClass}>
                    {sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label className={labelClass}>Brand</label><input type="text" name="brand" value={editForm.brand} onChange={handleEditChange} className={inputClass} placeholder="e.g., Nike" /></div>
              <div><label className={labelClass}>Tags (comma separated)</label><input type="text" name="tags" value={editForm.tags} onChange={handleEditChange} className={inputClass} placeholder="e.g., summer, vacation" /></div>
              <div><label className={labelClass}>Description</label><textarea name="description" value={editForm.description} onChange={handleEditChange} className={inputClass} rows="3" placeholder="Add notes..." /></div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button onClick={handleEditSave} disabled={editLoading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all disabled:opacity-50">
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={handleEditClose} className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
