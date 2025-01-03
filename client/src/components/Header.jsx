import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { logout } from '../redux/user/user-slice';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'About Us', path: '/aboutus' },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const response = await axios.post('/api/user/logout');
    if (response.status === 200) {
      dispatch(logout());
    }
  };

  const handleDelete = async () => {
    const response = await axios.delete('/api/user/delete');
    if (response.status === 200) {
      dispatch(logout());
      setShowDeleteModal(false);
    }
  };

  const isActive = (path) =>
    location.pathname === path ? 'font-bold text-white' : 'text-white';

  return (
    <header className="sticky top-0 z-50 bg-indigo-700 roboto-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <Link to="/" className="text-2xl font-bold text-white">
            BloodAnalytics
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} hover:text-blue`}
              >
                {item.name}
              </Link>
            ))}
            {user?.currentUser ? (
              <>
                <button
                  className="border text-white p-2 rounded hover:bg-white hover:text-indigo-500"
                  onClick={handleLogout}
                >
                  Logout
                </button>
                <button
                  className="border text-white p-2 rounded hover:bg-red-700 hover:text-white"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </button>
              </>
            ) : (
              <Link to="/getstarted">
                <button className="border text-white p-2 rounded hover:bg-white hover:text-indigo-500">
                  Get Started
                </button>
              </Link>
            )}
          </nav>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden border text-white p-2 rounded hover:bg-white hover:text-indigo-500"
          >
            {isOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-gray-900 px-4 py-2 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`${isActive(item.path)} block py-2 text-center`}
              onClick={() => setIsOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          {user?.currentUser ? (
            <>
              <button
                className="border text-white w-full p-2 rounded hover:bg-white hover:text-indigo-500"
                onClick={handleLogout}
              >
                Logout
              </button>
              <button
                className="border text-white w-full p-2 rounded hover:bg-red-700 hover:text-white"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </>
          ) : (
            <Link to="/getstarted" onClick={() => setIsOpen(false)}>
              <button className="border text-white w-full p-2 rounded hover:bg-white hover:text-indigo-500">
                Get Started
              </button>
            </Link>
          )}
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold">Confirm Account Deletion</h3>
            <p>This will permanently delete your account and all associated data.</p>
            <div className="flex space-x-4 mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
