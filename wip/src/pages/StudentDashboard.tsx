import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Modal from '../components/Modal';
import StudentProfileModal from '../components/StudentProfileModal';
import StudentIDCard from '../components/StudentIDCard';
import StudentProfileCompletionModal from '../components/StudentProfileCompletionModal';
import { useAuth } from '../auth/AuthContext';
import { useStudents } from '../context/StudentContext';
import QRCode from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  QrCode,
  CreditCard,
  Calendar,
  BarChart3,
  Download,
  FileText,
  User,
  Bot,
 ClipboardList
} from 'lucide-react';
import toast from 'react-hot-toast';


const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { students, setStudents, loading } = useStudents();
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false);
  const idCardRef = useRef<HTMLDivElement>(null);

  const studentData = students.find(s => s.id === user?.id);

  useEffect(() => {
    if (studentData && !studentData.profileComplete) {
      setIsCompletionModalOpen(true);
    }
  }, [studentData]);

  if (loading) {
    return <div>Loading student data...</div>;
  }

  if (!studentData) {
    return <div>Error: Could not find student data.</div>;
  }

  const latestEducation = studentData.education?.sort((a, b) => (b.passoutYear || 0) - (a.passoutYear || 0))[0];

  const qrCodeValue = JSON.stringify({
    studentId: studentData.studentId,
    name: studentData.name,
    batch: studentData.batchId
  });

  const handleDownloadIDCard = async () => {
    if (idCardRef.current) {
      toast.promise(
        html2canvas(idCardRef.current, { scale: 2 }).then(canvas => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height],
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${studentData.name}_ID_Card.pdf`);
        }),
        {
          loading: 'Generating ID Card...',
          success: 'ID Card downloaded!',
          error: 'Failed to download ID Card.',
        }
      );
    } else {
      toast.error("ID Card content not found.");
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto = reader.result as string;
        setStudents(prevStudents =>
          prevStudents.map(s =>
            s.id === user?.id ? { ...s, photo: newPhoto } : s
          )
        );
        toast.success("Photo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDownloadMonthlyReport = async () => {
    toast.promise(
      new Promise(resolve => setTimeout(resolve, 2000)),
      {
        loading: 'Generating Monthly Report...',
        success: 'Monthly Report downloaded!',
        error: 'Failed to download Monthly Report.',
      }
    );
  };

  const dashboardItems = [
    { title: "My QR Code", description: "Show QR code for attendance", icon: QrCode, action: () => setIsQRCodeModalOpen(true), color: "from-indigo-500 to-purple-500", type: "button" },
    { title: "ID Card", description: "View and download digital ID card", icon: CreditCard, action: () => setIsIdCardModalOpen(true), color: "from-purple-500 to-pink-500", type: "button" },
    { title: "Attendance", description: "View attendance records", icon: Calendar, link: "/view-attendance", color: "from-teal-500 to-cyan-500", type: "link" },
    { title: "Marks History", description: "View examination results", icon: BarChart3, link: "/view-marks", color: "from-rose-500 to-pink-500", type: "link" },
    { title: "Monthly Report", description: "Download progress report", icon: Download, action: handleDownloadMonthlyReport, color: "from-orange-500 to-red-500", type: "button" },
    { title: "Resume Builder", description: "Create professional resume", icon: FileText, link: "/resume", color: "from-green-500 to-emerald-500", type: "link" },
    { title: "AI Mock Interview", description: "Practice your interview skills with our AI-powered mock interviewer.", icon: Bot, link: "/ai-interview", color: "from-blue-500 to-purple-500", type: "link" },
    { title: "AI Resume Reviewer", description: "Get instant feedback on your resume and optimize it for ATS.", icon: FileText, link: "/resume-review", color: "from-purple-500 to-pink-500", type: "link" },
    { title: "Interview Reports", description: "View your past interview reports.", icon: ClipboardList, link: `/interview-reports/${user?.id}`, color: "from-cyan-500 to-blue-500", type: "link" }
   ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="bg-white rounded-2xl shadow-lg p-6 md:p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative group">
                  <img
                    src={studentData.photo || '/default-avatar.png'}
                    alt="Student"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md cursor-pointer"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <span className="text-white text-sm">Change</span>
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {studentData.name}!</h1>
                  <div className="text-blue-100 space-y-1 text-sm md:text-base">
                    <p><span className="font-semibold">Student ID:</span> {studentData.studentId}</p>
                    <p><span className="font-semibold">Batch:</span> {studentData.batchId}</p>
                    <p><span className="font-semibold">Course:</span> {latestEducation?.course || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Grid */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dashboardItems.map((item, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02 }} className="group">
                {item.type === "link" ? (
                  <Link to={item.link || "#"} className="block h-full">
                    <div className={`h-full p-8 rounded-2xl shadow-lg bg-gradient-to-br ${item.color} transition-all duration-300 transform group-hover:shadow-xl hover:from-opacity-90 hover:to-opacity-90`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-white bg-opacity-20 rounded-xl"><item.icon className="w-8 h-8 text-white" /></div>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>
                      <p className="text-white text-opacity-90 leading-relaxed">{item.description}</p>
                    </div>
                  </Link>
                ) : (
                  <button onClick={item.action} className="block h-full w-full text-left">
                    <div className={`h-full p-8 rounded-2xl shadow-lg bg-gradient-to-br ${item.color} transition-all duration-300 transform group-hover:shadow-xl hover:from-opacity-90 hover:to-opacity-90`}>
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-white bg-opacity-20 rounded-xl"><item.icon className="w-8 h-8 text-white" /></div>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>
                      <p className="text-white text-opacity-90 leading-relaxed">{item.description}</p>
                    </div>
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* QR Code Modal */}
        <Modal isOpen={isQRCodeModalOpen} onClose={() => setIsQRCodeModalOpen(false)} title="Your Attendance QR Code" size="sm">
          <div className="flex flex-col items-center justify-center p-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="p-6 border-4 border-blue-500 rounded-2xl shadow-lg mb-6 bg-white">
              <QRCode value={studentData.studentId} size={256} level="H" className="rounded-lg" />
            </motion.div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-800">{studentData.name}</p>
              <p className="text-lg text-gray-600">Student ID: <span className="font-mono font-bold">{studentData.studentId}</span></p>
              <p className="text-sm text-gray-500">Present this QR code for attendance marking</p>
            </div>
          </div>
        </Modal>

        {/* ID Card Modal */}
        <Modal isOpen={isIdCardModalOpen} onClose={() => setIsIdCardModalOpen(false)} title="Student ID Card" size="md">
          <div className="p-4 flex flex-col items-center">
            <div ref={idCardRef} className="mb-4">
                <StudentIDCard student={{
                    name: studentData.name,
                    studentId: studentData.studentId,
                    batchNumber: studentData.batchId,
                    email: studentData.email || 'Not Provided',
                    mobile: studentData.mobile || 'Not Provided',
                    photoUrl: studentData.photo || '/default-avatar.png',
                    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeValue)}`
                }} />
            </div>
            <button onClick={handleDownloadIDCard} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Download ID Card
            </button>
          </div>
        </Modal>
      </div>


      <StudentProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};

export default StudentDashboard;
