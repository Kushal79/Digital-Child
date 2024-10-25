import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    // Check if all fields are filled
    if (name && email && password) {
      // Save the user data in localStorage
      localStorage.setItem('user', JSON.stringify(formData));
      setSuccessMessage('Account created successfully!');
      setErrorMessage('');

      // Redirect to the login page after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setErrorMessage('All fields are required');
      setSuccessMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 shadow-md rounded-lg bg-white">
      <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>
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
        {successMessage && <p className="text-green-500">{successMessage}</p>}
        <button type="submit" className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;
