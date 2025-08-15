import React from 'react';

interface Student {
  name: string;
  studentId: string;
  batchNumber: string;
  email: string;
  mobile: string;
  photoUrl: string;
  qrCodeUrl: string;
}

const StudentIDCard: React.FC<{ student: Student }> = ({ student }) => {
  return (
    <div className="font-sans">
      <div
        className="bg-white rounded-2xl shadow-lg p-4"
        style={{
          width: '324px',
          height: 'auto',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        <div className="flex justify-between items-start">

          <img src="/aws.png" alt="AWS Logo" className="h-10" />
        </div>
        <div className="flex flex-col items-center text-center my-2">
          <img
            src={student.photoUrl}
            alt="Student"
            className="w-20 h-20 rounded-full border-4 border-gray-200 object-cover shadow-md"
          />
          <h2 className="text-xl font-bold mt-2 text-gray-800">
            {student.name}
          </h2>
        </div>
        <div className="text-xs text-gray-700 w-full my-2 px-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <span className="font-semibold text-left">Student ID:</span>
            <span className="text-right">{student.studentId}</span>
            <span className="font-semibold text-left">Batch Number:</span>
            <span className="text-right">{student.batchNumber}</span>
            <span className="font-semibold text-left">Email ID:</span>
            <span className="text-right">{student.email}</span>
            <span className="font-semibold text-left">Mobile No:</span>
            <span className="text-right">{student.mobile}</span>
          </div>
        </div>
        <div className="flex justify-end items-center mt-2">
          <img src={student.qrCodeUrl} alt="QR Code" className="w-16 h-16" />
        </div>
      </div>
    </div>
  );
};

export default StudentIDCard;