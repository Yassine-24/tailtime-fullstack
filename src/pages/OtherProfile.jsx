import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import BetCard from '../components/BetCard';
import MinimizedBetCard from '../components/MinimizedBetCard';

const OtherProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userBets, setUserBets] = useState([]);
  const [userVotes, setUserVotes] = useState({ tailed: [], faded: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [voteFilter, setVoteFilter] = useState('tailed');
  const [followLoading, setFollowLoading] = useState(false);
  const [followError, setFollowError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const res = await API.get(`/users/${username}`);
      setUserData(res.data.user);
      setUserBets(res.data.bets);
      setUserVotes(res.data.votes);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load user profile', err);
    }
  };

  const toggleFollow = async () => {
    if (!userData) return;
    try {
      setFollowLoading(true);
      if (userData.is_following) {
        await API.post('/follow/unfollow', { username: userData.username });
        setUserData({ ...userData, is_following: false });
      } else {
        await API.post('/follow', { username: userData.username });
        setUserData({ ...userData, is_following: true });
      }
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to follow/unfollow.";
      alert(msg); // 👈 show alert with server message
    } finally {
      setFollowLoading(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-400">
        User not found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-white">
      {/* Back to Feed */}
      <button
        onClick={() => navigate('/feed')}
        className="text-purple-400 hover:underline text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Feed
      </button>

      {/* Profile Header */}
      <div className="flex flex-col items-center mb-10">
        {userData.profile_image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL}/${bet.user.profile_image_url.replace(/^static\//, '')}`}
            alt="profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl mb-4">
            T
          </div>
        )}
        <h1 className="text-2xl font-bold">@{userData.username}</h1>

        {/* Follow/Unfollow Button */}
          {userData.username === localStorage.getItem('username') ? (
            <button
              disabled
              className="mt-2 px-4 py-1 rounded-full text-sm font-semibold bg-gray-800 text-gray-500 cursor-not-allowed"
            >
              Cannot follow yourself
            </button>
          ) : (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`mt-2 px-4 py-1 rounded-full text-sm font-semibold transition-all ${
                userData.is_following
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}
            >
              {userData.is_following ? 'Unfollow' : 'Follow'}
            </button>
          )}



        <p className="text-sm text-gray-400 mt-2">
          Joined {new Date(userData.created_at).toLocaleDateString()}
        </p>

        {/* Stats */}
        <div className="flex gap-6 mt-4 text-center">
          <div>
            <div className="text-purple-400 text-lg font-bold">{userBets.length}</div>
            <div className="text-xs text-gray-400">Bets</div>
          </div>
          <div>
            <div className="text-purple-400 text-lg font-bold">{userData.total_tails ?? 0}</div>
            <div className="text-xs text-gray-400">Tails</div>
          </div>
          <div>
            <div className="text-purple-400 text-lg font-bold">{userData.total_fades ?? 0}</div>
            <div className="text-xs text-gray-400">Fades</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 mx-2 rounded ${
            activeTab === 'posts' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('votes')}
          className={`px-4 py-2 mx-2 rounded ${
            activeTab === 'votes' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          Votes
        </button>
      </div>

      {/* Content */}
      {activeTab === 'posts' ? (
        <div className="space-y-6">
          {userBets.length === 0 ? (
            <div className="text-gray-500 text-center text-sm">No bets posted yet.</div>
          ) : (
            userBets.map((bet) => (
              <BetCard key={bet.id} bet={bet} vote={null} onVoteMade={() => {}} />
            ))
          )}
        </div>
      ) : (
        <div>
          {/* Vote Filters */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setVoteFilter('tailed')}
              className={`px-3 py-1 mx-2 rounded-full text-sm ${
                voteFilter === 'tailed' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Tailed
            </button>
            <button
              onClick={() => setVoteFilter('faded')}
              className={`px-3 py-1 mx-2 rounded-full text-sm ${
                voteFilter === 'faded' ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              Faded
            </button>
          </div>

          {/* Voted Bets */}
          <div className="space-y-6">
            {userVotes[voteFilter].length === 0 ? (
              <div className="text-gray-500 text-center text-sm">No {voteFilter} bets yet.</div>
            ) : (
              userVotes[voteFilter].map((bet) => (
                <MinimizedBetCard key={bet.id} bet={bet} vote={bet.vote_type} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherProfile;
