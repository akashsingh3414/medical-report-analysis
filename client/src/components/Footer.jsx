import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-blue-900 text-white mt-auto">
    <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
            <h3 className="text-lg font-semibold mb-2">BloodAnalytics</h3>
            <p className="text-gray-300">Making medical reports accessible and understandable.</p>
            </div>
            <div>
            <h4 className="text-lg font-semibold mb-2">Quick Links</h4>
            <nav className="flex flex-col space-y-1">
                <Link to="/" className="text-gray-300 hover:text-white">Home</Link>
                <Link to="/aboutus" className="text-gray-300 hover:text-white">About</Link>
            </nav>
            </div>
            <div>
            <h4 className="text-lg font-semibold mb-2">Contact</h4>
            <div className="text-gray-300 space-y-1">
                <p>Email: akashsingh3414@gmail.com</p>
            </div>
            </div>
        </div>
        <div className="mt-6 pt-2 border-t border-white text-center text-gray-300">
            <p>&copy; {new Date().getFullYear()} BloodAnalytics. All rights reserved.</p>
        </div>
    </div>
  </footer>
  )
}

export default Footer