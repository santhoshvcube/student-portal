import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import Modal from '../components/Modal';
import { Plus, X, Eye, Save, Download, Zap, ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// Section Components
const CareerObjectiveSection: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => (
  <div className="space-y-4">
    <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
      <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">1</span>
      Career Objective
    </h3>
    <textarea
      className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      rows={5}
      placeholder="Write a compelling career objective that highlights your goals and aspirations..."
      value={formData.careerObjective || ''}
      onChange={(e) => setFormData({ ...formData, careerObjective: e.target.value })}
    />
  </div>
);

const EducationSection: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const addEntry = () => {
    setFormData((prev: any) => ({
      ...prev,
      education: [...(prev.education || []), { degree: '', university: '', year: '', cgpa: '' }]
    }));
  };

  const updateEntry = (index: number, field: string, value: string) => {
    const updated = [...(formData.education || [])];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  const removeEntry = (index: number) => {
    const updated = (formData.education || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, education: updated });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">2</span>
        Education
      </h3>
      <AnimatePresence>
        {(formData.education || []).map((entry: any, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="border border-gray-200 p-6 rounded-xl bg-gray-50 relative"
          >
            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Degree/Qualification" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={entry.degree} 
                onChange={(e) => updateEntry(index, 'degree', e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="University/Board" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={entry.university} 
                onChange={(e) => updateEntry(index, 'university', e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="Year of Passing" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={entry.year} 
                onChange={(e) => updateEntry(index, 'year', e.target.value)} 
              />
              <input 
                type="text" 
                placeholder="CGPA/Percentage" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={entry.cgpa} 
                onChange={(e) => updateEntry(index, 'cgpa', e.target.value)} 
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <AnimatedButton 
        onClick={addEntry} 
        label="Add Education Entry" 
        icon={Plus}
        className="bg-green-500 hover:bg-green-600 text-white" 
      />
    </div>
  );
};

const SkillsSection: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = () => {
    if (newSkill.trim() === '') {
      toast.error('Skill cannot be empty.');
      return;
    }
    setFormData((prev: any) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill.trim()]
    }));
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    const updatedSkills = (formData.skills || []).filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, skills: updatedSkills });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
        <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">3</span>
        Skills
      </h3>
      <div className="flex flex-wrap gap-3 mb-6">
        <AnimatePresence>
          {(formData.skills || []).map((skill: string, index: number) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full flex items-center gap-2 font-medium"
            >
              {skill}
              <button 
                type="button" 
                onClick={() => removeSkill(index)} 
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Add a new skill (e.g., JavaScript, Python)"
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
        />
        <AnimatedButton 
          onClick={addSkill} 
          label="Add" 
          icon={Plus}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6" 
        />
      </div>
    </div>
  );
};

// Template data
const templates = [
  { 
    id: 'modern-blue', 
    name: 'Modern Blue', 
    type: 'professional',
    color: 'blue',
    preview: 'https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=300&h=400'
  },
  { 
    id: 'elegant-green', 
    name: 'Elegant Green', 
    type: 'creative',
    color: 'green',
    preview: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=300&h=400'
  },
  { 
    id: 'classic-gray', 
    name: 'Classic Gray', 
    type: 'traditional',
    color: 'gray',
    preview: 'https://images.pexels.com/photos/6803520/pexels-photo-6803520.jpeg?auto=compress&cs=tinysrgb&w=300&h=400'
  },
  { 
    id: 'creative-purple', 
    name: 'Creative Purple', 
    type: 'creative',
    color: 'purple',
    preview: 'https://images.pexels.com/photos/7688665/pexels-photo-7688665.jpeg?auto=compress&cs=tinysrgb&w=300&h=400'
  }
];

const TemplateSelector: React.FC<{ selectedTemplate: string; setSelectedTemplate: (id: string) => void }> = ({ 
  selectedTemplate, 
  setSelectedTemplate 
}) => {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-blue-700">Choose Your Template</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {templates.map(template => (
          <motion.div
            key={template.id}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all duration-300
              ${selectedTemplate === template.id 
                ? 'border-blue-500 shadow-lg ring-4 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="aspect-[3/4] bg-gray-200">
              <img 
                src={template.preview} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 bg-white">
              <p className="font-semibold text-gray-800 text-sm text-center">{template.name}</p>
            </div>
            {selectedTemplate === template.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold"
              >
                Selected
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Component
const ResumeBuilderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  const [jobDescription, setJobDescription] = useState('');
  const [aiScore, setAiScore] = useState<number | null>(null);
  const [isScoring, setIsScoring] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const steps = [
    { name: 'Career Objective', component: CareerObjectiveSection },
    { name: 'Education', component: EducationSection },
    { name: 'Skills', component: SkillsSection },
  ];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleAIScore = async () => {
    if (!jobDescription.trim() || Object.keys(formData).length === 0) {
      toast.error("Please enter Job Description and fill resume details first!");
      return;
    }
    setIsScoring(true);
    toast.promise(
      new Promise(resolve => {
        setTimeout(() => {
          const simulatedScore = Math.floor(Math.random() * (95 - 65 + 1)) + 65;
          setAiScore(simulatedScore);
          resolve(simulatedScore);
        }, 2000);
      }),
      {
        loading: 'Analyzing resume with AI...',
        success: (score: any) => `AI Score: ${score}%!`,
        error: 'Failed to calculate AI Score.',
      }
    ).finally(() => {
      setIsScoring(false);
    });
  };

  const handleSave = () => {
    toast.success("Resume saved successfully!");
  };

  const handleDownload = async (type: 'pdf' | 'docx') => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: `Generating ${type.toUpperCase()}...`,
        success: `${type.toUpperCase()} downloaded!`,
        error: `Failed to download ${type.toUpperCase()}.`,
      }
    );
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Resume Builder</h1>
          <p className="text-xl text-gray-600">Create a professional resume with AI-powered insights</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              {/* Step Navigation */}
              <div className="flex justify-between items-center mb-8">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={`
                      flex-1 text-center py-3 border-b-4 cursor-pointer transition-all duration-300
                      ${index === currentStep 
                        ? 'border-blue-500 text-blue-700 font-bold' 
                        : 'border-gray-200 text-gray-500 hover:text-gray-700'
                      }
                    `}
                    onClick={() => setCurrentStep(index)}
                  >
                    <span className="text-sm md:text-base">{step.name}</span>
                  </div>
                ))}
              </div>

              {/* Current Step Form */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="min-h-[400px]"
                >
                  <CurrentStepComponent formData={formData} setFormData={setFormData} />
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <AnimatedButton
                  onClick={handlePrev}
                  label="Previous"
                  icon={ArrowLeft}
                  disabled={currentStep === 0}
                  className="bg-gray-300 text-gray-800 hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <AnimatedButton
                  onClick={handleNext}
                  label="Next"
                  icon={ArrowRight}
                  disabled={currentStep === steps.length - 1}
                  className="bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                setSelectedTemplate={setSelectedTemplate}
              />
            </motion.div>

            {/* AI Score Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6 text-white"
            >
              <div className="flex items-center mb-4">
                <Zap className="w-6 h-6 mr-2" />
                <h3 className="text-xl font-semibold">AI Resume Score</h3>
              </div>
              <textarea
                className="w-full p-3 rounded-lg text-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-white resize-none"
                rows={4}
                placeholder="Paste job description here for AI compatibility analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <div className="mt-4 space-y-4">
                <AnimatedButton
                  onClick={handleAIScore}
                  label="Get AI Score"
                  isLoading={isScoring}
                  className="w-full bg-white text-orange-600 hover:bg-gray-100 font-semibold"
                  icon={Zap}
                />
                {aiScore !== null && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className={`
                      text-4xl font-bold p-4 rounded-xl border-4 border-white
                      ${aiScore >= 80 ? 'bg-green-500' : aiScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                    `}>
                      {aiScore}%
                    </div>
                    <p className="mt-2 text-sm opacity-90">
                      {aiScore >= 80 ? 'Excellent match!' : aiScore >= 60 ? 'Good match' : 'Needs improvement'}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
              <AnimatedButton
                onClick={() => setIsPreviewModalOpen(true)}
                label="Preview Resume"
                icon={Eye}
                className="w-full bg-teal-500 text-white hover:bg-teal-600"
              />
              <AnimatedButton
                onClick={handleSave}
                label="Save Resume"
                icon={Save}
                className="w-full bg-indigo-500 text-white hover:bg-indigo-600"
              />
              <AnimatedButton
                onClick={() => handleDownload('pdf')}
                label="Download PDF"
                icon={Download}
                className="w-full bg-red-500 text-white hover:bg-red-600"
                animationType="download-pdf"
              />
              <AnimatedButton
                onClick={() => handleDownload('docx')}
                label="Download DOCX"
                icon={Download}
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                animationType="download-docx"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        title="Resume Preview" 
        size="xl"
      >
        <div className="text-center p-8">
          <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
            <img 
              src={templates.find(t => t.id === selectedTemplate)?.preview} 
              alt="Resume Preview" 
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
          <div className="text-left bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg mb-4">Resume Data Summary:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Career Objective:</strong>
                <p className="text-gray-600 mt-1">
                  {formData.careerObjective ? 
                    `${formData.careerObjective.substring(0, 100)}...` : 
                    'Not specified'
                  }
                </p>
              </div>
              <div>
                <strong>Education Entries:</strong>
                <p className="text-gray-600 mt-1">{formData.education?.length || 0} entries</p>
              </div>
              <div>
                <strong>Skills:</strong>
                <p className="text-gray-600 mt-1">{formData.skills?.length || 0} skills listed</p>
              </div>
              <div>
                <strong>Template:</strong>
                <p className="text-gray-600 mt-1">{templates.find(t => t.id === selectedTemplate)?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ResumeBuilderPage;
