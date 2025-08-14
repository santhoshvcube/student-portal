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
      <div className="p-4">
        {/* Non-editable fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label>Student ID:</label><input type="text" value={student.studentId} disabled className="w-full p-2 border rounded bg-gray-200" /></div>
          <div><label>Name:</label><input type="text" value={student.name} disabled className="w-full p-2 border rounded bg-gray-200" /></div>
          <div><label>Email:</label><input type="text" value={student.email} disabled className="w-full p-2 border rounded bg-gray-200" /></div>
          <div><label>Mobile:</label><input type="text" value={student.mobile} disabled className="w-full p-2 border rounded bg-gray-200" /></div>
          <div><label>Batch:</label><input type="text" value={batchNumber} disabled className="w-full p-2 border rounded bg-gray-200" /></div>
        </div>

        {/* Photo Upload */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Upload Profile Photo</label>
          <input type="file" onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              const reader = new FileReader();
              reader.onload = (e) => setPhoto(e.target?.result as string);
              reader.readAsDataURL(e.target.files[0]);
            }
          }} />
        </div>

        {/* Education Details */}
        <div className="mb-4">
          <h3 className="font-bold mb-2">Education Details</h3>
          {education.map((edu, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <select value={edu.level} onChange={(e) => handleEducationChange(index, 'level', e.target.value)} className="w-full p-2 border rounded mb-2">
                <option value="SSC/10th">SSC/10th</option>
                <option value="Intermediate/Diploma">Intermediate/Diploma</option>
                <option value="Degree">Degree</option>
                <option value="PG">PG</option>
              </select>
              <input type="text" placeholder="Board / University" value={edu.boardOrUniversity} onChange={(e) => handleEducationChange(index, 'boardOrUniversity', e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="Institution / School / College" value={edu.institution} onChange={(e) => handleEducationChange(index, 'institution', e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="text" placeholder="Course / Specialization" value={edu.course} onChange={(e) => handleEducationChange(index, 'course', e.target.value)} className="w-full p-2 border rounded mb-2" />
              <input type="number" placeholder="Year of Passing" value={edu.passoutYear} onChange={(e) => handleEducationChange(index, 'passoutYear', parseInt(e.target.value))} className="w-full p-2 border rounded mb-2" />
              <input type="number" placeholder="Percentage / CGPA" value={edu.percentageOrCgpa} onChange={(e) => handleEducationChange(index, 'percentageOrCgpa', parseFloat(e.target.value))} className="w-full p-2 border rounded mb-2" />
              <button onClick={() => handleRemoveEducation(index)} className="bg-red-500 text-white p-2 rounded">Remove</button>
            </div>
          ))}
          <button onClick={handleAddEducation} className="bg-green-500 text-white p-2 rounded">Add More</button>
        </div>

        {/* Fresher/Experienced Status */}
        <div className="mb-4">
          <h3 className="font-bold mb-2">Status</h3>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-2 border rounded">
            <option value="fresher">Fresher</option>
            <option value="experienced">Experienced</option>
          </select>
        </div>

        {status === 'experienced' && (
          <div className="mb-4">
            <label>Total Years of Experience:</label>
            <input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className="w-full p-2 border rounded" />
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handleSave} className="bg-blue-500 text-white p-2 rounded">Save & Continue</button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentProfileCompletionModal;