import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, Bot, BrainCircuit, FileText, MessageSquare, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../auth/AuthContext';

const interviewModes = [
  {
    name: "Technical Mock Interview",
    icon: <BrainCircuit className="inline-block mb-2" />,
  },
  {
    name: "Communication Skill Improvement",
    icon: <MessageSquare className="inline-block mb-2" />,
  },
];

const technicalFocusAreas = [
  "Azure & Cloud Infrastructure",
  "DevOps Tools & CI/CD",
  "Linux/Scripting & OS",
  "Kubernetes & Containers",
  "Networking & Security",
  "Full Project Simulation",
];

const communicationQuestions = [
  "Tell me about a challenge you overcame.",
  "How do you handle criticism?",
  "Describe a time you had to work with a difficult person.",
  "What are your biggest strengths and weaknesses?",
  "Where do you see yourself in 5 years?",
];

const technicalQuestions: { [key: string]: string[] } = {
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

const AIInterviewAgent: React.FC = () => {
  const [interviewMode, setInterviewMode] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [focusArea, setFocusArea] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string[]>([]);
  const { user } = useAuth();
  const [interviewId, setInterviewId] = useState<number | null>(null);

  const handleStartInterview = () => {
    if (!introduction) {
      toast.error("Please introduce yourself first.");
      return;
    }
    if (interviewMode === "Technical Mock Interview" && !focusArea) {
      toast.error("Please select a focus area.");
      return;
    }
    setInterviewStarted(true);
  };

  const getQuestions = () => {
    if (interviewMode === "Technical Mock Interview") {
      return technicalQuestions[focusArea];
    }
    return communicationQuestions;
  };

  const currentQuestions = getQuestions();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold">AI Interview Agent</h1>
          <p className="text-xl text-gray-400">Your Personal AI Mock Interviewer</p>
        </div>

        {!interviewMode ? (
          <div>
            <label className="text-lg font-semibold mb-4 block text-center">Choose Interview Type</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {interviewModes.map((mode) => (
                <motion.button
                  key={mode.name}
                  whileHover={{ scale: 1.05 }}
                  className={`p-8 rounded-lg bg-gray-800 text-center`}
                  onClick={() => setInterviewMode(mode.name)}
                >
                  {mode.icon}
                  <h2 className="text-2xl font-bold">{mode.name}</h2>
                </motion.button>
              ))}
            </div>
          </div>
        ) : !interviewStarted ? (
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

            {interviewMode === "Technical Mock Interview" && (
              <div>
                <label className="text-lg font-semibold mb-2 block">Choose Focus Area</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {technicalFocusAreas.map((area) => (
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
            )}

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
        ) : currentQuestionIndex < currentQuestions.length ? (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border rounded-lg p-4 h-96 overflow-y-auto">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="bg-blue-500 p-2 rounded-full">
                    <Bot className="text-white" />
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p>{currentQuestions[currentQuestionIndex]}</p>
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
                      style={{ width: `${((currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-right mt-1">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </p>
                </div>
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-lg"
                    onClick={async () => {
                      // Mock scoring and feedback
                      const score = Math.floor(Math.random() * 4) + 7;
                      const newScores = [...scores, score];
                      setScores(newScores);

                      const newFeedback = [...feedback, `Answer Score: ${score}/10. Feedback: You gave a solid explanation but could mention a specific metric to make it stronger.`];
                      setFeedback(newFeedback);

                      if (currentQuestionIndex < currentQuestions.length - 1) {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                      } else {
                        setCurrentQuestionIndex(currentQuestionIndex + 1);
                        toast.success("Interview complete!");
                        // Save interview to DB
                        if (user) {
                          const interviewData = {
                            studentId: user.id,
                            interviewMode,
                            focusArea,
                            questions: getQuestions(),
                            answers,
                            scores: newScores,
                            feedback: newFeedback,
                            date: new Date().toISOString(),
                          };
                          try {
                            const response = await fetch('http://localhost:3000/api/interviews', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify(interviewData),
                            });
                            if (response.ok) {
                              const data = await response.json();
                              setInterviewId(data.id);
                              toast.success("Interview saved successfully!");
                            } else {
                              toast.error("Failed to save interview.");
                            }
                          } catch (error) {
                            console.error("Error saving interview:", error);
                            toast.error("Failed to save interview.");
                          }
                        }
                      }
                    }}
                  >
                    {currentQuestionIndex < currentQuestions.length - 1 ? 'Next Question' : 'Finish Interview'}
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
                Total Score: {scores.reduce((a, b) => a + b, 0)}/{scores.length * 10}
              </p>
              <p
                className={`text-2xl font-bold ${
                  scores.reduce((a, b) => a + b, 0) / scores.length >= 8
                    ? "text-green-500"
                    : scores.reduce((a, b) => a + b, 0) / scores.length >= 6
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                Readiness Status:{" "}
                {scores.reduce((a, b) => a + b, 0) / scores.length >= 8
                  ? "Ready"
                  : scores.reduce((a, b) => a + b, 0) / scores.length >= 6
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
                onClick={async () => {
                  if (interviewId) {
                    try {
                      const response = await fetch(`http://localhost:3000/api/interviews/${interviewId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          scores,
                          feedback,
                        }),
                      });
                      if (response.ok) {
                        toast.success("Scorecard saved successfully!");
                      } else {
                        toast.error("Failed to save scorecard.");
                      }
                    } catch (error) {
                      console.error("Error saving scorecard:", error);
                      toast.error("Failed to save scorecard.");
                    }
                  }
                }}
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

export default AIInterviewAgent;