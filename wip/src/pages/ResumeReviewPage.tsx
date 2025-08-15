import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';

const ResumeReviewPage: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const API_URL = 'http://localhost:3003/api';

  const handleAnalyze = async () => {
    const reviewData = {
      studentId: 'STUDENT_ID_HERE', // Replace with actual student ID from auth context
      batchId: 'BATCH_ID_HERE', // Replace with actual batch ID
      date: new Date().toISOString(),
      matchScore: Math.floor(Math.random() * 101), // Placeholder for actual analysis
      resumeText,
      jobDescription,
    };

    try {
      await fetch(`${API_URL}/resume-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      alert('Resume review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit resume review:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🤖</div>
          <div className="flex justify-center items-center mb-4">
            <h1 className="text-5xl font-bold">CloudEdge.AI Resume Reviewer</h1>
          </div>
          <p className="text-xl text-gray-400">Optimize your resume with AI in real-time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center mb-4">
              <Upload className="mr-2" /> Upload Resume
            </button>
            <textarea
              className="w-full h-48 bg-gray-700 text-white p-4 rounded-lg resize-none"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            ></textarea>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <textarea
              className="w-full h-full bg-gray-700 text-white p-4 rounded-lg resize-none"
              placeholder="Paste Job Description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-4 px-8 rounded-full text-lg"
            onClick={handleAnalyze}
          >
            Analyze Resume
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResumeReviewPage;
