import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import BetCard from '../components/BetCard.jsx';
import FilterContext from '../context/FilterContext.jsx';

const Feed = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [bets, setBets] = useState([]);
  const [userVotes, setUserVotes] = useState({});
 
  const [feedFilter, setFeedFilter] = useState('For You');
  const [trendingSubFilter, setTrendingSubFilter] = useState('Hottest');
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [liveSportTab, setLiveSportTab] = useState('nba');
  const [showHashtagDropdown, setShowHashtagDropdown] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const {
    selectedHashtag,
    setSelectedHashtag,
    selectedBetType,
    setSelectedBetType,
    selectedSport,
    setSelectedSport,
    clearFilters
  } = useContext(FilterContext); // ✅ Use shared state
  const {
    liveHashtags, setLiveHashtags,
    liveHashtagTimestamps, setLiveHashtagTimestamps
  } = useContext(FilterContext);
  
  
  useEffect(() => {
    if (feedFilter === 'Following') {
      fetchFollowing();
    } else {
      fetchAll();
    }
  }, [token, feedFilter]);
  
  const fetchFollowing = async () => {
    try {
      const [betsRes, votesRes] = await Promise.all([
        API.get('/bets/following', { headers: { Authorization: `Bearer ${token}` } }),
        API.get('/votes/user-votes', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const fetchedBets = betsRes.data;
      setBets(fetchedBets);
      setUserVotes(votesRes.data);
    } catch (err) {
      console.error('Error loading following feed', err);
    }
  };
  

  useEffect(() => {
    fetchGames(liveSportTab);
  }, [liveSportTab]);

  useEffect(() => {
    const handleFeedTabChange = (e) => {
      setFeedFilter(e.detail);
    };
    const handleTrendingSubChange = (e) => {
      setTrendingSubFilter(e.detail);
    };
    window.addEventListener('feedTabChange', handleFeedTabChange);
    window.addEventListener('feedTrendingSubChange', handleTrendingSubChange);

    return () => {
      window.removeEventListener('feedTabChange', handleFeedTabChange);
      window.removeEventListener('feedTrendingSubChange', handleTrendingSubChange);
    };
  }, []);

  useEffect(() => {
    if (feedFilter === 'Trending' && !trendingSubFilter) {
      setTrendingSubFilter('Hottest');
    }
  }, [feedFilter, trendingSubFilter]);

  const fetchAll = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
  
      const [allBetsRes, followingBetsRes, votesRes] = await Promise.all([
        API.get('/bets', { headers }),
        API.get('/bets/following', { headers }), // ✅ Ensure token is sent
        API.get('/votes/user-votes', { headers })
      ]);
  
      const allBets = allBetsRes.data.reverse();
      const followingBets = followingBetsRes.data.reverse();
  
      // 🔁 Add logic to show followingBets only if feedFilter is "Following"
      const finalBets = feedFilter === 'Following' ? followingBets : allBets;
  
      setBets(finalBets);
      setUserVotes(votesRes.data);
    } catch (err) {
      console.error('Error loading feed or votes', err);
    }
  };
  

  const fetchGames = async (sport) => {
    const currentTags = new Set(); // Move this OUTSIDE the try block
  
    try {
      setGamesLoading(true);
      const urlMap = {
        nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
        nfl: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
        mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
        nhl: 'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard',
      };
  
      const res = await fetch(urlMap[sport]);
      const data = await res.json();
  
      const extractedGames = data.events.map((event) => {
        const team1 = event.competitions[0].competitors[0].team.shortDisplayName.replace(/\s+/g, '');
        const team2 = event.competitions[0].competitors[1].team.shortDisplayName.replace(/\s+/g, '');
        const hashtag = `#${team1}vs${team2}`;
        currentTags.add(hashtag);
  
        return {
          status: event.status.type.shortDetail,
          competitors: [
            {
              shortDisplayName: team1,
              logo: event.competitions[0].competitors[0].team.logo,
              score: event.competitions[0].competitors[0].score
            },
            {
              shortDisplayName: team2,
              logo: event.competitions[0].competitors[1].team.logo,
              score: event.competitions[0].competitors[1].score
            }
          ]
        };
      });
  
      setGames(extractedGames);
      setLiveHashtags(currentTags);
    } catch (err) {
      console.error('Failed to fetch games', err);
    } finally {
      setGamesLoading(false);
    }
  
    // ✅ After try-catch: update hashtag timestamps
    const now = new Date();
    const updatedTimestamps = { ...liveHashtagTimestamps };
    currentTags.forEach((tag) => {
      updatedTimestamps[tag] = now;
    });
    setLiveHashtagTimestamps(updatedTimestamps);
  };
  
  

  const filteredBets = bets
    .filter((bet) => {
      if (selectedSport !== 'All') {
        return (bet.sport || 'All').toLowerCase() === selectedSport.toLowerCase();
      }
      return true;
    })
    .filter((bet) => {
      if (selectedHashtag) {
        return bet.hashtag === selectedHashtag;
      }
      return true;
    })
    .filter((bet) => {
      if (selectedBetType !== 'All') {
        return bet.bet_type === selectedBetType;
      }
      return true;
    })
    .sort((a, b) => {
      if (feedFilter === 'Trending') {
        if (trendingSubFilter === 'Hottest') {
          return (b.tail_count || 0) - (a.tail_count || 0);
        } else if (trendingSubFilter === 'Coldest') {
          return (b.fade_count || 0) - (a.fade_count || 0);
        } else if (trendingSubFilter === 'Livewire') {
          const totalA = (a.tail_count || 0) + (a.fade_count || 0);
          const totalB = (b.tail_count || 0) + (b.fade_count || 0);
          return totalB - totalA;
        }
      } else if (feedFilter === 'New') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      return 0;
    });

  const hashtagCounts = {};
  bets.forEach((bet) => {
    if (bet.hashtag) {
      hashtagCounts[bet.hashtag] = (hashtagCounts[bet.hashtag] || 0) + 1;
    }
  });

  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count;
  };


