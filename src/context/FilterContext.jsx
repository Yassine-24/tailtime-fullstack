import React, { createContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [selectedBetType, setSelectedBetType] = useState('All');
  const [liveHashtags, setLiveHashtags] = useState(new Set()); // ✅ Added
  const [liveHashtagTimestamps, setLiveHashtagTimestamps] = useState({}); // ✅ Added

  const clearFilters = () => {
    setSelectedSport('All');
    setSelectedHashtag(null);
    setSelectedBetType('All');
  };

  return (
    <FilterContext.Provider
      value={{
        selectedSport,
        setSelectedSport,
        selectedHashtag,
        setSelectedHashtag,
        selectedBetType,
        setSelectedBetType,
        clearFilters,
        liveHashtags, // ✅ Added
        setLiveHashtags, // ✅ Added
        liveHashtagTimestamps, // ✅ Added
        setLiveHashtagTimestamps, // ✅ Added
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
