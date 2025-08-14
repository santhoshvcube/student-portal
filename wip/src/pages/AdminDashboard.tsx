import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/AnimatedButton';
import { useStudents } from '../context/StudentContext';
import { 
  Users, 
  Calendar, 
  Upload, 
  QrCode, 
  BarChart3, 
  Mail, 
  FileText,
  GraduationCap,
  Home 
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const { students, batches } = useStudents();
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [previewData, setPreviewData] = useState<any>(null);
  const navigate = useNavigate();

  // Get unique batches and their counts
  const batchOptions = React.useMemo(() => {
    return batches.map(batch => ({
      batch: batch.id,
      count: students.filter(s => s.batchId === batch.id).length,
      batchNumber: batch.batchNumber
    })).sort((a, b) => a.batchNumber.localeCompare(b.batchNumber));
  }, [batches, students]);

  const handleEmailReports = async () => {
    if (!selectedBatch || !selectedMonth) {
      toast.error('Please select both batch and month');
      return;
    }

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 3000)),
      {
        loading: `Sending monthly reports for ${selectedBatch}...`,
        success: `Monthly reports sent to all students in ${selectedBatch}!`,
        error: 'Failed to send reports.',
      }
    );
  };

  const handlePreview = () => {
    if (!selectedBatch || !selectedMonth) {
      toast.error('Please select both batch and month');
      return;
    }

    const student = students.find(s => s.batchId === selectedBatch);
    if (!student) {
      toast.error('No students found in the selected batch.');
      return;
    }

    const monthIndex = new Date(Date.parse(selectedMonth +" 1, 2012")).getMonth();

    const classAttendance = student.attendance?.filter(a => a.type === 'class' && new Date(a.date).getMonth() === monthIndex) || [];
    const labAttendance = student.attendance?.filter(a => a.type === 'lab' && new Date(a.date).getMonth() === monthIndex) || [];
    const exams = student.marks?.filter(m => new Date().getMonth() === monthIndex) || []; // Simplified for demo

    setPreviewData({
      name: student.name,
      email: student.email,
      batch: batches.find(b => b.id === student.batchId)?.batchNumber,
      month: selectedMonth,
      classAttendance: (classAttendance.filter(a => a.present).length / classAttendance.length * 100 || 0).toFixed(0),
      classConducted: classAttendance.length,
      labAttendance: (labAttendance.filter(a => a.present).length / labAttendance.length * 100 || 0).toFixed(0),
      labConducted: labAttendance.length,
      totalExamMarks: exams.reduce((acc, e) => acc + e.score, 0),
      totalExamConducted: exams.length,
      totalMockMarks: 0, // Simplified
      totalMockConducted: 0, // Simplified
      totalProjectsCompleted: 0, // Simplified
      remarks: 'Good progress', // Simplified
    });

    setShowPreview(true);
  };

  const dashboardItems = [
    {
      title: "Student Management",
      description: "Add, edit, and manage student accounts",
      icon: Users,
      link: "/manage-students",
      color: "from-blue-500 to-blue-600",
      hoverColor: "from-blue-600 to-blue-700"
    },
    {
      title: "Batch Management",
      description: "Create and organize student batches",
      icon: GraduationCap,
      link: "/batches",
      color: "from-emerald-500 to-emerald-600",
      hoverColor: "from-emerald-600 to-emerald-700"
    },
    {
      title: "Marks & Online Attendance Upload ",
      description: "Upload and manage student examination marks",
      icon: Upload,
      link: "/upload-marks",
      color: "from-yellow-500 to-orange-500",
      hoverColor: "from-yellow-600 to-orange-600"
    },
    {
      title: "QR Scanner",
      description: "Scan student QR codes for attendance",
      icon: QrCode,
      link: "/scanner",
      color: "from-pink-500 to-purple-500",
      hoverColor: "from-pink-600 to-purple-600"
    },
    {
      title: "Reports & Analytics",
      description: "Generate comprehensive reports",
      icon: BarChart3,
      link: "/reports-analysis",
      color: "from-cyan-500 to-blue-500",
      hoverColor: "from-cyan-600 to-blue-600"
    },
    {
      title: "Resume Review",
      description: "Review and approve student resumes",
      icon: FileText,
      link: "/resume-review",
      color: "from-indigo-500 to-purple-500",
      hoverColor: "from-indigo-600 to-purple-600"
    },
    {
      title: "AI Resume Reviewer",
      description: "Get an ATS-optimized review of a resume",
      icon: FileText,
      link: "/resume-reviewer",
      color: "from-pink-500 to-red-500",
      hoverColor: "from-pink-600 to-red-600"
    },
    {
      title: "Interview Reports",
      description: "View and analyze student mock interview performance",
      icon: BarChart3,
      link: "/interview-reports",
      color: "from-teal-500 to-cyan-500",
      hoverColor: "from-teal-600 to-cyan-600"
    },
    {
      title: "Resume Reviews",
      description: "View and analyze student resume reviews",
      icon: FileText,
      link: "/resume-reviews",
      color: "from-rose-500 to-pink-500",
      hoverColor: "from-rose-600 to-pink-600"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-orange-100 via-white to-orange-200 p-8 relative transition-colors duration-700">
      {/* Home Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => navigate('/')}
        className="fixed top-4 right-4 z-20 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Home className="w-6 h-6 text-orange-500" />
      </motion.button>

      {/* VCube Logo at top left */}
      <img
        src="/vcubelogo.png"
        alt="VCube Logo"
        className="absolute top-8 left-8 h-20 w-auto rounded-2xl shadow-lg z-10 transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
      />
      {/* AWS Logo at top right */}
      <img
        src="/aws.png"
        alt="AWS Logo"
        className="absolute top-8 right-8 h-20 w-auto rounded-2xl shadow-lg z-10 transition-transform duration-300 hover:scale-110 hover:shadow-2xl"
      />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="mb-12 text-center">
          <h1
            className="text-5xl font-bold mb-4 bg-gradient-to-r from-black via-orange-500 to-orange-400 bg-clip-text text-transparent transition-all duration-500 hover:from-orange-500 hover:via-black hover:to-orange-400 hover:scale-105 cursor-pointer"
            style={{
              backgroundSize: '200% 200%',
              transition: 'background 0.5s, transform 0.5s',
            }}
          >
            Admin Dashboard
          </h1>
          <p className="text-xl text-gray-600">Manage your institution with powerful tools</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {dashboardItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Link
                to={item.link}
                className="block h-full"
              >
                <div className={`
                  h-full p-8 rounded-2xl shadow-lg bg-gradient-to-br ${item.color} 
                  hover:${item.hoverColor} transition-all duration-300 
                  transform group-hover:shadow-xl
                `}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                      <item.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>
                  <p className="text-white text-opacity-90 leading-relaxed">{item.description}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Email Reports Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Mail className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Email Monthly Reports</h2>
                <p className="text-gray-600">Send comprehensive reports to all students instantly</p>
                {/* Batch and Month Selection */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                  >
                    <option value="" disabled>Select Batch</option>
                    {batchOptions.map(({ batch, count, batchNumber }) => (
                      <option key={batch} value={batch}>
                        {batchNumber} ({count} students)
                      </option>
                    ))}
                  </select>
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    <option value="" disabled>Select Month</option>
                    <option value="jan">January</option>
                    <option value="feb">February</option>
                    <option value="mar">March</option>
                    <option value="apr">April</option>
                    <option value="may">May</option>
                    <option value="jun">June</option>
                    <option value="jul">July</option>
                    <option value="aug">August</option>
                    <option value="sep">September</option>
                    <option value="oct">October</option>
                    <option value="nov">November</option>
                    <option value="dec">December</option>
                  </select>
                  {/* Preview Report Button */}
                  <button
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition duration-300"
                    type="button"
                    onClick={handlePreview}
                  >
                    Preview Report
                  </button>
                </div>
              </div>
            </div>
           
          </div>
        </motion.div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full relative">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Report Preview</h3>
              <div className="mb-6 text-gray-700">
                <p className="mb-2 font-semibold">The following student details will be sent:</p>
                <ul className="mb-4 list-disc list-inside text-base">
                  <li><span className="font-medium">Name:</span> {previewData.name}</li>
                  <li><span className="font-medium">Email:</span> {previewData.email}</li>
                  <li><span className="font-medium">Batch:</span> {previewData.batch}</li>
                  <li><span className="font-medium">Month:</span> {previewData.month}</li>
                  <li><span className="font-medium">Class Attendance:</span> {previewData.classAttendance}%</li>
                  <li><span className="font-medium">Class Conducted:</span> {previewData.classConducted}</li>
                  <li><span className="font-medium">Lab Attendance:</span> {previewData.labAttendance}%</li>
                  <li><span className="font-medium">Lab Conducted:</span> {previewData.labConducted}</li>
                  <li><span className="font-medium">Total Exam Marks:</span> {previewData.totalExamMarks}</li>
                  <li><span className="font-medium">Total Exam Conducted:</span> {previewData.totalExamConducted}</li>
                  <li><span className="font-medium">Total Mock Marks:</span> {previewData.totalMockMarks}</li>
                  <li><span className="font-medium">Total Mock Conducted:</span> {previewData.totalMockConducted}</li>
                  <li><span className="font-medium">Total Projects Completed:</span> {previewData.totalProjectsCompleted}</li>
                  <li><span className="font-medium">Remarks:</span> {previewData.remarks}</li>
                </ul>
                <p className="text-sm text-gray-500">*This is a sample preview. Actual data will be based on your selection.</p>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  onClick={() => setShowPreview(false)}
                >
                  Close
                </button>
                <button
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold shadow-md hover:bg-orange-600 transition"
                  onClick={() => {
                    setShowPreview(false);
                    handleEmailReports();
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
