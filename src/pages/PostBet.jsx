import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

const PostBet = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedHashtag, setSelectedHashtag] = useState('#general');
  const [selectedBetType, setSelectedBetType] = useState('Chalk Talk');
  const [hashtagsBySport, setHashtagsBySport] = useState({
    nba: [],
    nfl: [],
    mlb: [],
    nhl: [],
  });
  const [hashtagSport, setHashtagSport] = useState('All'); // 🆕 Smart sport tracking

  const sports = [
    { name: 'All', key: 'all', emoji: '🌎' },
    { name: 'NBA', key: 'nba', emoji: '🏀' },
    { name: 'NFL', key: 'nfl', emoji: '🏈' },
    { name: 'MLB', key: 'mlb', emoji: '⚾' },
    { name: 'NHL', key: 'nhl', emoji: '🏒' },
  ];

  const betTypes = [
    'Chalk Talk',
    'Moneyline',
    'Spread',
    'Over/Under',
    'Total Points',
    'Prop Bet'
  ];

  useEffect(() => {
    fetchHashtags();
  }, []);

  const fetchHashtags = async () => {
    const leagueUrls = {
      nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
      nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
    };

    const newHashtags = {
      nba: [],
      nfl: [],
      mlb: [],
      nhl: [],
    };

    try {
      for (const [sportKey, url] of Object.entries(leagueUrls)) {
        const res = await fetch(url);
        const data = await res.json();

        if (data.events) {
          const tags = data.events.map((event) => {
            const t1 = event.competitions[0]?.competitors[0]?.team?.shortDisplayName || '';
            const t2 = event.competitions[0]?.competitors[1]?.team?.shortDisplayName || '';
            return `#${t1.replace(/\s/g, '')}vs${t2.replace(/\s/g, '')}`;
          });

          newHashtags[sportKey] = [...new Set(tags)];
        }
      }
      setHashtagsBySport(newHashtags);
    } catch (error) {
      console.error('Failed to fetch hashtags:', error);
    }
  };

  const getAvailableHashtags = () => {
    if (selectedSport === 'all') {
      return [
        '#general',
        ...new Set([
          ...hashtagsBySport.nba,
          ...hashtagsBySport.nfl,
          ...hashtagsBySport.mlb,
          ...hashtagsBySport.nhl,
        ]),
      ];
    }

    const generalHashtag = `#${selectedSport.toUpperCase()}General`;
    return [generalHashtag, ...(hashtagsBySport[selectedSport] || [])];
  };

  const availableHashtags = getAvailableHashtags();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🆕 Updated: handle hashtag selection and set correct sport
  const handleHashtagSelect = (tag) => {
    setSelectedHashtag(tag);

    if (hashtagsBySport.nba.includes(tag) || tag.toLowerCase().includes('nbageneral')) {
      setHashtagSport('NBA');
    } else if (hashtagsBySport.nfl.includes(tag) || tag.toLowerCase().includes('nflgeneral')) {
      setHashtagSport('NFL');
    } else if (hashtagsBySport.mlb.includes(tag) || tag.toLowerCase().includes('mlbgeneral')) {
      setHashtagSport('MLB');
    } else if (hashtagsBySport.nhl.includes(tag) || tag.toLowerCase().includes('nhlgeneral')) {
      setHashtagSport('NHL');
    } else {
      setHashtagSport('All');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', content);
    formData.append('hashtag', selectedHashtag);
    formData.append('bet_type', selectedBetType);
    formData.append('sport', hashtagSport); // 🆕 use correct sport

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

        {/* Sport Tabs */}
        <div className="flex flex-wrap gap-3 mb-4">
          {sports.map((sport) => (
            <button
              key={sport.key}
              type="button"
              onClick={() => setSelectedSport(sport.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border ${
                selectedSport === sport.key
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-800 text-purple-300 border-gray-600 hover:border-purple-400'
              } transition-all`}
            >
              <span>{sport.emoji}</span>
              {sport.name}
            </button>
          ))}
        </div>

        {/* Hashtag Pills */}
        <div className="flex flex-wrap gap-3 mb-4">
          {availableHashtags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleHashtagSelect(tag)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                selectedHashtag === tag
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-gray-800 text-purple-300 border-gray-600 hover:border-purple-400'
              } transition-all`}
            >
              {tag}
            </button>
          ))}
        </div>
          {/* Bet Type Pills */}
          <div className="flex flex-wrap gap-3 mb-4">
            {betTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedBetType(type)}
                className={`px-4 py-2 rounded-full text-xs font-semibold border ${
                  selectedBetType === type
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-gray-800 text-purple-300 border-gray-600 hover:border-purple-400'
                } transition-all`}
              >
                {type}
              </button>
            ))}
          </div>

        {/* Image Upload */}
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

        {/* Submit Buttons */}
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
