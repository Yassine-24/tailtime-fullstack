import React from 'react';

const ProfileHeader = ({ user, bets }) => {
  const totalTails = bets.reduce((acc, bet) => acc + (bet.tail_count || 0), 0);
  const totalFades = bets.reduce((acc, bet) => acc + (bet.fade_count || 0), 0);

  return (
    <div className="flex flex-col items-center bg-[#1e1e1e] p-6 rounded-xl border border-gray-700 shadow-md">
      <div className="relative">
        {user.profile_image_url ? (
          <img
            src={`http://localhost:8000/static/${user.profile_image_url.replace(/^static\//, '')}`}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-purple-600"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center text-4xl border-4 border-purple-600">
            🏀
          </div>
        )}
      </div>
      <h2 className="text-xl font-bold mt-4">@{user.username}</h2>

      {/* Stats */}
      <div className="flex gap-6 mt-4 text-sm text-gray-300">
        <div className="flex flex-col items-center">
          <span className="font-bold text-white">{bets.length}</span>
          <span>Bets</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-purple-400">{totalTails}</span>
          <span>Tails</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-bold text-red-400">{totalFades}</span>
          <span>Fades</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
