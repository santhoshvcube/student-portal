import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { motion } from 'framer-motion';
import { LogOut, User, Shield, LayoutDashboard, Home } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <header className="bg-gray-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/vcubelogo.png" alt="V-Cube Logo" className="h-10" />
          <span className="text-xl font-bold">
            <span style={{color: 'white'}}>V Cube</span> <span style={{color: 'white'}}>Software Solutions</span>
          </span>
        </Link>

        <motion.div
          className="flex items-center space-x-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div variants={navItemVariants}>
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center space-x-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
          </motion.div>

          {isLoggedIn ? (
            <>
              <motion.div variants={navItemVariants}>
                <Link
                  to={isAdmin ? '/dashboard-admin' : '/dashboard-student'}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-300 flex items-center space-x-1"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants} className="flex items-center space-x-2">
                {isAdmin ? <Shield className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-green-600" />}
                <span className="text-gray-800 font-medium">{user?.name}</span>
              </motion.div>
              <motion.div variants={navItemVariants}>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={navItemVariants}>
                <Link to="/login-admin" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                  Admin Login
                </Link>
              </motion.div>
              <motion.div variants={navItemVariants}>
                <Link to="/login-student" className="text-gray-600 hover:text-blue-600 transition-colors duration-300">
                  Student Login
                </Link>
              </motion.div>
                          </>
          )}
        </motion.div>
      </nav>
    </header>
  );
};

export default Header;
