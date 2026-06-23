import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Gallery from './pages/Gallery';
import Recommend from './pages/Recommend';
import Calendar from './pages/Calendar';
import Donations from './pages/Donations';
import AdminDashboard from './pages/AdminDashboard';
import HowToUse from './pages/HowToUse';
import About from './pages/About';
import ColorMatcher from './pages/ColorMatcher';
import Sustainability from './pages/Sustainability';
import ShoppingHelper from './pages/ShoppingHelper';
import { authAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-orange animate-pulse-soft shadow-orange flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 2.23l2.1 14.4A2 2 0 0 0 6.36 22h11.28a2 2 0 0 0 1.98-1.91l2.1-14.4a2 2 0 0 0-1.34-2.23z"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-400">Loading your wardrobe...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-light">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Login onLogin={handleLogin} />} />
          <Route path="/signup" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />) : <Signup onLogin={handleLogin} />} />
          <Route path="/dashboard" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard user={user} />) : <Navigate to="/login" />} />
          <Route path="/upload" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Upload />) : <Navigate to="/login" />} />
          <Route path="/gallery" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Gallery />) : <Navigate to="/login" />} />
          <Route path="/recommend" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Recommend />) : <Navigate to="/login" />} />
          <Route path="/calendar" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Calendar />) : <Navigate to="/login" />} />
          <Route path="/donations" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Donations />) : <Navigate to="/login" />} />
          <Route path="/color-matcher" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <ColorMatcher />) : <Navigate to="/login" />} />
          <Route path="/sustainability" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Sustainability />) : <Navigate to="/login" />} />
          <Route path="/shopping-helper" element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <ShoppingHelper />) : <Navigate to="/login" />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
