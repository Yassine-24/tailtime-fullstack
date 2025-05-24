import React, { useEffect, useState } from 'react';
import ProfileTabs from '../components/ProfileTabs';
import BetCard from '../components/BetCard';
import MinimizedBetCard from '../components/MinimizedBetCard';
import API from '../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [bets, setBets] = useState([]);
  const [votes, setVotes] = useState({});
  const [tab, setTab] = useState('My Bets');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/users/me');
      const userData = res.data;

      // Ensure full URL for profile picture
      if (
        userData.profile_image_url &&
        !userData.profile_image_url.startsWith('http')
      ) {
        userData.profile_image_url = `${import.meta.env.VITE_API_URL}/${userData.profile_image_url.replace(/^static\//, '')}`;
      }

      setUser(userData);

      const betsRes = await API.get('/bets', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBets(betsRes.data);

      const votesRes = await API.get('/votes/user-votes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setVotes(votesRes.data);
    } catch (err) {
      console.error('Failed to load profile', err);
    }
  };

  const myPosts = bets.filter((bet) => bet.user.id === user?.id);
  const myVotes = bets.filter((bet) => votes[bet.id] !== undefined);
  const mySaved = []; // optional future
  const activeList = tab === 'My Bets' ? myPosts : tab === 'My Votes' ? myVotes : mySaved;

  return (
    <div className="max-w-7xl mx-auto p-6 text-white min-h-screen">
      {/* Profile Header */}
      {user && (
        <div className="flex flex-col items-center mb-10">
          {user.profile_image_url ? (
            <img
              src={user.profile_image_url}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-purple-500 mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl mb-4">
              T
            </div>
          )}
          <h1 className="text-2xl font-bold">@{user.username}</h1>
          <p className="text-sm text-gray-400 mt-2">
            Joined {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      )}

      <ProfileTabs activeTab={tab} setActiveTab={setTab} />

      <div className="mt-8 space-y-6">
        {activeList.map((bet) =>
          tab === 'My Votes' ? (
            <MinimizedBetCard key={bet.id} bet={bet} vote={votes[bet.id]} />
          ) : (
            <BetCard
              key={bet.id}
              bet={bet}
              vote={votes[bet.id] ?? null}
              onVoteMade={fetchProfile}
            />
          )
        )}
      </div>
    </div>
  );
};

export default Profile;
