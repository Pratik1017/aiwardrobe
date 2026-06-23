import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clothingAPI } from '../services/api';
import { FiUploadCloud, FiCheckCircle, FiArrowRight, FiCpu, FiTag, FiDroplet, FiLayers } from 'react-icons/fi';

function getColorHex(colorName) {
  const colors = {
    'red': '#EF4444', 'blue': '#3B82F6', 'green': '#10B981', 'yellow': '#FBBF24',
    'black': '#1F2937', 'white': '#F3F4F6', 'gray': '#9CA3AF', 'pink': '#EC4899',
    'purple': '#A855F7', 'orange': '#F97316', 'brown': '#92400E', 'cyan': '#06B6D4',
    'magenta': '#D946EF', 'teal': '#14B8A6', 'neutral': '#9CA3AF'
  };
  return colors[colorName.toLowerCase()] || '#9CA3AF';
}

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', type: '', color: '', category: '', size: 'One Size',
    description: '', brand: '', purchaseDate: '', tags: '', gender: 'unisex'
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => { setPreview(reader.result); };
      reader.readAsDataURL(file);
      setAiAnalysis(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!image) { setError('Please select an image'); return; }
    try {
      setLoading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', image);
      Object.entries(formData).forEach(([key, val]) => { if (val) uploadFormData.append(key, val); });
      const response = await clothingAPI.uploadClothing(uploadFormData);
      setSuccess('Clothing item uploaded successfully!');
      setAiAnalysis(response.data.aiAnalysis);
      setUploadComplete(true);
      setTimeout(() => { navigate('/dashboard'); }, 2000);
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setLoading(false); }
  };

  const selectClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1.5";

  if (uploadComplete && aiAnalysis) {
    return (
      <div className="min-h-screen bg-light py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-elevated p-8 text-center border border-gray-100 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-green-50 flex items-center justify-center">
              <FiCheckCircle size={40} className="text-green-500" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-dark mb-2">Upload Successful!</h2>
            <p className="text-sm text-gray-400 mb-8">AI has analyzed your clothing item</p>

            <div className="bg-primary-50 rounded-2xl p-6 mb-6 text-left border border-primary-100">
              <h3 className="font-heading text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                <FiCpu size={20} className="text-primary" /> AI Analysis Results
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Type</p>
                  <p className="text-lg font-bold text-dark capitalize">{aiAnalysis.detectedType}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Color</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg border-2 border-gray-200" style={{ backgroundColor: getColorHex(aiAnalysis.detectedColor) }} />
                    <p className="text-lg font-bold text-dark capitalize">{aiAnalysis.detectedColor}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Category</p>
                  <p className="text-lg font-bold text-primary capitalize">{aiAnalysis.detectedCategory}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                  <p className="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide">Confidence</p>
                  <p className="text-lg font-bold text-dark">{(aiAnalysis.confidence * 100).toFixed(1)}%</p>
                </div>
              </div>

              {aiAnalysis.detectedLabels.length > 0 && (
                <div className="mt-4 pt-4 border-t border-primary-100">
                  <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">Labels Detected</p>
                  <div className="flex flex-wrap gap-2">
                    {aiAnalysis.detectedLabels.map((label, idx) => (
                      <span key={idx} className="bg-white text-primary-700 px-3 py-1 rounded-lg text-xs font-medium capitalize border border-primary-100">{label}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-400 mb-4">Redirecting to dashboard...</p>
            <button onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all">
              Go to Dashboard <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-elevated p-8 border border-gray-100">
          <h1 className="font-heading text-2xl font-bold text-dark mb-6">Upload Clothing Item</h1>

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-100 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            {/* Image Upload */}
            <div className="mb-6">
              <label className={labelClass}>Image *</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary-50/20 transition-all duration-300"
                onClick={() => document.getElementById('imageInput').click()}>
                {preview ? (
                  <div className="space-y-3">
                    <img src={preview} alt="Preview" className="max-h-56 mx-auto rounded-xl shadow-sm" />
                    <p className="text-xs text-gray-400">Click to change image</p>
                  </div>
                ) : (
                  <div className="py-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                      <FiUploadCloud size={28} className="text-primary" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Click to upload image</p>
                    <p className="text-xs text-gray-400">or drag and drop</p>
                  </div>
                )}
              </div>
              <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                <FiCpu size={12} className="text-primary" /> AI will automatically detect type and color from the image
              </p>
            </div>

            {/* AI Override Section */}
            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-6">
              <p className="text-sm font-semibold text-dark mb-1 flex items-center gap-2"><FiCpu size={16} className="text-primary" /> Optional: Override AI Detection</p>
              <p className="text-xs text-gray-500 mb-4">Leave blank to use AI-detected values</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}><FiLayers size={12} className="inline mr-1" />Override Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className={selectClass}>
                    <option value="">Auto-detect</option>
                    {['shirt','t-shirt','pants','dress','skirt','jacket','sweater','shoes','accessories','kurta','watch','belt','sunglasses','cap','other'].map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}><FiDroplet size={12} className="inline mr-1" />Override Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleInputChange} className={inputClass} placeholder="e.g., blue" />
                </div>
                <div>
                  <label className={labelClass}><FiTag size={12} className="inline mr-1" />Override Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className={selectClass}>
                    <option value="">Auto-detect</option>
                    {['casual','formal','sports','sleepwear','other'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Item Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className={inputClass} placeholder="Auto-generated if empty" />
                </div>
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div><label className={labelClass}>Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className={selectClass}><option value="unisex">Unisex</option><option value="male">Male</option><option value="female">Female</option></select></div>
              <div><label className={labelClass}>Size</label><select name="size" value={formData.size} onChange={handleInputChange} className={selectClass}><option value="One Size">One Size</option>{['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              <div><label className={labelClass}>Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className={inputClass} placeholder="e.g., Nike" /></div>
              <div><label className={labelClass}>Purchase Date</label><input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} className={inputClass} /></div>
              <div><label className={labelClass}>Tags</label><input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className={inputClass} placeholder="e.g., summer, vacation" /></div>
            </div>

            <div className="mb-6">
              <label className={labelClass}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className={inputClass} placeholder="Add any notes..." rows="3" />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all disabled:opacity-50">
                {loading ? 'Analyzing & Uploading...' : 'Upload Item'}
              </button>
              <button type="button" onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 rounded-xl text-sm font-medium text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
