import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import VoteButtons from '../components/VoteButtons';

const FullBetView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bet, setBet] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchBet();
    fetchComments();
  }, [id]);

  const fetchBet = async () => {
    try {
      const res = await API.get(`/bets/${id}`);
      setBet(res.data);
    } catch (err) {
      console.error('Failed to load bet', err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await API.post(`/comments/${id}`, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  if (!bet) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-white">

      {/* Back to Feed */}
      <button
        onClick={() => navigate('/feed')}
        className="text-purple-400 hover:underline text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Feed
      </button>

      {/* Expanded Bet Card */}
      <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 p-6 shadow-md flex flex-col xl:flex-row gap-8 mb-8">
        
        {/* Left Side - Bet Details */}
        <div className="flex-1">
          {/* Top Row */}
          <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
            {bet.user?.profile_image_url ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/${bet.user.profile_image_url.replace(/^static\//, '')}`}
                alt="user"
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-lg">🏀</div>
            )}
            <span
              className="font-semibold text-purple-400 cursor-pointer hover:underline"
              onClick={() => navigate(`/profile/${bet.user?.username}`)}
            >
              @{bet.user?.username}
            </span>
            <span className="ml-auto text-xs">{new Date(bet.created_at).toLocaleString()}</span>
          </div>

          {/* Bet Type */}
          {bet.bet_type && (
            <div className="mb-2 flex justify-center">
              <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-md text-xs font-semibold">
                [{bet.bet_type}]
              </span>
            </div>
          )}

          {/* Bet Content */}
          <p className="text-white mb-3 text-base font-medium">{bet.content}</p>

          {/* Bet Image */}
          {bet.image_url && (
            <div className="mb-3 flex justify-center cursor-pointer">
              <img
                src={`${import.meta.env.VITE_API_URL}/${imagePath.replace(/^static\//, '')}`}
                alt="bet"
                className="rounded-md object-contain max-h-[500px]"
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

          {/* Vote Buttons */}
          <div className="flex justify-center mt-6">
            <VoteButtons
              betId={bet.id}
              currentVote={userVote}
              onVoteChange={() => {}}
              onVoteMade={() => fetchBet()}
            />
          </div>
        </div>

        {/* Right Side - Comments */}
        <div className="w-full xl:w-80 bg-gray-900 rounded-xl p-4 overflow-y-auto max-h-[600px] border border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-purple-400">Top Comments</h2>
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm">No comments yet.</p>
          ) : (
            <ul className="space-y-4">
              {comments.map((comment, idx) => (
                <li key={idx} className="text-gray-300 text-sm border-b border-gray-700 pb-2">
                  <span
                    className="font-semibold text-purple-400 cursor-pointer hover:underline"
                    onClick={() => navigate(`/profile/${comment.username}`)}
                  >
                    @{comment.username}
                  </span>: {comment.content}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Comment Input */}
      <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 p-6 shadow-md flex gap-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add your thoughts..."
          className="flex-1 p-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
        <button
          onClick={handlePostComment}
          className="px-6 py-2 rounded-md bg-purple-600 hover:bg-purple-700 text-sm font-bold"
        >
          Post
        </button>
      </div>

    </div>
  );
};

export default FullBetView;
