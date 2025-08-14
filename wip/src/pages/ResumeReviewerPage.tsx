import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Bot } from 'lucide-react';
import toast from 'react-hot-toast';

const ResumeReviewerPage: React.FC = () => {
  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [reviewStarted, setReviewStarted] = useState(false);
  const [reviewReport, setReviewReport] = useState<any>(null);
  const [rewrittenResume, setRewrittenResume] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResume(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setResumeText(e.target?.result as string);
      };
      reader.readAsText(file);
      toast.success('Resume uploaded successfully!');
    }
  };

  const handleStartReview = () => {
    if (!resumeText) {
      toast.error('Please upload a resume.');
      return;
    }
    setReviewStarted(true);
  };

  useEffect(() => {
    if (reviewStarted && jobDescription && resumeText) {
      const getKeywords = (text: string) => {
        const words = text.toLowerCase().match(/[a-zA-Z-.]+/g) || [];
        const bigrams = [];
        for (let i = 0; i < words.length - 1; i++) {
          bigrams.push(`${words[i]} ${words[i + 1]}`);
        }
        return [...new Set([...words, ...bigrams])];
      };

      const resumeKeywords = getKeywords(resumeText);
      const jdKeywords = getKeywords(jobDescription);
      
      const commonSkills = ['react', 'javascript', 'typescript', 'node.js', 'python', 'java', 'c++', 'html', 'css', 'sql', 'mongodb', 'aws', 'docker', 'git'];
      const jdSkills = jdKeywords.filter(k => commonSkills.includes(k) || k.split(' ').length > 1);

      if (jdSkills.length === 0) {
        setReviewReport(null);
        return;
      }

      const matchedSkills = jdSkills.filter(skill => resumeKeywords.some(rSkill => rSkill.includes(skill)));
      const missingSkills = jdSkills.filter(skill => !resumeKeywords.some(rSkill => rSkill.includes(skill)));
      const matchScore = Math.round((matchedSkills.length / jdSkills.length) * 100);

      const strengths = matchedSkills.length > 0 ? matchedSkills.map(s => `Strong match: You have experience with ${s}.`) : ['No direct skill matches found.'];
      const gaps = missingSkills.map(s => `Missing keyword: Consider adding "${s}" to your resume.`);
      const suggestions = [
        'Add a dedicated "Skills" section to your resume.',
        'Use the exact wording from the job description for key skills.',
        'Quantify your achievements in your experience section (e.g., "Increased performance by 20%").'
      ];

      setReviewReport({
        matchScore,
        strengths,
        gaps,
        suggestions,
      });
    }
  }, [resumeText, jobDescription, reviewStarted]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('resumeReviewHistory') || '[]');
    setHistory(savedHistory);
  }, []);

  const handleRewriteResume = () => {
    if (!resumeText) {
      toast.error('Please provide your resume text first.');
      return;
    }
    if (!jobDescription) {
      toast.error('Please provide the job description first.');
      return;
    }

    const jdKeywords = [...new Set(jobDescription.toLowerCase().match(/\b[a-z-]+\b/g) || [])];
    const keySkills = jdKeywords.filter(k => k.length > 4).slice(0, 10);

    if (keySkills.length === 0) {
      toast.error('Could not identify key skills from the job description.');
      return;
    }

    const skillsToAdd = `\n\n\n--- ATS-Optimized Skills Section ---\n*Based on the job description, consider incorporating these skills into your resume.*\n\n**Key Skills:**\n${keySkills.map(skill => `- ${skill.charAt(0).toUpperCase() + skill.slice(1)}`).join('\n')}`;

    const newRewrittenResume = resumeText + skillsToAdd;

    setRewrittenResume(newRewrittenResume);
    toast.success('Resume enhanced with key skills!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        
        <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">🤖</h1>
            <h1 className="text-5xl font-bold mb-4"> CloudEdge.AI Resume Reviewer</h1>
            <p className="text-xl text-gray-400">Optimize your resume with AI in real-time</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center gap-2">
              <Upload className="w-5 h-5" />
              <span>{resume ? resume.name : '📄 Upload Resume'}</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" />
            </label>
          </div>
          <div>
            <textarea
              className="w-full h-48 bg-gray-700 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="🧾 Paste Job Description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <button
            onClick={handleStartReview}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 shadow-lg"
          >
            🔍 Analyze Resume
          </button>
        </div>

        {reviewStarted && reviewReport && (
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
            <h2 className="text-3xl font-bold text-center mb-8">Match Report</h2>
            <div className="text-center mb-8">
              <p className="text-2xl font-bold">✔ Match Score: {reviewReport.matchScore}%</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">✔ Strengths</h3>
                <ul className="list-disc list-inside text-gray-400">
                  {reviewReport.strengths.map((strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">✖ Gaps</h3>
                <ul className="list-disc list-inside text-gray-400">
                  {reviewReport.gaps.map((gap: string, index: number) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">💡 Suggestions</h3>
              <ul className="list-disc list-inside text-gray-400">
                {reviewReport.suggestions.map((suggestion: string, index: number) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div className="text-center mt-8">
              <button
                onClick={handleRewriteResume}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 shadow-lg"
              >
                ✨ Rewrite with AI
              </button>
              <button
                onClick={() => setShowHistory(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-12 rounded-full text-xl transition-all duration-300 shadow-lg ml-4"
              >
                🕓 View Review History
              </button>
            </div>
          </div>
        )}

        {rewrittenResume && (
          <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl mt-8">
            <h2 className="text-3xl font-bold text-center mb-8">GPT-Powered Resume Editor</h2>
            <textarea
              className="w-full h-96 bg-gray-900 text-white p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
              value={rewrittenResume}
              onChange={(e) => setRewrittenResume(e.target.value)}
            />
            <div className="text-center mt-8">
              <button
                onClick={handleRewriteResume}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
              >
                🔄 Rewrite Again
              </button>
              <button
                onClick={() => {
                  const savedReviews = JSON.parse(localStorage.getItem('resumeReviews') || '[]');
                  const newReview = { ...reviewReport, rewrittenResume, date: new Date().toISOString() };
                  savedReviews.push(newReview);
                  localStorage.setItem('resumeReviews', JSON.stringify(savedReviews));
                  setHistory(savedReviews);
                  toast.success('Review saved successfully!');
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ml-4"
              >
                💾 Save
              </button>
              <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ml-4">
                ⬇ Download PDF
              </button>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg">
              <h2 className="text-3xl font-bold text-center mb-8">🕓 Review History</h2>
              <ul className="space-y-4">
                {history.map((item, index) => (
                  <li key={index} className="bg-gray-700 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{new Date(item.date).toLocaleString()}</p>
                      <p>Match Score: {item.matchScore}%</p>
                    </div>
                    <div>
                      <button className="bg-blue-600 text-white p-2 rounded-lg">📄 View</button>
                      <button className="bg-red-600 text-white p-2 rounded-lg ml-2">🗑 Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="text-center mt-8">
                <button onClick={() => setShowHistory(false)} className="bg-gray-600 text-white p-3 rounded-lg">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResumeReviewerPage;