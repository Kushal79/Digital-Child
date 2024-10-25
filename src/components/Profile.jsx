import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null); // State to hold user data
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData(storedUser); // Set user data to state
    } else {
      // If no user data, redirect to the login page
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-8 shadow-md rounded-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">User Profile</h2>
      {userData ? (
        <div>
          <p className="text-gray-700">
            <strong>Name:</strong> {userData.name}
          </p>
          <p className="text-gray-700">
            <strong>Email:</strong> {userData.email}
          </p>
          <p className="text-gray-700">
            <strong>Password:</strong> {userData.password}
          </p>
        </div>
      ) : (
        <p className="text-red-500">No user data available. Please sign up or log in.</p>
      )}
    </div>
  );
};

export default Profile;
