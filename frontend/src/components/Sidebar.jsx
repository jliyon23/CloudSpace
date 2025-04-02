import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logout = useAuthStore((state) => state.logout);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    window.location.href = '/login';
  };

  return (
    <div 
      className={`fixed inset-y-0 left-0 z-50 bg-zinc-950 border-r-[0.1px] border-slate-600 transition-all duration-300 ease-in-out shadow-lg
        ${isExpanded ? 'w-64' : 'w-20'}`}
    >
      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-12 bg-zinc-600 text-white p-1 rounded-full shadow-lg z-50"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      {/* Logo Area */}
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <div className="flex items-center space-x-3 overflow-hidden p-3">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-2 flex-shrink-0">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z"></path>
            </svg>
          </div>
          <h2 className={`text-2xl font-bold text-white transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Cloud <span className='text-slate-400'>Space</span> 
          </h2>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <div className="px-4">
          <Link 
            to="/dashboard" 
            className="flex items-center py-3 px-4 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg mb-2 transition-all"
          >
            <div className="text-emerald-500 flex items-center justify-center min-w-[24px]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
            </div>
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Dashboard
            </span>
          </Link>
          
          <Link 
            to="/profile" 
            className="flex items-center py-3 px-4 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg mb-2 transition-all"
          >
            <div className="text-violet-500 flex items-center justify-center min-w-[24px]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Profile
            </span>
          </Link>

          <Link 
            to="/settings" 
            className="flex items-center py-3 px-4 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg mb-2 transition-all"
          >
            <div className="text-sky-500 flex items-center justify-center min-w-[24px]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
            </div>
            <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
              Settings
            </span>
          </Link>

          
        </div>
      </nav>

      {/* Footer Menu */}
      <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
        <button 
          onClick={handleLogout} 
          className="flex items-center py-3 px-4 text-red-400 hover:bg-red-900/30 hover:text-red-300 rounded-lg transition-all"
        >
          <div className="text-red-500 flex items-center justify-center min-w-[24px]">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
          </div>
          <span className={`ml-3 transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;