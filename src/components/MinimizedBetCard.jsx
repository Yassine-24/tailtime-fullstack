import React from 'react';
import { useNavigate } from 'react-router-dom';

const MinimizedBetCard = ({ bet, vote }) => {
  const navigate = useNavigate();

  const voteIndicator = vote === 1 ? 'bg-green-500' : vote === -1 ? 'bg-red-500' : 'bg-gray-600';

  return (
    <div className="relative bg-[#1e1e1e] w-full max-w-5xl mx-auto p-4 rounded-lg border border-gray-700 flex items-center justify-between hover:shadow-lg transition-all">
      {/* Vote Color Indicator */}
      <div className={`absolute left-0 top-0 h-full w-2 rounded-l-md ${voteIndicator}`} />

      {/* Bet Info */}
      <div className="flex-1 ml-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <span className="font-semibold text-white">@{bet.user.username}</span>
          <span>•</span>
          <span className="text-xs">{new Date(bet.created_at).toLocaleDateString()}</span>
        </div>
        <div className="text-white font-medium truncate">
          {bet.content}
        </div>
      </div>

      {/* View Full Button */}
      <button
        onClick={() => navigate(`/bet/${bet.id}`)}
        className="ml-6 text-xs text-purple-400 hover:underline"
      >
        View Full ➔
      </button>
    </div>
  );
};

export default MinimizedBetCard;
