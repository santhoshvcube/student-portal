import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AnimatedButton from '../components/AnimatedButton';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStudents } from '../context/StudentContext';
import StudentProfileCompletionModal from '../components/StudentProfileCompletionModal';
import { Student } from '../context/StudentContext';

const StudentLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileCompletionModalOpen, setIsProfileCompletionModalOpen] = useState(false);
  const [loggedInStudent, setLoggedInStudent] = useState<Student | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { students, setStudents } = useStudents();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const loggedInUser = await login(email, mobile, 'student');
      if (loggedInUser) {
        const studentDetails = students.find(s => s.id === loggedInUser.id);
        if (studentDetails) {
          setLoggedInStudent(studentDetails);
          if (!studentDetails.profileComplete) {
            setIsProfileCompletionModalOpen(true);
          } else {
            navigate('/dashboard-student');
          }
        } else {
          toast.error("Could not find student details.");
        }
      }
    } catch (error) {
      // Error is handled in AuthContext
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = (data: any) => {
    if (!loggedInStudent) return;

    const updatedStudent = {
      ...loggedInStudent,
      ...data,
      profileComplete: true,
    };

    setStudents(prevStudents =>
      prevStudents.map(s => (s.id === updatedStudent.id ? updatedStudent : s))
    );

    setIsProfileCompletionModalOpen(false);
    navigate('/dashboard-student');
    toast.success("Profile updated successfully!");
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showProfileModal') === 'true' && loggedInStudent) {
      setIsProfileCompletionModalOpen(true);
    }
  }, [location.search, loggedInStudent]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-blue-500"></div>
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <GraduationCap className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Student Login</h2>
          <p className="text-gray-600">Access your student dashboard</p>
        </div>

        <motion.form
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleLogin}
          className="space-y-6"
        >
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2" />
              Email ID
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="mobile">
              <Smartphone className="w-4 h-4 inline mr-2" />
              Mobile Number (as Password)
            </label>
            <input
              type="password"
              id="mobile"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Your mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>
          <AnimatedButton
            type="submit"
            label="Login"
            isLoading={isLoading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 text-lg font-semibold"
          />
        </motion.form>
      </motion.div>
    </div>
  );
};

export default StudentLoginPage;
