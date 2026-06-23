import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiMail, FiLock, FiArrowRight, FiUser } from 'react-icons/fi';

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const response = await authAPI.login(formData.email, formData.password);
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
      if (response.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-56 h-56 bg-primary-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl shadow-elevated p-8 sm:p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-orange flex items-center justify-center shadow-orange">
              <FiUser size={24} className="text-white" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-dark">Welcome back</h2>
            <p className="text-sm text-gray-400 mt-1">Sign in to your AL Closet</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all"
                  placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input type="password" name="password" value={formData.password} onChange={handleChange} required
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-dark placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-white transition-all"
                  placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange hover:shadow-orange-lg transition-all duration-300 disabled:opacity-50 transform hover:-translate-y-0.5">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span><FiArrowRight className="transition-transform group-hover:translate-x-1" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-primary font-semibold hover:underline">Create one</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
