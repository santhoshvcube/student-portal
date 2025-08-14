import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, Clock } from 'lucide-react';

const ViewAttendancePage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-teal-50 to-blue-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Attendance Records</h1>
          <p className="text-xl text-gray-600">Track your attendance across all classes and sessions</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-dashed border-teal-300 rounded-xl hover:border-teal-400 transition-colors"
            >
              <BarChart3 className="w-12 h-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Attendance Summary</h3>
              <p className="text-gray-600">View overall attendance percentage and statistics</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 transition-colors"
            >
              <Clock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Daily Records</h3>
              <p className="text-gray-600">Detailed day-by-day attendance history</p>
            </motion.div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Features</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li>• Calendar view with attendance marking</li>
              <li>• Subject-wise attendance breakdown</li>
              <li>• Monthly and weekly attendance trends</li>
              <li>• Late arrival and early departure tracking</li>
              <li>• Attendance percentage calculations</li>
              <li>• Export attendance reports</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewAttendancePage;
