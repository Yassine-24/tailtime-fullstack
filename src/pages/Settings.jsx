import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('info');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await API.get('/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserInfo(res.data);
      } catch (err) {
        console.error('Failed to fetch user info', err);
      }
    };

    fetchUser();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfilePicUpload = async (e) => {
    e.preventDefault();
    const file = e.target.elements.profilePic.files[0];
    if (!file) return alert('Choose a file first');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await API.post('/users/upload-profile-pic', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const res = await API.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserInfo(res.data);
      alert('Profile picture updated!');
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
    }
  };

  return (
    <div className="flex min-h-screen text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-6 border-r border-gray-700 space-y-4">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <button
          onClick={() => setActiveTab('info')}
          className={`block w-full text-left px-3 py-2 rounded ${
            activeTab === 'info' ? 'bg-purple-700' : 'hover:bg-gray-700'
          }`}
        >
          Account Info
        </button>
        <button
          onClick={() => setActiveTab('picture')}
          className={`block w-full text-left px-3 py-2 rounded ${
            activeTab === 'picture' ? 'bg-purple-700' : 'hover:bg-gray-700'
          }`}
        >
          Profile Picture
        </button>
        <button
          onClick={handleLogout}
          className="mt-8 block w-full text-left bg-red-600 hover:bg-red-500 px-3 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 p-8 bg-gray-950">
        {activeTab === 'info' && userInfo && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Account Information</h2>
            <p><strong>Username:</strong> @{userInfo.username}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
            <p><strong>Joined:</strong> {new Date(userInfo.created_at).toLocaleDateString()}</p>
          </div>
        )}

        {activeTab === 'picture' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Profile Picture</h2>
            {userInfo?.profile_image_url ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/static/${userInfo.profile_image_url?.replace(/^static\//, '')}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 mb-4">
                No Image
              </div>
            )}

            <form onSubmit={handleProfilePicUpload}>
              <input
                type="file"
                name="profilePic"
                accept="image/*"
                className="mb-4 block"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              >
                Upload Picture
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
