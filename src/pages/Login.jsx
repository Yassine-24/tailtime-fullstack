import React, { useState, useContext } from 'react'; 
import AuthContext from '../context/AuthContext.jsx';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', form);
      const token = res.data.access_token;

      // 🔥 FIX: Fetch actual user data instead of hardcoding username
      const userRes = await API.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      login(userRes.data, token);
      localStorage.setItem('token', token);  // store the real user
      navigate('/feed');
    } catch (err) {
      alert('Login failed');
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <img
          src="/tailtime-logo.png"
          alt="TailTime Logo"
          className="w-24 h-24 mx-auto mb-4"
        />
        <h2 className="text-2xl font-bold mb-6 text-center">Login to TailTime</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-gray-700 text-white"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="w-full p-3 rounded bg-gray-700 text-white"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
          />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-lg font-semibold">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Don’t have an account?{' '}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
