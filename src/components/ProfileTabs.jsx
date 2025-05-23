import React from 'react';
import { motion } from 'framer-motion'; // 🆕 needs framer-motion!

const tabs = ['My Bets', 'My Votes', 'My Saved'];

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center mt-10 border-b border-gray-700 relative">
      <div className="flex gap-10">
        {tabs.map((tab) => (
          <div key={tab} className="relative">
            <button
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-lg font-semibold transition-all ${
                activeTab === tab ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>

            {/* Underline (only show if active) */}
            {activeTab === tab && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileTabs;
