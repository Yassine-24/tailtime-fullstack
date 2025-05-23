import React, { useState } from 'react';
import Signup from './Signup';
import Login from './Login';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold mb-6">
        {isLogin ? "Log In to TailTime" : "Sign Up for TailTime"}
      </h1>

      {isLogin ? <Login /> : <Signup />}

      <button
        className="mt-4 text-purple-400 underline hover:text-purple-300"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin
          ? "Don't have an account? Sign up here"
          : "Already signed up? Log in here"}
      </button>
    </div>
  );
};

export default AuthPage;
