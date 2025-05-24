import React, { useContext, useState } from 'react';
import FilterContext from '../context/FilterContext.jsx';
import { useRef, useEffect } from 'react';

const FilterDropdown = () => {
  const {
    selectedSport,
    setSelectedSport,
    selectedBetType,
    setSelectedBetType,
    clearFilters
  } = useContext(FilterContext);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setShowHashtagDropdown(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  const sports = ['All', 'NBA', 'NFL', 'MLB', 'NHL'];
  const betTypes = ['All', 'Chalk Talk', 'Moneyline', 'Spread', 'Over/Under', 'Total Points', 'Prop Bet'];

  return (
    <div ref={dropdownRef} className="flex justify-end">
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="text-xs bg-gray-800 text-white px-3 py-1 rounded border border-purple-500 hover:bg-gray-700 ml-4"
        >
          {dropdownOpen ? 'Hide Filters ▲' : 'Show Filters ▼'}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-max bg-black border border-gray-700 rounded-lg shadow-lg p-4 z-50 min-w-[260px]">
            {/* Sport Filter */}
            <div className="mb-4">
              <div className="font-bold text-sm mb-2 text-purple-400">Sport</div>
              <div className="flex flex-wrap gap-2">
                {sports.map((sport) => (
                  <button
                    key={sport}
                    onClick={() => setSelectedSport(sport)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
                      selectedSport === sport
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {sport}
                  </button>
                ))}
              </div>
            </div>

            {/* Bet Type Filter */}
            <div className="mb-4">
              <div className="font-bold text-sm mb-2 text-purple-400">Bet Type</div>
              <div className="flex flex-wrap gap-2">
                {betTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedBetType(type)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
                      selectedBetType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => {
                clearFilters();
                setDropdownOpen(false);
              }}
              className="w-full text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded mt-2 text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown;
