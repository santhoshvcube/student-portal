import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { motion } from 'framer-motion';
import { Camera, Users, Briefcase, ChevronDown, Clock, LogIn, LogOut } from 'lucide-react';
import { useStudents } from '../context/StudentContext';
import { Student } from '../context/StudentContext';
import toast from 'react-hot-toast';
import AdminDashboardButton from '../components/AdminDashboardButton';

const QRScannerPage: React.FC = () => {
  const { students, setStudents } = useStudents();
  const [attendanceType, setAttendanceType] = useState<'class' | 'lab' | 'hr_session'>('class');
  const [labTimeType, setLabTimeType] = useState<'in' | 'out'>('in');
  const [selectedHrSession, setSelectedHrSession] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);

  const hrSessions = [
    "Interview Success & Interaction",
    "LinkedIn Profile Building",
    "Self Introduction & Career Ice Breaking",
    "JAM & Impromptu Speaking",
    "Group Discussion Mastery",
    "Resume Building",
    "HR Round 1",
    "Final Profile Review Lab 1-Lab 1",
    "Q & A- Lab 2",
    "Technical Questions Practice -Lab 3",
    "Technical Project Explanation -Lab 4"
  ];

  const handleResult = (result: any, error: any) => {
    if (!!result) {
      setShowScanner(false);
      handleAttendanceRecord(result?.text);
    }

    if (!!error) {
      // console.info(error);
    }
  }

  const handleAttendanceRecord = (studentId: string) => {
    const student = students.find((s: Student) => s.id === studentId);
    if (!student) {
      toast.error('Invalid QR code - student not found');
      return;
    }

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString();

    if (attendanceType === 'lab') {
        const existingRecordIndex = student.attendance?.findIndex(a => a.date === date && a.type === 'lab');
        if (existingRecordIndex !== -1 && student.attendance) {
            const updatedAttendance = [...student.attendance];
            if(labTimeType === 'in') updatedAttendance[existingRecordIndex].inTime = time;
            else updatedAttendance[existingRecordIndex].outTime = time;
            
            setStudents(prev => prev.map(s => s.id === studentId ? {...s, attendance: updatedAttendance} : s));
        } else {
            const newRecord = { date, type: 'lab' as const, inTime: time };
            setStudents(prev => prev.map(s => s.id === studentId ? {...s, attendance: [...(s.attendance || []), newRecord]} : s));
        }
        toast.success(`Lab ${labTimeType}-time for ${student.name} recorded!`);
    } else {
        const newRecord = { 
            date, 
            type: attendanceType, 
            present: true,
            ...(attendanceType === 'hr_session' && { sessionName: selectedHrSession })
        };
        setStudents(prev => prev.map(s => s.id === studentId ? {...s, attendance: [...(s.attendance || []), newRecord]} : s));
        toast.success(`Attendance for ${student.name} recorded!`);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <AdminDashboardButton />
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Camera className="w-12 h-12 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900">QR Attendance Scanner</h1>
          <p className="text-xl text-gray-600 mt-2">Select the attendance type and scan the student's QR code.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Attendance For?</h3>
            <div className="flex gap-4">
              <button onClick={() => setAttendanceType('class')} className={`flex-1 p-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${attendanceType === 'class' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}><Users size={20}/> Class</button>
              <button onClick={() => setAttendanceType('lab')} className={`flex-1 p-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${attendanceType === 'lab' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}><Clock size={20}/> Lab</button>
              <button onClick={() => setAttendanceType('hr_session')} className={`flex-1 p-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${attendanceType === 'hr_session' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}><Briefcase size={20}/> HR Session</button>
            </div>
          </div>

          {attendanceType === 'lab' && (
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Lab Time</h3>
                <div className="flex gap-4">
                    <button onClick={() => setLabTimeType('in')} className={`flex-1 p-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${labTimeType === 'in' ? 'bg-cyan-500 text-white' : 'bg-gray-200'}`}><LogIn size={20}/> In-Time</button>
                    <button onClick={() => setLabTimeType('out')} className={`flex-1 p-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${labTimeType === 'out' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}><LogOut size={20}/> Out-Time</button>
                </div>
            </div>
          )}

          {attendanceType === 'hr_session' && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Select HR Session</h3>
              <div className="relative">
                <select
                  value={selectedHrSession}
                  onChange={(e) => setSelectedHrSession(e.target.value)}
                  className="w-full p-4 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" disabled>Select a session</option>
                  {hrSessions.map(session => (
                    <option key={session} value={session}>{session}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          {showScanner && (
            <QrReader
                onResult={handleResult}
                constraints={{ facingMode: 'environment' }}
                containerStyle={{ width: '100%' }}
            />
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setShowScanner(prev => !prev)}
              disabled={attendanceType === 'hr_session' && !selectedHrSession}
              className={`px-8 py-4 text-lg font-semibold rounded-lg text-white flex items-center gap-2 transition-colors ${
                showScanner
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              } disabled:bg-gray-400`}
            >
              {showScanner ? "Stop Scanner" : "Start Scanner"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QRScannerPage;
