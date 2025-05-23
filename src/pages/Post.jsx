import React, { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const PostBet = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState('#general');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    formData.append('hashtags', hashtags);
    if (image) formData.append('image', image);

    try {
      await API.post('/bets', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/feed');
    } catch (err) {
      alert('Post failed');
      console.error(err);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-950 p-10 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 w-full max-w-2xl p-8 rounded-xl shadow-lg border border-purple-600 space-y-6"
      >
        <h1 className="text-2xl font-bold text-purple-400 mb-2">Post Your Bet</h1>

        <textarea
          className="w-full p-4 h-32 text-white bg-gray-800 rounded-md resize-none border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="What's your hot take?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="#game #nfl #underdog"
          className="w-full p-2 text-white bg-gray-800 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
          className="block w-full text-sm text-gray-300 file:bg-purple-600 file:text-white file:border-none file:rounded file:px-4 file:py-2"
        />

        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 mt-4 rounded border border-purple-500"
          />
        )}

        <div className="flex justify-between gap-4">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 transition-all px-6 py-2 rounded text-lg font-bold shadow-md hover:shadow-lg"
          >
            Submit Bet
          </button>
          <button
            type="button"
            onClick={() => navigate('/feed')}
            className="text-gray-400 hover:text-white underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostBet;