const GRACE_PERIOD_HOURS = 12;

const filteredAndSortedHashtags = Object.entries(hashtagCounts)
  .filter(([tag]) => {
    const timestamp = liveHashtagTimestamps[tag];
    if (!timestamp) return false;
    const ageHours = (new Date() - new Date(timestamp)) / (1000 * 60 * 60);
    return ageHours <= GRACE_PERIOD_HOURS;
  })
  .sort((a, b) => b[1] - a[1]);



  const betTypes = ['All', 'Chalk Talk', 'Moneyline', 'Spread', 'Over/Under', 'Total Points', 'Prop Bet'];
  const sports = ['All', 'NBA', 'NFL', 'MLB', 'NHL']; // 🆕

  return (
    <div className="flex min-h-screen text-white">
      {/* 🔥 Hashtag Sidebar (desktop only) */}
      <div className="w-64 hidden xl:block bg-[#111111] border-r border-gray-800 p-4 overflow-y-auto sticky top-0 h-screen">
        <h2 className="text-lg font-bold mb-4 text-purple-400">Live Tags</h2>
        {filteredAndSortedHashtags.length === 0 ? (
          <p className="text-gray-500 text-sm">No active hashtags</p>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedHashtags.map(([tag, count]) => (
              <button
                key={tag}
                onClick={() => setSelectedHashtag(tag)}
                className={`w-full text-left px-3 py-1 rounded-lg text-sm font-medium flex justify-between items-center transition-all ${
                  selectedHashtag === tag
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="truncate">{tag}</span>
                <span className="ml-2 text-xs text-purple-300">{count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-[850px] mx-auto">

        <h1 className="text-2xl font-bold mb-6">Welcome to the Feed, @{user?.username}!</h1>

        {/* Active Filters */}
        {(selectedHashtag || selectedBetType !== 'All' || selectedSport !== 'All') && (
          <div className="flex items-center gap-4 mb-6">
            <div className="text-sm text-gray-400 flex flex-wrap items-center gap-2">
              <span>Filtering by:</span>
              {selectedSport !== 'All' && (
                <span className="text-white font-semibold">Sport: {selectedSport}</span>
              )}
              {selectedHashtag && (
                <span className="text-white font-semibold">• Game: {selectedHashtag}</span>
              )}
              {selectedBetType !== 'All' && (
                <span className="text-white font-semibold">• Bet Type: {selectedBetType}</span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* MOBILE FILTER TOGGLE */}
          <div className="sm:hidden flex justify-end mb-3">
            <button
              onClick={() => setFiltersVisible(prev => !prev)}
              className="text-xs text-purple-400 border border-purple-500 px-3 py-1 rounded-md hover:bg-purple-500 hover:text-white transition"
            >
              {filtersVisible ? 'Hide Filters ▲' : 'Show Filters ▼'}
            </button>
          </div>

          {/* FILTERS WRAPPER */}
          <div className={`${filtersVisible ? '' : 'hidden'} sm:block`}>
            {/* HASHTAG FILTER DROPDOWN */}
              <div className="mb-3 transition-all duration-300">
                <button
                  onClick={() => setShowHashtagDropdown(!showHashtagDropdown)}
                  className="bg-gray-800 text-white px-3 py-1 rounded-md border border-purple-500 hover:bg-gray-700 text-xs mb-1"
                >
                  {showHashtagDropdown ? 'Hide Games ▲' : 'Select Game ▼'}
                </button>

                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    showHashtagDropdown ? 'max-h-[600px] opacity-100 mt-2' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div
                    className={`
                      grid gap-2
                      grid-cols-2
                      sm:grid-cols-3
                      w-full
                    `}
                  >
                    {filteredAndSortedHashtags
                      .slice(0, typeof window !== 'undefined' && window.innerWidth >= 640 ? 15 : 8)
                      .map(([tag, count]) => (
                        <button
                          key={tag}
                          onClick={() => {
                            setSelectedHashtag(tag);
                            setShowHashtagDropdown(false);
                          }}
                          className={`px-2 py-0.5 text-[11px] rounded-full font-medium truncate flex justify-between items-center ${
                            selectedHashtag === tag
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          <span className="truncate text-center font-bold w-full">{tag}</span>
                          {count >= 10 && (
                            <span className="ml-2 bg-purple-700 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                              HOT
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
          </div>

        {/* Bets */}
        <div className="space-y-6">
          {filteredBets.map((bet) => (
            <BetCard
              key={bet.id}
              bet={bet}
              vote={userVotes[bet.id] ?? null}
              onVoteMade={() => fetchAll()}
            />
          ))}
        </div>
      </div>

      {/* Right Sidebar (Live Games) */}
      <div className="w-80 p-6 hidden md:block bg-[#111111] border-l border-gray-800 sticky top-0 h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-purple-400">Live Games</h2>

        {/* Sport Tabs */}
        <div className="flex gap-2 mb-6">
          {['nba', 'nfl', 'mlb', 'nhl'].map((sport) => (
            <button
              key={sport}
              onClick={() => setLiveSportTab(sport)}
              className={`px-3 py-1 rounded text-sm ${
                liveSportTab === sport ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {sport.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Games List */}
        {gamesLoading ? (
          <div className="text-gray-400 text-center mt-10 animate-pulse">Loading games...</div>
        ) : games.length === 0 ? (
          <p className="text-gray-500 text-sm">No games found.</p>
        ) : (
          <div className="space-y-4">
            {games.map((game, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition"
              >
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    {game.competitors[0]?.logo && (
                      <img src={game.competitors[0].logo} alt="team1" className="w-6 h-6 rounded-full" />
                    )}
                    <span>{game.competitors[0]?.shortDisplayName}</span>
                  </div>
                  <span className="text-lg font-bold">{game.competitors[0]?.score}</span>
                </div>
                <div className="text-center text-xs text-gray-500">VS</div>
                <div className="flex items-center justify-between text-sm text-gray-300 mt-2">
                  <div className="flex items-center gap-2">
                    {game.competitors[1]?.logo && (
                      <img src={game.competitors[1].logo} alt="team2" className="w-6 h-6 rounded-full" />
                    )}
                    <span>{game.competitors[1]?.shortDisplayName}</span>
                  </div>
                  <span className="text-lg font-bold">{game.competitors[1]?.score}</span>
                </div>
                <div className="text-center text-xs mt-2 text-purple-400">{game.status}</div>
                <button
                  onClick={() => setSelectedHashtag(`#${game.competitors[0]?.shortDisplayName}vs${game.competitors[1]?.shortDisplayName}`)}
                  className="text-center text-xs mt-1 text-purple-400 font-semibold hover:underline"
                >
                  #{game.competitors[0]?.shortDisplayName}vs{game.competitors[1]?.shortDisplayName}
                </button>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
