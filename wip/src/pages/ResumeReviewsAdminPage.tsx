import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Download, Filter } from 'lucide-react';

const ResumeReviewsAdminPage: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState({ student: '', batch: '', score: '' });

  const API_URL = 'http://localhost:3003/api';

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_URL}/resume-reviews`);
      const data = await res.json();
      setReviews(data);
      setFilteredReviews(data);
    } catch (error) {
      console.error('Failed to fetch resume reviews:', error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    let filtered = reviews;
    if (filter.student) {
      filtered = filtered.filter(r => r.studentId?.toLowerCase().includes(filter.student.toLowerCase()));
    }
    if (filter.batch) {
      filtered = filtered.filter(r => r.batchId === filter.batch);
    }
    if (filter.score) {
      filtered = filtered.filter(r => r.matchScore >= parseInt(filter.score));
    }
    setFilteredReviews(filtered);
  }, [filter, reviews]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Resume Reviews</h1>
          <p className="text-xl text-gray-600">View and analyze student resume reviews</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-2xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Filter by Student ID</label>
              <input
                type="text"
                name="student"
                value={filter.student}
                onChange={handleFilterChange}
                className="w-full p-3 border rounded-lg"
                placeholder="Enter Student ID"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Filter by Batch</label>
              <select name="batch" value={filter.batch} onChange={handleFilterChange} className="w-full p-3 border rounded-lg">
                <option value="">All Batches</option>
                {/* Add batch options here */}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Filter by Minimum Score</label>
              <input
                type="number"
                name="score"
                value={filter.score}
                onChange={handleFilterChange}
                className="w-full p-3 border rounded-lg"
                placeholder="e.g., 70"
              />
            </div>
            <button className="bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2">
              <Filter className="w-5 h-5" />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredReviews.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h3 className="text-xl font-bold mb-4">Resume Review</h3>
              <p><span className="font-bold">Student ID:</span> {review.studentId || 'N/A'}</p>
              <p><span className="font-bold">Batch ID:</span> {review.batchId || 'N/A'}</p>
              <p><span className="font-bold">Date:</span> {new Date(review.date).toLocaleDateString()}</p>
              <p><span className="font-bold">Match Score:</span> {review.matchScore}%</p>
              <div className="flex justify-end mt-4 gap-2">
                <button className="bg-blue-500 text-white p-2 rounded-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>View</span>
                </button>
                <button className="bg-green-500 text-white p-2 rounded-lg flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeReviewsAdminPage;