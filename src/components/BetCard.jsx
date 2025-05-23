import VoteButtons from './VoteButtons';
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import API from '../services/api'; // 🧠 Add API import if missing

const BetCard = ({ bet, vote, onVoteMade }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get(`/comments/${bet.id}`);
        setComments(res.data.slice(0, 3)); // 🧠 Only show 3 comments max
      } catch (err) {
        console.error('Failed to load comments for bet', bet.id, err);
      }
    };
  
    fetchComments();
  }, [bet.id]);
  
  const formatTimestamp = (isoString) => {
    const now = new Date();
    const created = new Date(isoString);
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
  
    if (diffSec < 60) {
      return `just now`;
    } else if (diffMin < 60) {
      return `${diffMin} min${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
    } else if (diffDay === 1) {
      return `Yesterday at ${created.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      })}`;
    } else if (diffDay <= 7) {
      return `${diffDay} days ago`;
    } else {
      return created.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/New_York',
      });
    }
  };
  

  const customIcons = {
    tail: '/TailIcon.png',
    fade: '/FadeIcon.png',
  };

  return (
    <>
      <div className="bg-[#1e1e1e] w-full max-w-5xl mx-auto p-6 rounded-xl border border-gray-700 shadow-md hover:shadow-purple-700/30 transform hover:-translate-y-1 transition-all duration-300 ease-in-out flex gap-6">
        
        {/* Left - Main Post */}
        <div className="flex-1 flex flex-col">
          {/* Top Row */}
          <div className="flex items-center gap-3 mb-2 text-sm text-gray-400">
            {bet.user.profile_image_url ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/${bet.user.profile_image_url.replace(/^static\//, '')}`}
                alt="user"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-lg">
                🏀
              </div>
            )}
            <span
                className="font-semibold text-white cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${bet.user.username}`)}
              >
                @{bet.user.username}
              </span>
            <span className="ml-auto text-xs flex items-center gap-1">
              🕒 {formatTimestamp(bet.created_at)}
            </span>
          </div>

          {/* Bet Type Label */}
          {bet.bet_type && (
            <div className="mb-2 flex justify-center">
              <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-md text-xs font-semibold">
                [{bet.bet_type}]
              </span>
            </div>
          )}

          {/* Bet Content */}
          <p className="text-white mb-3 text-base font-medium">{bet.content}</p>

          {/* Image */}
          {bet.image_url && (
            <div
              className="mb-3 flex justify-center cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={bet.image_url.startsWith('http') ? bet.image_url : `${import.meta.env.VITE_API_URL}/${bet.image_url}`}
                alt="bet"
                className="rounded-md object-contain max-h-[350px] w-full"
              />
            </div>
          )}

          {/* Hashtag */}
          {bet.hashtag && (
            <div className="flex flex-wrap gap-2 mb-3 justify-center">
              <span className="bg-purple-700/40 hover:bg-purple-700/70 text-purple-200 px-4 py-1 rounded-full text-xs font-semibold shadow-md hover:shadow-purple-500/50 transition-all duration-200">
                {bet.hashtag}
              </span>
            </div>
          )}

          {/* Voting */}
          <div className="flex items-center justify-between mt-auto">
            <VoteButtons
              betId={bet.id}
              currentVote={vote}
              onVoteChange={() => {}}
              onVoteMade={onVoteMade}
              customIcons={customIcons}
            />
            <span className="text-gray-400 text-sm ml-4">
              💬 {bet.comment_count ?? 0} Comments
            </span>
          </div>
        </div>

        {/* Right - Comments Preview */}
        <div className="w-64 bg-gray-800 rounded-lg p-4 shadow-inner overflow-y-auto max-h-[400px] flex-col justify-between hidden md:flex">
          <div>
            <h3 className="text-xs font-bold text-purple-400 mb-2">Top Comments</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {comments.length === 0 ? (
                <li className="text-gray-500 text-xs">No comments yet.</li>
              ) : (
                comments.map((comment) => (
                  <li key={comment.id} className="border-b border-gray-700 pb-2">
                    <span className="font-semibold text-purple-300">@{comment.username}</span>: {comment.content}
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* View All Button */}
          <button
            onClick={() => navigate(`/bet/${bet.id}`)}
            className="text-xs text-purple-400 hover:underline mt-4 self-center"
          >
            View All ➔
          </button>
        </div>
      </div>

      {/* Enlarged Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center transition-opacity duration-300"
          onClick={() => setShowImageModal(false)}
        >
          <img
            src={bet.image_url.startsWith('http') ? bet.image_url : `${import.meta.env.VITE_API_URL}/${bet.image_url}`}
            alt="enlarged bet"
            className="max-w-4xl w-full h-auto rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default BetCard;