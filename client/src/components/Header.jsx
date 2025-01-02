import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
  { name: 'About Us', path: '/aboutus' },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? 'font-bold text-white' : 'text-white';

  return (
    <header className="sticky top-0 z-50 bg-indigo-600 roboto-light bg-opacity-90 backdrop-blur-80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          <div>
            <Link to="/" className="text-2xl font-bold text-white">
              InReport
            </Link>
          </div>
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
            <Link to='/getstarted'>
              <button className="hidden border text-white md:flex items-center p-2 rounded hover:bg-white hover:text-indigo-500">Get Started</button>
            </Link>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="px-3 py-2 border rounded text-white">
              {isOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-gray-900">
          <div className="flex flex-col justify-center px-4 py-2 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${isActive(item.path)} text-red-900 block py-2 text-center`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link to='/getstarted' className='flex'>
              <button className="border text-white md:flex grow items-center p-2 rounded hover:bg-white hover:text-indigo-500">Get Started</button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;