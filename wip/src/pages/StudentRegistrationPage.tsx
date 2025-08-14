import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, GraduationCap, Briefcase, ChevronDown, ChevronUp } from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import { Student, Batch } from '../context/StudentContext';

const StudentRegistrationPage: React.FC = () => {
  const { batches, setStudents } = useStudents();
  const [showEducation, setShowEducation] = useState(true);
  const [showExperience, setShowExperience] = useState(false);
  const [isExperienced, setIsExperienced] = useState(false);

  const [formData, setFormData] = useState<Omit<Student, 'id' | 'attendance'>>({
    studentId: '',
    name: '',
    photo: '',
    email: '',
    mobile: '',
    batchId: '',
    education: {
      degree: '',
      course: '',
      passoutYear: new Date().getFullYear(),
      percentage: 0,
    },
    experience: undefined,
    active: true,
    qrCode: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('education.')) {
      const field = name.split('.')[1] as keyof Student['education'];
      setFormData(prev => ({
        ...prev,
        education: {
          ...prev.education,
          [field]: field === 'passoutYear' || field === 'percentage' ? Number(value) : value
        }
      }));
    } else if (name.startsWith('experience.')) {
      const field = name.split('.')[1] as keyof NonNullable<Student['experience']>;
      setFormData(prev => ({
        ...prev,
        experience: {
          ...prev.experience,
          [field]: field === 'years' ? Number(value) : value
        } as Student['experience']
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const generateQRCode = (studentId: string, batchId: string) => {
    return `student:${studentId}|batch:${batchId}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `S${Date.now()}`;
    const newStudent: Student = {
      ...formData,
      id,
      qrCode: generateQRCode(id, formData.batchId),
      attendance: []
    };
    
    setStudents(prev => [...prev, newStudent]);
    // Reset form
    setFormData({
      studentId: '',
      name: '',
      photo: '',
      email: '',
      mobile: '',
      batchId: '',
      education: {
        degree: '',
        course: '',
        passoutYear: new Date().getFullYear(),
        percentage: 0,
      },
      experience: undefined,
      active: true,
      qrCode: '',
    });
    alert('Registration successful!');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-6">
              <UserPlus className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Registration</h1>
              <p className="text-lg text-gray-600">Complete your details to join the institute</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Personal Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID*</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile*</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch*</label>
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchType}-{batch.batchNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Photo Upload */}
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  {formData.photo ? (
                    <img 
                      src={formData.photo} 
                      alt="Student" 
                      className="w-48 h-48 object-cover rounded-full border-4 border-indigo-100"
                    />
                  ) : (
                    <div className="bg-gray-200 border-2 border-dashed rounded-full w-48 h-48 flex items-center justify-center">
                      <span className="text-gray-500">Upload Photo</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500 mt-2">Upload a clear passport-size photo</p>
              </div>
            </div>
            
            {/* Education Section */}
            <div className="border rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowEducation(!showEducation)}
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                  Education Details
                </h2>
                {showEducation ? <ChevronUp /> : <ChevronDown />}
              </div>
              
              {showEducation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Degree*</label>
                    <input
                      type="text"
                      name="education.degree"
                      value={formData.education.degree}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course*</label>
                    <input
                      type="text"
                      name="education.course"
                      value={formData.education.course}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Passout Year*</label>
                    <input
                      type="number"
                      name="education.passoutYear"
                      value={formData.education.passoutYear}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      min="2000"
                      max={new Date().getFullYear()}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Percentage*</label>
                    <input
                      type="number"
                      name="education.percentage"
                      value={formData.education.percentage}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Experience Section */}
            <div className="border rounded-lg p-4">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setShowExperience(!showExperience)}
              >
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  Work Experience
                </h2>
                {showExperience ? <ChevronUp /> : <ChevronDown />}
              </div>
              
              {showExperience && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <label className="flex items-center mr-6">
                      <input
                        type="radio"
                        name="experienceStatus"
                        checked={!isExperienced}
                        onChange={() => setIsExperienced(false)}
                        className="mr-2"
                      />
                      Fresher
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="experienceStatus"
                        checked={isExperienced}
                        onChange={() => setIsExperienced(true)}
                        className="mr-2"
                      />
                      Experienced
                    </label>
                  </div>
                  
                  {isExperienced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience*</label>
                        <input
                          type="number"
                          name="experience.years"
                          value={formData.experience?.years || ''}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                          min="1"
                          required={isExperienced}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience Description</label>
                        <textarea
                          name="experience.description"
                          value={formData.experience?.description || ''}
                          onChange={handleChange}
                          className="w-full p-2 border rounded"
                          rows={3}
                          required={isExperienced}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Complete Registration
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegistrationPage;
