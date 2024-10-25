import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    // Retrieve the user data from localStorage
    const storedUser = JSON.parse(localStorage.getItem('user'));

    if (storedUser) {
      // Check if the email and password match
      if (storedUser.email === email && storedUser.password === password) {
        console.log('Login successful!');
        navigate('/home');  // Redirect to home page after successful login
      } else {
        setErrorMessage('Invalid email or password');
      }
    } else {
      setErrorMessage('No account found. Please sign up first.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 shadow-md rounded-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md">Log In</button>
        <p className="mt-4 text-center">
           Create an account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
