import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import SportBallButton from './SportBallButton.jsx';
import FilterDropdown from './FilterDropdown.jsx'; // ✅ NEW

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [animate, setAnimate] = useState(false);
  const menuRef = useRef(null);

  const [trendingMenuOpen, setTrendingMenuOpen] = useState(false);
  const trendingMenuRef = useRef(null);

  const [activeFeedTab, setActiveFeedTab] = useState('Trending');
  const [activeTrendingSub, setActiveTrendingSub] = useState('Hottest');

  const tabs = [
    { name: 'Feed', path: '/feed' },
    { name: 'Post', path: '/post' },
    { name: 'Profile', path: '/profile' },
    { name: 'Settings', path: '/settings' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBallClick = () => {
    setMenuOpen((prev) => !prev);
    setAnimate(true);
    setTimeout(() => setAnimate(false), 600);
  };

  const triggerFeedTabChange = (tabName) => {
    const event = new CustomEvent('feedTabChange', { detail: tabName });
    window.dispatchEvent(event);
    setActiveFeedTab(tabName);
  };

  const triggerTrendingSubChange = (subType) => {
    const event = new CustomEvent('feedTrendingSubChange', { detail: subType });
    window.dispatchEvent(event);
    setActiveTrendingSub(subType);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (trendingMenuRef.current && !trendingMenuRef.current.contains(e.target)) {
        setTrendingMenuOpen(false);
      }
    };
    if (menuOpen || trendingMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, trendingMenuOpen]);

  return (
    <div className="relative z-[150]">
      <nav className="bg-black border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed">
          <img
            src="/tailtime-logo.png"
            alt="TailTime Logo"
            className="h-12 w-12 object-contain transition duration-300 hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]"
          />
        </Link>

        {/* Feed Tabs + FilterDropdown */}
        {location.pathname === '/feed' && (
          <div className="flex gap-6 ml-6 relative items-center">
            {/* Feed Tabs */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setTrendingMenuOpen((prev) => !prev);
                  triggerFeedTabChange('Trending');
                }}
                className={`text-sm font-semibold transition-all ${
                  activeFeedTab === 'Trending'
                    ? 'text-purple-400 underline underline-offset-4'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Trending
              </button>

              {trendingMenuOpen && (
                <div
                  ref={trendingMenuRef}
                  className="absolute left-0 top-full mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-3 flex gap-3 z-50"
                >
                  {['Hottest', 'Coldest', 'Livewire'].map((sub) => (
                    <button
                      key={sub}
                      onClick={() => {
                        triggerTrendingSubChange(sub);
                        setTrendingMenuOpen(false);
                      }}
                      className={`text-xs font-semibold transition-all px-3 py-1 rounded ${
                        activeTrendingSub === sub
                          ? 'bg-purple-600 text-white border border-purple-500'
                          : 'text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  triggerFeedTabChange('New');
                  setTrendingMenuOpen(false);
                }}
                className={`text-sm font-semibold transition-all ${
                  activeFeedTab === 'New'
                    ? 'text-purple-400 underline underline-offset-4'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                New
              </button>

              <button
                onClick={() => {
                  triggerFeedTabChange('Following');
                  setTrendingMenuOpen(false);
                }}
                className={`text-sm font-semibold transition-all ${
                  activeFeedTab === 'Following'
                    ? 'text-purple-400 underline underline-offset-4'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Following
              </button>
            </div>

            {/* ✅ Filter UI Hooked to Context */}
            <FilterDropdown />
          </div>
        )}

        {/* Sport Ball Button (Always Right) */}
        <div className={animate ? 'animate-bounce-twice' : ''}>
          <SportBallButton onClick={handleBallClick} />
        </div>
      </nav>

      {/* Main Nav Slideout */}
      <div
        ref={menuRef}
        className={`absolute right-20 top-4 bg-gray-900 rounded-lg shadow-lg px-4 py-2 flex gap-4 transition-all duration-300 ease-in-out z-[200] ${
          menuOpen
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-10 pointer-events-none'
        }`}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`text-sm font-semibold ${
              location.pathname === tab.path
                ? 'text-purple-400 underline'
                : 'text-gray-300 hover:text-white'
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {tab.name}
          </Link>
        ))}
        {location.pathname === '/settings' && (
          <button
            onClick={handleLogout}
            className="text-sm bg-red-600 hover:bg-red-500 px-3 py-1 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
