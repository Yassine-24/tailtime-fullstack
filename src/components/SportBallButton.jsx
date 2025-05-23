import React, { useEffect, useState } from 'react';

const sports = ['⚽', '🏀', '🏈','⚾'];

const SportBallButton = ({ onClick }) => {
  const [icon, setIcon] = useState('🏈');

  useEffect(() => {
    const pick = sports[Math.floor(Math.random() * sports.length)];
    setIcon(pick);
  }, [location.pathname]);

  return (
    <button
      onClick={onClick}
      className="text-4xl hover:scale-125 transition-transform duration-200"
      aria-label="Open navigation"
    >
      {icon}
    </button>
  );
};

export default SportBallButton;
