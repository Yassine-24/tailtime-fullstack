import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { FilterProvider } from './context/FilterContext.jsx'; // ✅ NEW IMPORT

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Feed from './pages/Feed.jsx';
import Navbar from './components/Navbar.jsx';
import Profile from './pages/Profile.jsx';
import PostBet from './pages/PostBet.jsx';
import Settings from './pages/Settings.jsx';
import FullBetView from './pages/FullBetView';
import OtherProfile from './pages/OtherProfile.jsx';

function App() {
  return (
    <AuthProvider>
      <FilterProvider> {/* ✅ WRAPS APP IN FILTER CONTEXT */}
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/post" element={<PostBet />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/bet/:id" element={<FullBetView />} />
            <Route path="/profile/:username" element={<OtherProfile />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </FilterProvider>
    </AuthProvider>
  );
}

export default App;
