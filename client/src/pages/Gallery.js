import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clothingAPI } from '../services/api';
import ClothingCard from '../components/ClothingCard';
import { FiX, FiPackage, FiLayers, FiGrid, FiRefreshCw, FiHeart, FiAlertTriangle, FiUploadCloud } from 'react-icons/fi';

const Gallery = () => {
  const navigate = useNavigate();
  const [clothing, setClothing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [donateItem, setDonateItem] = useState(null);
  const [donateForm, setDonateForm] = useState({ ngoName: 'Goonj', condition: 'Gently Used' });
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState('');
  const [showRecycleAlert, setShowRecycleAlert] = useState(false);

  const fetchClothing = useCallback(async () => {
    try { setLoading(true); const response = await clothingAPI.getClothing(); setClothing(response.data.clothing); setError(''); }
    catch (err) { setError('Failed to fetch clothing'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchClothing(); }, [fetchClothing]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try { await clothingAPI.deleteClothing(id); setClothing(prev => prev.filter(c => c._id !== id)); }
      catch (err) { setError('Failed to delete clothing'); }
    }
  };

  const handleEditOpen = (item) => {
    setEditItem(item);
    setEditForm({ name: item.name||'', type: item.type||'', color: item.color||'', category: item.category||'',
      size: item.size||'One Size', description: item.description||'', brand: item.brand||'',
      tags: item.tags ? item.tags.join(', ') : '' });
    setEditError('');
  };
  const handleEditClose = () => { setEditItem(null); setEditForm({}); setEditError(''); };
  const handleEditChange = (e) => { const { name, value } = e.target; setEditForm(prev => ({ ...prev, [name]: value })); };
  const handleEditSave = async () => {
    try { setEditLoading(true); setEditError('');
      const updateData = { ...editForm };
      if (updateData.tags && typeof updateData.tags === 'string') updateData.tags = updateData.tags.split(',').map(t => t.trim()).filter(Boolean).join(',');
      const response = await clothingAPI.updateClothing(editItem._id, updateData);
      setClothing(prev => prev.map(c => c._id === editItem._id ? response.data.clothing : c));
      handleEditClose();
    } catch (err) { setEditError(err.response?.data?.message || 'Failed to update'); } finally { setEditLoading(false); }
  };

  const handleDonateOpen = (item) => { setDonateItem(item); setDonateForm({ ngoName: 'Goonj', condition: 'Gently Used' }); setDonateError(''); setShowRecycleAlert(false); };
  const handleDonateClose = () => { setDonateItem(null); };
  const handleDonateConditionChange = (e) => {
    const condition = e.target.value;
    setDonateForm(prev => ({ ...prev, condition }));
    if (condition === 'Worn Out') { setShowRecycleAlert(true); setDonateForm(prev => ({ ...prev, ngoName: 'Local Textile Recycling Center' })); }
    else { setShowRecycleAlert(false); setDonateForm(prev => ({ ...prev, ngoName: 'Goonj' })); }
  };
  const handleDonateSubmit = async () => {
    try { setDonateLoading(true); setDonateError('');
      await clothingAPI.donateClothing(donateItem._id, donateForm);
      setClothing(prev => prev.filter(c => c._id !== donateItem._id));
      handleDonateClose();
    } catch (err) { setDonateError(err.response?.data?.message || 'Failed to donate'); } finally { setDonateLoading(false); }
  };

  const stats = { total: clothing.length, byType: {}, byCategory: {} };
  clothing.forEach(item => {
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
  });

  const typeOptions = ['shirt','t-shirt','pants','dress','skirt','jacket','sweater','shoes','accessories','kurta','watch','belt','sunglasses','cap','other'];
  const categoryOptions = ['casual','formal','sports','sleepwear','other'];
  const sizeOptions = ['XS','S','M','L','XL','XXL','One Size'];
  const selectClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5";

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark mb-8">Wardrobe Gallery</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { icon: FiPackage, label: 'Total Items', value: stats.total, color: 'primary' },
            { icon: FiLayers, label: 'Item Types', value: Object.keys(stats.byType).length, color: 'primary' },
            { icon: FiGrid, label: 'Categories', value: Object.keys(stats.byCategory).length, color: 'primary' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-card border border-gray-100 p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary flex-shrink-0">
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{s.label}</p>
                <h3 className="font-heading text-2xl font-bold text-dark">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-orange animate-pulse-soft shadow-orange flex items-center justify-center">
              <FiRefreshCw size={20} className="text-white animate-spin" />
            </div>
            <p className="text-sm text-gray-400">Loading gallery...</p>
          </div>
        ) : clothing.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center"><FiUploadCloud size={28} className="text-gray-300" /></div>
            <p className="font-heading font-semibold text-gray-500 mb-2">Your gallery is empty</p>
            <button onClick={() => navigate('/upload')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all mt-4">
              <FiUploadCloud size={16} /> Upload Your First Item
            </button>
          </div>
        ) : (
          <div>
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="mb-12">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-heading text-xl font-bold text-dark capitalize">{category}</h2>
                  <span className="px-2.5 py-0.5 rounded-lg bg-primary-50 text-primary text-xs font-semibold">{count}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {clothing.filter(item => item.category === category).map(item => (
                    <ClothingCard key={item._id} clothing={item} onDelete={handleDelete} onEdit={handleEditOpen} onDonate={handleDonateOpen} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleEditClose}>
          <div className="bg-white rounded-3xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="font-heading text-xl font-bold text-dark">Edit Item</h2>
              <button onClick={handleEditClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {editError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{editError}</div>}
              <div><label className={labelClass}>Name</label><input type="text" name="name" value={editForm.name} onChange={handleEditChange} className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Type</label><select name="type" value={editForm.type} onChange={handleEditChange} className={selectClass}>{typeOptions.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}</select></div>
                <div><label className={labelClass}>Color</label><input type="text" name="color" value={editForm.color} onChange={handleEditChange} className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass}>Category</label><select name="category" value={editForm.category} onChange={handleEditChange} className={selectClass}>{categoryOptions.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></div>
                <div><label className={labelClass}>Size</label><select name="size" value={editForm.size} onChange={handleEditChange} className={selectClass}>{sizeOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div><label className={labelClass}>Brand</label><input type="text" name="brand" value={editForm.brand} onChange={handleEditChange} className={inputClass} placeholder="e.g., Nike" /></div>
              <div><label className={labelClass}>Tags</label><input type="text" name="tags" value={editForm.tags} onChange={handleEditChange} className={inputClass} placeholder="e.g., summer" /></div>
              <div><label className={labelClass}>Description</label><textarea name="description" value={editForm.description} onChange={handleEditChange} className={inputClass} rows="3" /></div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button onClick={handleEditSave} disabled={editLoading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all disabled:opacity-50">{editLoading ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={handleEditClose} className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Donate Modal */}
      {donateItem && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleDonateClose}>
          <div className="bg-white rounded-3xl shadow-elevated w-full max-w-md overflow-hidden border border-gray-100 animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="bg-primary-50 flex justify-between items-center p-6 border-b border-primary-100">
              <h2 className="font-heading text-xl font-bold text-dark flex items-center gap-2">
                <FiHeart size={20} className="text-primary" /> Donate Clothing
              </h2>
              <button onClick={handleDonateClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-white/50 transition"><FiX size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-500">You are donating <strong className="text-dark">{donateItem.name}</strong>. Thank you for reducing fashion waste!</p>
              {donateError && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{donateError}</div>}
              <div>
                <label className={labelClass}>Item Condition</label>
                <select value={donateForm.condition} onChange={handleDonateConditionChange} className={selectClass}>
                  <option value="Like New">Like New</option>
                  <option value="Gently Used">Gently Used</option>
                  <option value="Worn Out">Worn Out (Torn/Stained)</option>
                </select>
              </div>
              {showRecycleAlert && (
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
                  <p className="text-amber-800 text-xs font-medium flex items-center gap-2">
                    <FiAlertTriangle size={14} /> <strong>AI Suggestion:</strong> Worn out items are routed to Textile Recycling to ensure sustainable handling.
                  </p>
                </div>
              )}
              <div>
                <label className={labelClass}>Donate To</label>
                <select value={donateForm.ngoName} onChange={(e) => setDonateForm({...donateForm, ngoName: e.target.value})} className={selectClass} disabled={showRecycleAlert}>
                  <option value="Goonj">Goonj</option>
                  <option value="Udaan">Udaan Welfare Foundation</option>
                  <option value="Local Shelter">Local Homeless Shelter</option>
                  <option value="Local Textile Recycling Center">Textile Recycling Center</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
              <button onClick={handleDonateSubmit} disabled={donateLoading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all disabled:opacity-50 flex justify-center items-center gap-2">
                {donateLoading ? 'Processing...' : 'Confirm Donation'}
              </button>
              <button onClick={handleDonateClose} className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
