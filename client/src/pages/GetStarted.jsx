import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Signup from '../components/Signup';
import Signin from '../components/Signin';

function GetStarted() {
  const [isSignin, setisSignin] = useState(true);

  return (
    <div className="h-full flex items-center justify-center p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.1 }}
        className="bg-white rounded-lg border overflow-hidden w-full max-w-md"
      >
        <div className="flex items-center justify-center p-1">
          <div className="bg-gray-200 rounded p-1 flex">
            <button
              onClick={() => setisSignin(true)}
              className={`px-6 py-2 rounded transition-all duration-300 ${
                isSignin
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setisSignin(false)}
              className={`px-6 py-2 rounded transition-all duration-300 ${
                !isSignin
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="p-2 m-auto overflow-hidden">
          <motion.div
            key={isSignin ? 'signin' : 'signup'}
            initial={{ opacity: 0, x: isSignin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSignin ? 20 : -20 }}
            transition={{ duration: 0.1 }}
          >
            {isSignin ? <Signin /> : <Signup />}
          </motion.div>
        </div>

        <div className="bg-gray-50 px-6 py-1 text-center">
          <p className="text-sm text-gray-600">
            {isSignin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setisSignin(!isSignin)}
              className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {isSignin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default GetStarted;
