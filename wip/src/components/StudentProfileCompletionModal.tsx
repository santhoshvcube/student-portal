import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useStudents } from '../context/StudentContext';
import { Education } from '../context/StudentContext';

interface StudentProfileCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
  onSave?: (data: any) => void;
}

const StudentProfileCompletionModal: React.FC<StudentProfileCompletionModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [education, setEducation] = useState<Education[]>([]);
  const [experienceYears, setExperienceYears] = useState('');
  const [status, setStatus] = useState('fresher');
  const { batches } = useStudents();
  const [batchNumber, setBatchNumber] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [skills, setSkills] = useState<string[]>(['React', 'Node.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Python', 'Java', 'SQL', 'MongoDB']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (student) {
      const studentBatch = batches.find(b => b.id === student.batchId);
      if (studentBatch) {
        setBatchNumber(studentBatch.batchNumber);
      }
    }
  }, [student, batches]);

  const handleAddEducation = () => {
    setEducation([...education, {
      level: 'Degree',
      boardOrUniversity: '',
      institution: '',
      course: '',
      passoutYear: new Date().getFullYear(),
      percentageOrCgpa: 0,
    }]);
  };

  const handleEducationChange = (index: number, field: keyof Education, value: any) => {
    const newEducation = [...education];
    (newEducation[index] as any)[field] = value;
    setEducation(newEducation);
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = education.filter((_, i) => i !== index);
    setEducation(newEducation);
  };

  const handleSave = () => {
    const data = {
      photo,
      education,
      status,
      experience: status === 'experienced' ? {
        years: parseInt(experienceYears),
        description: '',
      } : undefined,
    };
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Your Profile" hideCloseButton>
      <div className="p-6 bg-gray-50 rounded-lg">
        {/* Non-editable fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div><label className="block text-sm font-medium text-gray-700">Student ID</label><input type="text" value={student.studentId} disabled className="mt-1 w-full p-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" value={student.name} disabled className="mt-1 w-full p-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Email</label><input type="text" value={student.email} disabled className="mt-1 w-full p-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Mobile</label><input type="text" value={student.mobile} disabled className="mt-1 w-full p-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Batch</label><input type="text" value={batchNumber} disabled className="mt-1 w-full p-3 border border-gray-300 rounded-md bg-gray-100 shadow-sm" /></div>
        </div>

        {/* Photo Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Profile Photo</label>
          <input type="file" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = (e) => setPhoto(e.target?.result as string);
              reader.readAsDataURL(e.target.files[0]);
            }
          }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
        </div>
        
        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">LinkedIn Profile</label>
            <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">GitHub Profile</label>
            <input type="text" value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/yourusername" className="mt-1 w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        {/* Education Details */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Education Details</h3>
          {education.map((edu, index) => (
            <div key={index} className="border p-4 rounded-md mb-4 bg-white shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={edu.level} onChange={(e) => handleEducationChange(index, 'level', e.target.value)} className="w-full p-3 border border-gray-300 rounded-md">
                  <option value="SSC/10th">SSC/10th</option>
                  <option value="Intermediate/Diploma">Intermediate/Diploma</option>
                  <option value="Degree">Degree</option>
                  <option value="PG">PG</option>
                </select>
                <input type="text" placeholder="Board / University" value={edu.boardOrUniversity} onChange={(e) => handleEducationChange(index, 'boardOrUniversity', e.target.value)} className="w-full p-3 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Institution / School / College" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className="w-full p-3 border border-gray-300 rounded-md" />
                <input type="text" placeholder="Course / Specialization" value={edu.course} onChange={(e) => handleEducationChange(index, 'course', e.target.value)} className="w-full p-3 border border-gray-300 rounded-md" />
                <input type="number" placeholder="Year of Passing" value={edu.passoutYear} onChange={(e) => handleEducationChange(index, 'passoutYear', parseInt(e.target.value))} className="w-full p-3 border border-gray-300 rounded-md" />
                <input type="number" placeholder="Percentage / CGPA" value={edu.percentageOrCgpa} onChange={(e) => handleEducationChange(index, 'percentageOrCgpa', parseFloat(e.target.value))} className="w-full p-3 border border-gray-300 rounded-md" />
              </div>
              <button onClick={() => handleRemoveEducation(index)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">Remove</button>
            </div>
          ))}
          <button onClick={handleAddEducation} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors">Add Education</button>
        </div>
        
        {/* Skills */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Skills</h3>
          <p className="text-sm text-gray-600 mb-4">Select your skills. You can also add new ones.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map(skill => (
              <div key={skill} className="bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                {skill}
                <button onClick={() => setSelectedSkills(selectedSkills.filter(s => s !== skill))} className="text-white">&times;</button>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <select
              onChange={(e) => {
                const skill = e.target.value;
                if (skill && !selectedSkills.includes(skill)) {
                  setSelectedSkills([...selectedSkills, skill]);
                }
                e.target.value = '';
              }}
              className="w-full p-3 border border-gray-300 rounded-md"
            >
              <option value="" disabled>Select a skill</option>
              {skills.filter(s => !selectedSkills.includes(s)).map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
            <input 
              type="text" 
              placeholder="Add a new skill"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const newSkill = e.currentTarget.value.trim();
                  if (!skills.includes(newSkill)) {
                    setSkills([...skills, newSkill]);
                  }
                  if (!selectedSkills.includes(newSkill)) {
                    setSelectedSkills([...selectedSkills, newSkill]);
                  }
                  e.currentTarget.value = '';
                  e.preventDefault();
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Fresher/Experienced Status */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Professional Status</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-3 border border-gray-300 rounded-md">
            <option value="fresher">Fresher</option>
            <option value="experienced">Experienced</option>
          </select>
        </div>

        {status === 'experienced' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700">Total Years of Experience</label>
            <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="mt-1 w-full p-3 border border-gray-300 rounded-md" />
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-md">Save & Continue</button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentProfileCompletionModal;