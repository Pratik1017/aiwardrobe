import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiUser, FiMail, FiLock, FiArrowRight, FiAtSign, FiHeart, FiDroplet } from 'react-icons/fi';

const Signup = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', password: '',
    gender: 'other', style: 'casual', favoriteColors: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const preferences = {
        style: formData.style,
        favoriteColors: formData.favoriteColors.split(',').map(c => c.trim()).filter(c => c)
      };
      const response = await authAPI.signup(formData.name, formData.username, formData.email, formData.password, preferences, formData.gender);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
      if (response.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const selectClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-dark focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all";
  const labelClass = "block text-sm font-medium text-gray-600 mb-2";

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-lg animate-fade-in">
        <div className="bg-white rounded-3xl shadow-elevated p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-orange">
              <FiUser size={24} className="text-white" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-dark">Create Account</h2>
            <p className="text-sm text-gray-400 mt-1">Join AL Closet today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name + Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name *</label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="John Doe" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Username *</label>
                <div className="relative">
                  <FiAtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input type="text" name="username" value={formData.username} onChange={handleChange} required minLength="3" className={inputClass} placeholder="johndoe" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email *</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="you@example.com" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" className={inputClass} placeholder="••••••••" />
              </div>
            </div>

            {/* Row 2: Gender + Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={selectClass}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Preferred Style</label>
                <select name="style" value={formData.style} onChange={handleChange} className={selectClass}>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="ethnic">Ethnic</option>
                  <option value="sporty">Sporty</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
            </div>

            {/* Favorite Colors */}
            <div>
              <label className={labelClass}>Favorite Colors</label>
              <div className="relative">
                <FiDroplet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                <input type="text" name="favoriteColors" value={formData.favoriteColors} onChange={handleChange}
                  className={inputClass} placeholder="e.g., blue, black, red (comma separated)" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Create Account</span><FiArrowRight className="transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-primary font-semibold hover:underline">Login</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
