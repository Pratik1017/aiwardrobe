import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiLogOut, FiHome, FiUpload, FiGrid, FiLogIn, FiUserPlus, FiMenu, FiX, FiStar, FiCalendar, FiHeart, FiShield, FiUser, FiTool, FiTrendingUp, FiShoppingBag } from 'react-icons/fi';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/upload', label: 'Upload', icon: FiUpload },
  { to: '/gallery', label: 'Gallery', icon: FiGrid },
  { to: '/recommend', label: 'AI Stylist', icon: FiStar, highlight: true },
  { to: '/calendar', label: 'History', icon: FiCalendar },
  { to: '/donations', label: 'Impact', icon: FiHeart },
];

const toolsLinks = [
  { to: '/color-matcher', label: 'Color Matcher', icon: FiTool, description: 'Find perfect color combos' },
  { to: '/sustainability', label: 'Sustainability', icon: FiTrendingUp, description: 'Track your eco-impact' },
  { to: '/shopping-helper', label: 'Shopping Helper', icon: FiShoppingBag, description: 'Smart wardrobe suggestions' },
];

const Navbar = ({ user, onLogout }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, label, icon: Icon, highlight, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200
        ${isActive(to)
          ? 'text-primary bg-primary-50 font-semibold'
          : highlight
            ? 'text-primary hover:bg-primary-50'
            : 'text-gray-600 hover:text-dark hover:bg-gray-50'
        }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-orange rounded-xl flex items-center justify-center shadow-orange group-hover:shadow-orange-lg transition-shadow duration-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 2.23l2.1 14.4A2 2 0 0 0 6.36 22h11.28a2 2 0 0 0 1.98-1.91l2.1-14.4a2 2 0 0 0-1.34-2.23z"/>
                </svg>
              </div>
              <span className="text-xl font-heading font-bold text-dark">
                AI <span className="text-gradient-orange">Closet</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            {user ? (
              <div className="hidden md:flex items-center gap-1">
                {user.role !== 'admin' ? (
                  <>
                    {navLinks.map(link => (
                      <NavLink key={link.to} {...link} />
                    ))}
                    {/* Tools Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-dark hover:bg-gray-50 transition-all duration-200">
                        <FiTool size={18} />
                        <span>Tools</span>
                        <span className="text-xs">▼</span>
                      </button>
                      <div className="absolute right-0 mt-0 w-56 bg-white rounded-xl shadow-elevated border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                        {toolsLinks.map((tool) => (
                          <Link
                            key={tool.to}
                            to={tool.to}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <tool.icon size={18} className="text-primary" />
                            <div>
                              <p className="text-sm font-medium text-dark">{tool.label}</p>
                              <p className="text-xs text-gray-400">{tool.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isActive('/admin') ? 'text-primary bg-primary-50' : 'text-gray-600 hover:text-dark hover:bg-gray-50'}`}
                  >
                    <FiShield size={18} />
                    <span>Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : null}

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-gradient-orange flex items-center justify-center text-white text-xs font-bold">
                      {user.username?.charAt(0).toUpperCase() || <FiUser size={14} />}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                  >
                    <FiLogOut size={18} />
                    <span className="hidden lg:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-dark hover:bg-gray-50 transition-all"
                  >
                    <FiLogIn size={18} />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-orange hover:shadow-orange transition-all duration-300"
                  >
                    <FiUserPlus size={18} />
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-50 transition"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
        </div>
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-elevated transform transition-transform duration-300 ease-out md:hidden overflow-y-auto
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="w-9 h-9 bg-gradient-orange rounded-xl flex items-center justify-center shadow-orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2 12 5.5 8 2l-4.38 1.46a2 2 0 0 0-1.34 2.23l2.1 14.4A2 2 0 0 0 6.36 22h11.28a2 2 0 0 0 1.98-1.91l2.1-14.4a2 2 0 0 0-1.34-2.23z"/>
                </svg>
              </div>
              <span className="text-lg font-heading font-bold text-dark">AI Closet</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-gray-400 hover:bg-gray-50">
              <FiX size={20} />
            </button>
          </div>
        </div>

        {user && (
          <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-orange-soft">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-orange flex items-center justify-center text-white font-bold">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 space-y-1 mt-2">
          {user ? (
            <>
              {user.role !== 'admin' ? (
                <>
                  {navLinks.map(link => (
                    <NavLink key={link.to} {...link} onClick={() => setMobileOpen(false)} />
                  ))}
                  
                  {/* Tools Section */}
                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <button
                      onClick={() => setToolsOpen(!toolsOpen)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      <span className="flex items-center gap-2">
                        <FiTool size={18} />
                        Tools
                      </span>
                      <span className="text-xs">{toolsOpen ? '▲' : '▼'}</span>
                    </button>
                    
                    {toolsOpen && (
                      <div className="mt-2 space-y-1">
                        {toolsLinks.map((tool) => (
                          <Link
                            key={tool.to}
                            to={tool.to}
                            onClick={() => { setMobileOpen(false); setToolsOpen(false); }}
                            className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
                          >
                            <tool.icon size={18} className="text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-dark">{tool.label}</p>
                              <p className="text-xs text-gray-400">{tool.description}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <FiShield size={18} />
                  Admin Panel
                </Link>
              )}
              <div className="border-t border-gray-100 mt-4 pt-4">
                <button
                  onClick={() => { onLogout(); setMobileOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition"
                >
                  <FiLogOut size={18} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                <FiLogIn size={18} />
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-orange shadow-orange transition"
              >
                <FiUserPlus size={18} />
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
