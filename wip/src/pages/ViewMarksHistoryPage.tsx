import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award } from 'lucide-react';

const ViewMarksHistoryPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Marks History</h1>
          <p className="text-xl text-gray-600">View your examination results and academic progress</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-dashed border-rose-300 rounded-xl hover:border-rose-400 transition-colors"
            >
              <BarChart3 className="w-12 h-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Score Analysis</h3>
              <p className="text-gray-600">Detailed breakdown of marks by subject and exam type</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-dashed border-pink-300 rounded-xl hover:border-pink-400 transition-colors"
            >
              <TrendingUp className="w-12 h-12 text-pink-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Progress Tracking</h3>
              <p className="text-gray-600">Monitor your academic improvement over time</p>
            </motion.div>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Marks Features</h3>
            <ul className="text-left space-y-2 text-gray-600">
              <li>• Comprehensive marks table with filters</li>
              <li>• Subject-wise performance charts</li>
              <li>• Grade point average calculations</li>
              <li>• Exam-wise comparison and trends</li>
              <li>• Performance ranking within batch</li>
              <li>• Download detailed mark sheets</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewMarksHistoryPage;
