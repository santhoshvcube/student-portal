import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Mail, Eye } from 'lucide-react';
import AdminDashboardButton from '../components/AdminDashboardButton';
import { useStudents } from '../context/StudentContext';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const MonthlyReportsAdminPage: React.FC = () => {
  const { students, batches } = useStudents();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const batchReportData = useMemo(() => {
    if (!selectedBatch || !selectedMonth) return null;
    const batch = batches.find(b => b.id === selectedBatch);
    if (!batch) return null;

    const monthFilter = (item: { date: string }) => item.date.startsWith(selectedMonth);
    
    const studentsInBatch = students.filter(s => s.batchId === selectedBatch);
    const monthlyData = batch.monthlyData?.[selectedMonth] || {
      classes: 0,
      labs: 0,
      exams: 0,
      mocks: 0
    };

    const report = studentsInBatch.map(student => {
      const monthlyAttendance = student.attendance?.filter(monthFilter) || [];
      const classesAttended = monthlyAttendance.filter(a => a.type === 'class' && a.present).length;
      const labsAttended = monthlyAttendance.filter(a => a.type === 'lab' && a.present).length;
      const classAttendancePercentage = monthlyData.classes ? (classesAttended / monthlyData.classes) * 100 : 0;
      const labAttendancePercentage = monthlyData.labs ? (labsAttended / monthlyData.labs) * 100 : 0;

      const examMarks = student.marks?.filter(m => m.type === 'exam' && monthFilter(m)) || [];
      const mockMarks = student.marks?.filter(m => m.type === 'mock' && monthFilter(m)) || [];
      const totalExamMarks = examMarks.reduce((sum, m) => sum + m.score, 0);
      const totalMockMarks = mockMarks.reduce((sum, m) => sum + m.score, 0);

      return {
        name: student.name,
        email: student.email,
        classAttendance: `${classAttendancePercentage.toFixed(2)}%`,
        labAttendance: `${labAttendancePercentage.toFixed(2)}%`,
        totalExamMarks,
        totalMockMarks,
        projectsCompleted: 0,
        remarks: "Good progress",
      };
    });

    return {
      batchNumber: batch.batchNumber,
      month: selectedMonth,
      classesConducted: monthlyData.classes,
      labsConducted: monthlyData.labs,
      examsConducted: monthlyData.exams,
      mocksConducted: monthlyData.mocks,
      report,
    };
  }, [selectedBatch, selectedMonth, students, batches]);

  
    const handleSendEmail = async () => {
      if (!batchReportData) return;
  
      const loadingToast = toast.loading(`Sending reports for ${batchReportData.batchNumber} - ${batchReportData.month}...`);
  
      try {
        // Simulate sending emails by logging to the console
        console.log('Simulating sending emails:');
        batchReportData.report.forEach(async (student) => {
          console.log(`To: ${student.email}`);
          console.log(`Subject: Monthly Performance Report - ${batchReportData.month}`);
          console.log(`Body: (Report data for ${student.name})`);
          // In a real app, you would send the email here using an email API.
          // The sendEmail function would use an email service like SendGrid or Mailgun to send the emails.
          // Due to the lack of access to an email API, this functionality is currently simulated by logging to the console.
          // await sendEmail(student.email, `Monthly Performance Report - ${batchReportData.month}`, `(Report data for ${student.name})`);
        });

        toast.success(`Simulated sending ${batchReportData.report.length} reports successfully!`, { id: loadingToast });
      } catch (error) {
        toast.error('Failed to simulate sending reports', { id: loadingToast });
      } finally {
        setIsPreviewModalOpen(false);
      }
    };
  return (
    <>
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-teal-50 to-cyan-100 p-8">
        <AdminDashboardButton />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <BarChart3 className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h1 className="text-4xl font-bold text-gray-800">Email Monthly Reports</h1>
            <p className="text-lg text-gray-600">Preview and send monthly reports to students.</p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Month & Year
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Batch
                </label>
                <select
                  onChange={e => setSelectedBatch(e.target.value)}
                  value={selectedBatch}
                  className="w-full p-3 border rounded-lg"
                  disabled={!selectedMonth}
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => setIsPreviewModalOpen(true)}
              disabled={!selectedBatch}
              className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              <Eye size={18} /> Preview Report
            </button>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Report for ${batchReportData?.batchNumber} - ${batchReportData?.month}`}
      >
        {batchReportData && (
          <div className="p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Class Att.</th>
                  <th className="p-2 text-left">Lab Att.</th>
                  <th className="p-2 text-left">Exam Marks</th>
                  <th className="p-2 text-left">Mock Marks</th>
                  <th className="p-2 text-left">Projects</th>
                  <th className="p-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {batchReportData.report.map((studentData, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{studentData.name}</td>
                    <td className="p-2">{studentData.email}</td>
                    <td className="p-2">{studentData.classAttendance}</td>
                    <td className="p-2">{studentData.labAttendance}</td>
                    <td className="p-2">{studentData.totalExamMarks}</td>
                    <td className="p-2">{studentData.totalMockMarks}</td>
                    <td className="p-2">{studentData.projectsCompleted}</td>
                    <td className="p-2">{studentData.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p><strong>Classes Conducted:</strong> {batchReportData.classesConducted}</p>
                <p><strong>Labs Conducted:</strong> {batchReportData.labsConducted}</p>
              </div>
              <div>
                <p><strong>Exams Conducted:</strong> {batchReportData.examsConducted}</p>
                <p><strong>Mocks Conducted:</strong> {batchReportData.mocksConducted}</p>
              </div>
            </div>
            <button onClick={handleSendEmail} className="w-full mt-6 bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2">
              <Mail size={18} /> Send Email
            </button>
          </div>
        )}
      </Modal>
    </>
  );
};

export default MonthlyReportsAdminPage;
