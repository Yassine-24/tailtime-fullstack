import React, { useState, useEffect } from 'react';
import API from '../services/api';

const VoteButtons = ({ betId, currentVote, onVoteChange, customIcons }) => {
  const [vote, setVote] = useState(currentVote);
  const [counts, setCounts] = useState({ tail: 0, fade: 0 });
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [voters, setVoters] = useState([]);

  useEffect(() => {
    setVote(currentVote);
  }, [currentVote]);

  useEffect(() => {
    fetchCounts();
  }, [betId]); // only fetch counts on mount or when bet changes

  const fetchCounts = async () => {
    try {
      const res = await API.get(`/votes/count/${betId}`);
      setCounts(res.data);
    } catch (err) {
      console.error('Failed to load vote counts', err);
    }
  };

  const handleVote = async (value) => {
    const newVote = vote === value ? 0 : value; // toggle if same vote

    setVote(newVote); // Optimistic UI: show instantly

    try {
      await API.post(`/votes/${betId}/${newVote}`);
      fetchCounts(); // 🧠 immediately refetch live counts
      onVoteChange(newVote); // ✅ only call after success
    } catch (err) {
      console.error('Failed to vote', err);
      setVote(currentVote); // rollback visual
      onVoteChange(currentVote);
    }
  };

  const handleShowVoters = async (type) => {
    try {
      const res = await API.get(`/votes/voters/${betId}/${type}`);
      setVoters(res.data.voters);
      setModalType(type);
      setShowModal(true);
    } catch (err) {
      console.error('Failed to load voters', err);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mt-3 relative">
        {/* Tail Vote */}
        <div className="flex flex-col items-center">
          <img
            src={customIcons?.tail || '/TailIcon.png'}
            onClick={() => handleVote(1)}
            alt="Tail Vote"
            title="Tail"
            className={`w-10 h-10 cursor-pointer transition-transform duration-200 ease-in-out rounded-full ${
              vote === 1
                ? 'ring-4 ring-purple-500 scale-110'
                : 'opacity-40 hover:opacity-80'
            }`}
          />
          <button
            onClick={() => handleShowVoters(1)}
            className="text-xs text-purple-400 hover:underline mt-1"
          >
            {counts.tail} Tails
          </button>
        </div>

        {/* Fade Vote */}
        <div className="flex flex-col items-center">
          <img
            src={customIcons?.fade || '/FadeIcon.png'}
            onClick={() => handleVote(-1)}
            alt="Fade Vote"
            title="Fade"
            className={`w-10 h-10 cursor-pointer transition-transform duration-200 ease-in-out rounded-full ${
              vote === -1
                ? 'ring-4 ring-red-500 scale-110'
                : 'opacity-40 hover:opacity-80'
            }`}
          />
          <button
            onClick={() => handleShowVoters(-1)}
            className="text-xs text-red-400 hover:underline mt-1"
          >
            {counts.fade} Fades
          </button>
        </div>
      </div>

      {/* Voter Modal */}
      {showModal && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-lg w-64 p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-purple-300">
              {modalType === 1 ? 'Tailed by:' : 'Faded by:'}
            </span>
            <button
              onClick={() => setShowModal(false)}
              className="text-sm text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <ul className="text-sm text-gray-300 max-h-40 overflow-y-auto space-y-1">
            {voters.length ? (
              voters.map((v, i) => <li key={i}>@{v}</li>)
            ) : (
              <li>No users yet.</li>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default VoteButtons;
