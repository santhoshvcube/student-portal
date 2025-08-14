import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, Bot, BrainCircuit, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const focusAreas = [
  "Azure & Cloud Infrastructure",
  "DevOps Tools & CI/CD",
  "Linux/Scripting & OS",
  "Kubernetes & Containers",
  "Networking & Security",
  "Full Project Simulation",
];

const questions: { [key: string]: string[] } = {
  "Azure & Cloud Infrastructure": [
    "What is the difference between IaaS, PaaS, and SaaS?",
    "Explain the concept of a Virtual Network in Azure.",
    "How would you secure a web application hosted on Azure?",
  ],
  "DevOps Tools & CI/CD": [
    "What is CI/CD and why is it important?",
    "Explain the role of Docker in a DevOps pipeline.",
    "Describe a time you automated a process.",
  ],
  "Linux/Scripting & OS": [
    "What is the difference between a process and a thread?",
    "How would you check the memory usage of a Linux system?",
    "Write a shell script to find all files in a directory with a .log extension.",
  ],
  "Kubernetes & Containers": [
    "What is Kubernetes and what problems does it solve?",
    "Explain the difference between a Pod and a Deployment.",
    "How would you troubleshoot a failing Pod?",
  ],
  "Networking & Security": [
    "What is the difference between TCP and UDP?",
    "Explain the concept of a firewall.",
    "How would you protect against a DDoS attack?",
  ],
  "Full Project Simulation": [
    "Describe a complex project you have worked on.",
    "What was your role in the project?",
    "What were the biggest challenges you faced and how did you overcome them?",
  ],
};

const CloudEdgeAI: React.FC = () => {
  const [introduction, setIntroduction] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);

  const handleStartInterview = () => {
    if (!introduction) {
      toast.error("Please introduce yourself first.");
      return;
    }
    if (!focusArea) {
      toast.error("Please select a focus area.");
      return;
    }
    setInterviewStarted(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold">CloudEdge.AI</h1>
          <p className="text-xl text-gray-400">Your Personal AI Mock Interviewer</p>
        </div>

        {!interviewStarted ? (
          <div className="space-y-8">
            <div>
              <label className="text-lg font-semibold mb-2 block">Introduction</label>
              <textarea
                className="w-full h-32 bg-gray-800 text-white p-4 rounded-lg"
                placeholder="Hello! Welcome to your AI Mock Interview. Let’s begin with a short self-introduction. You may speak or type it out."
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
              />
            </div>

            <div>
              <label className="text-lg font-semibold mb-2 block">Upload Resume/JD (Optional)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  className="w-full p-2 border rounded bg-gray-800 border-gray-700"
                  onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                />
                <textarea
                  className="w-full h-24 bg-gray-800 text-white p-4 rounded-lg"
                  placeholder="Or paste job description here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-lg font-semibold mb-2 block">Choose Focus Area</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {focusAreas.map((area) => (
                  <motion.button
                    key={area}
                    whileHover={{ scale: 1.05 }}
                    className={`p-4 rounded-lg ${focusArea === area ? 'bg-purple-600' : 'bg-gray-800'}`}
                    onClick={() => setFocusArea(area)}
                  >
                    {area}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="text-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-lg"
                onClick={handleStartInterview}
              >
                <Play className="inline-block mr-2" /> Start Interview
              </motion.button>
            </div>
          </div>
        ) : currentQuestionIndex < questions[focusArea].length ? (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border rounded-lg p-4 h-96 overflow-y-auto">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Bot className="text-white" />
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p>{questions[focusArea][currentQuestionIndex]}</p>
                  </div>
                </div>
                <textarea
                  className="w-full h-32 bg-gray-700 text-white p-4 rounded-lg"
                  placeholder="Your answer..."
                  value={answers[currentQuestionIndex] || ''}
                  onChange={(e) => {
                    const newAnswers = [...answers];
                    newAnswers[currentQuestionIndex] = e.target.value;
                    setAnswers(newAnswers);
                  }}
                />
              </div>
              <div className="space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                  <h3 className="font-semibold text-lg mb-2">Interview Progress</h3>
                  <div className="w-full bg-gray-600 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${((currentQuestionIndex + 1) / questions[focusArea].length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-right mt-1">
                    Question {currentQuestionIndex + 1} of {questions[focusArea].length}
                  </p>
                </div>
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-lg"
                    onClick={() => {
                      // Mock scoring and feedback
                      const score = Math.floor(Math.random() * 4) + 7;
                      const newScores = [...scores, score];
                      setScores(newScores);

                      const newFeedback = [...feedback, `Answer Score: ${score}/10. Feedback: You gave a solid explanation but could mention a specific metric to make it stronger.`];
                      setFeedback(newFeedback);

                      if (currentQuestionIndex < questions[focusArea].length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                      } else {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        toast.success("Interview complete!");
                      }
                    }}
                  >
                    {currentQuestionIndex < questions[focusArea].length - 1 ? 'Next Question' : 'Finish Interview'}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8">Final Evaluation Report</h2>
            <div className="text-center mb-8">
              <p className="text-2xl font-bold">
                Total Score: {scores.reduce((a, b) => a + b, 0)}/100
              </p>
              <p
                className={`text-2xl font-bold ${
                  scores.reduce((a, b) => a + b, 0) >= 80
                    ? "text-green-500"
                    : scores.reduce((a, b) => a + b, 0) >= 60
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                Readiness Status:{" "}
                {scores.reduce((a, b) => a + b, 0) >= 80
                  ? "Ready"
                  : scores.reduce((a, b) => a + b, 0) >= 60
                  ? "Improving"
                  : "Needs Practice"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Strengths</h3>
                <ul className="list-disc list-inside text-gray-400">
                  {scores.map(
                    (score, index) =>
                      score >= 8 && (
                        <li key={index}>
                          Good performance on question {index + 1}.
                        </li>
                      )
                  )}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Areas for Improvement</h3>
                <ul className="list-disc list-inside text-gray-400">
                  {scores.map(
                    (score, index) =>
                      score < 8 && (
                        <li key={index}>
                          Could improve on question {index + 1}.
                        </li>
                      )
                  )}
                </ul>
              </div>
            </div>
            <div className="text-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-green-600 text-white px-8 py-4 rounded-lg shadow-lg"
                onClick={() => toast.success("Scorecard saved!")}
              >
                Save Scorecard
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CloudEdgeAI;