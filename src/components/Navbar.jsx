import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear the user data from localStorage when signing out
    localStorage.removeItem('user');
    // Redirect to the login page
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        {/* Logo Section */}
        <div>
          <h1 className="text-white text-xl">
            <span style={{ color: 'green' }}>Digital</span>
            <span style={{ color: 'orange' }}>Child</span>
          </h1>
        </div>

        {/* Center Links */}
        <div className="flex space-x-8">
          <Link to="/home" className="text-white hover:underline">Home</Link>
          <Link to="/Dashboard" className="text-white hover:underline">Dashboard</Link>  {/* Updated to Data Process */}
          <Link to="/about" className="text-white hover:underline">About</Link>
          <Link to="/contact" className="text-white hover:underline">Contact</Link>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 bg-gray-700 text-white py-2 px-4 rounded-full focus:outline-none"
          >
            <span>Profile</span>
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="rounded-full w-8 h-8"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => navigate('/profile')}
              >
                View Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
