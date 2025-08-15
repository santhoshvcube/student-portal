import { Link, useNavigate } from 'react-router-dom';
import { Bot, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { useEffect } from 'react';

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (user?.role === 'admin') {
        navigate('/dashboard-admin');
      } else if (user?.role === 'student') {
        navigate('/dashboard-student');
      }
    }
  }, [isLoggedIn, user, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <header className="w-full bg-orange-500 flex justify-between items-center px-6 py-3 shadow-lg">
        <div className="flex items-center space-x-4">
          <img
            src="/vcubelogo.png"
            alt="V Cube Logo"
            className="h-16 w-auto"
          />
          <h1 className="text-black text-3xl md:text-4xl font-bold">
            V Cube
          </h1>
          <h1 className="text-white text-3xl md:text-4xl font-bold">
            Software Solutions
          </h1>
        </div>
        <img
          src="/aws.png"
          alt="AWS Logo"
          className="h-16 w-auto"
        />
      </header>

      {/* CloudEdge.AI Section */}
      <div className="bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl text-center"
        >
          <h1 className="text-5xl font-bold mb-4">Introducing Our</h1>
          <h1 className="text-5xl font-bold mb-4">CloudEdge.AI</h1>
          <p className="text-xl text-gray-400 mb-12">AI Mock Interview & Resume Review</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 p-8 rounded-lg"
            >
              <Bot size={48} className="mx-auto mb-4 text-blue-400" />
              <h2 className="text-2xl font-bold mb-2">AI Mock Interview</h2>
              <p className="text-gray-400">Practice your interview skills with our AI-powered mock interviewer.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-800 p-8 rounded-lg"
            >
              <FileText size={48} className="mx-auto mb-4 text-purple-400" />
              <h2 className="text-2xl font-bold mb-2">AI Resume Reviewer</h2>
              <p className="text-gray-400">Get instant feedback on your resume and optimize it for ATS.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center justify-center max-w-7xl mx-auto px-6 py-10">
        {/* Left Section */}
        <div className="md:w-1/2 flex flex-col items-start justify-center space-y-6">
          <img
            src="/aws.png"
            alt="AWS Robot"
            className="w-64 h-auto object-contain"
          />
          <h2 className="text-3xl font-semibold text-gray-800">Empowering Students with</h2>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            <span className="text-black">Smart </span>
            <span className="text-orange-500">Registration</span>
            <span className="text-black"> & </span>
            <span className="text-blue-600">QR Attendance</span>
          </h1>
          <p className="text-gray-600 text-xl">
            Register, Track, and Grow with <span className="font-bold text-black">V Cube’s</span> Digital Learning Portal
          </p>
          <div className="flex flex-wrap gap-6 pt-6">
            <Link to="/login-student">
              <button className="login-button bg-orange-500 text-white hover:bg-orange-600 shadow-md">
                Student Login
              </button>
            </Link>
            <Link to="/login-admin">
              <button className="login-button bg-yellow-400 text-gray-900 hover:bg-yellow-500 shadow-md">
                Admin Login
              </button>
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 mt-10 md:mt-0 md:pl-12">
          <img
            src="/MC (1).jpg"
            alt="Multicloud DevSecOps"
            className="w-full max-w-lg object-cover rounded-3xl shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
