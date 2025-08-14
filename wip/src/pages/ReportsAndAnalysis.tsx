import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart2, Search, Download } from 'lucide-react';
import AdminDashboardButton from '../components/AdminDashboardButton';
import { useStudents } from '../context/StudentContext';
import * as XLSX from 'xlsx';

type ViewMode = 'batch' | 'student';

const ReportsAndAnalysisPage: React.FC = () => {
  const { students, batches } = useStudents();
  const [viewMode, setViewMode] = useState<ViewMode>('batch');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (viewMode === 'student' && searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(lowercasedQuery) ||
        s.studentId.toLowerCase().includes(lowercasedQuery) ||
        s.mobile.includes(searchQuery)
      );
    } else if (viewMode === 'batch' && selectedBatch) {
        filtered = filtered.filter(s => s.batchId === selectedBatch);
    }
    return filtered;
  }, [students, selectedBatch, searchQuery, viewMode]);

  const selectedStudent = useMemo(() => {
    if (viewMode === 'student' && filteredStudents.length > 0) {
        return filteredStudents[0];
    }
    return null;
  }, [filteredStudents, viewMode]);

  const studentPerformanceData = useMemo(() => {
    const studentToProcess = selectedStudentId ? students.find(s => s.id === selectedStudentId) : selectedStudent;
    if (!studentToProcess) return null;

    const attendance = studentToProcess.attendance || [];
    const marks = studentToProcess.marks || [];

    const monthAttendance = attendance.filter(a => {
      const recordDate = new Date(a.date);
      const recordMonth = recordDate.getFullYear() + '-' + String(recordDate.getMonth() + 1).padStart(2, '0');
      return recordMonth === selectedMonth;
    });
    const classesAttended = monthAttendance.filter(a => a.type === 'class' && a.present).length;
    const labsAttended = monthAttendance.filter(a => a.type === 'lab' && a.present).length;
    
    const monthMarks = marks.filter(m => {
      const markDate = new Date(m.date);
      const markMonth = markDate.getFullYear() + '-' + String(markDate.getMonth() + 1).padStart(2, '0');
      return markMonth === selectedMonth;
    });
    const examsAttended = monthMarks.filter(m => m.type === 'exam');
    const mocksAttended = monthMarks.filter(m => m.type === 'mock');
    const totalExams = examsAttended.length;
    const totalMocks = mocksAttended.length;
    const avgExamScore = totalExams > 0 ? examsAttended.reduce((acc, m) => acc + m.score, 0) / totalExams : 0;
    const avgMockScore = totalMocks > 0 ? mocksAttended.reduce((acc, m) => acc + m.score, 0) / totalMocks : 0;

    const batch = batches.find(b => b.id === studentToProcess.batchId);
    if (!batch) return null;

    const data = [
      { name: 'Classes', Attended: classesAttended, Conducted: batch.monthlyData?.[selectedMonth]?.classes || 0 },
      { name: 'Labs', Attended: labsAttended, Conducted: batch.monthlyData?.[selectedMonth]?.labs || 0 },
      { name: 'Exams', Attended: totalExams, Conducted: batch.monthlyData?.[selectedMonth]?.exams || 0, AvgScore: avgExamScore },
      { name: 'Mocks', Attended: totalMocks, Conducted: batch.monthlyData?.[selectedMonth]?.mocks || 0, AvgScore: avgMockScore },
    ];

    return {
      name: studentToProcess.name,
      studentId: studentToProcess.studentId,
      data,
    };
  }, [selectedStudent, selectedStudentId, selectedMonth, batches, students]);

  const batchChartData = useMemo(() => {
    if (!selectedBatch) return [];
    const batch = batches.find(b => b.id === selectedBatch);
    if (!batch) return [];
    return [
        { name: 'Classes', Conducted: batch.monthlyData?.[selectedMonth]?.classes || 0 },
        { name: 'Labs', Conducted: batch.monthlyData?.[selectedMonth]?.labs || 0 },
        { name: 'Exams', Conducted: batch.monthlyData?.[selectedMonth]?.exams || 0 },
        { name: 'Mocks', Conducted: batch.monthlyData?.[selectedMonth]?.mocks || 0 },
    ];
  }, [selectedBatch, batches]);

  const handleDownloadReport = () => {
    if (!studentPerformanceData) return;

    const wsData = [
      ["Performance Report for", studentPerformanceData.name],
      ["Student ID", studentPerformanceData.studentId],
      ["Month", selectedMonth],
      [],
      ["Category", "Attended", "Conducted", "Percentage"],
      ...studentPerformanceData.data.map(item => [
        item.name,
        item.Attended,
        item.Conducted,
        `${((item.Attended / (item.Conducted || 1)) * 100).toFixed(0)}%`
      ])
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Performance Report");
    XLSX.writeFile(wb, `${studentPerformanceData.name}_${selectedMonth}_performance.xlsx`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const renderBatchView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-xl shadow-lg mt-8">
      <h2 className="text-3xl font-bold text-center mb-6">
        Batch Report: <span className="text-blue-600">{batches.find(b => b.id === selectedBatch)?.batchNumber}</span>
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Conducted Sessions</h3>
              <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={batchChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Conducted" fill="#8884d8">
                          {batchChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
          <div>
              <h3 className="text-2xl font-semibold mb-4 text-center">Students</h3>
              <div className="h-[400px] overflow-y-auto border rounded-lg p-4">
                  <ul>
                      {filteredStudents.map(student => (
                          <li key={student.id} onClick={() => { setViewMode('student'); setSelectedStudentId(student.id); }} className="p-3 hover:bg-gray-100 cursor-pointer rounded-md">
                              <p className="font-semibold">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.studentId}</p>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      </div>
    </motion.div>
  );

  const renderStudentView = () => (
    studentPerformanceData && (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-xl shadow-lg mt-8">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">
          Performance Analysis for <span className="text-blue-600">{studentPerformanceData.name}</span>
          </h2>
          <button onClick={handleDownloadReport} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 flex items-center gap-2">
            <Download size={18} /> Download Report
          </button>
      </div>
      <p className="text-gray-500 mb-8">Student ID: {studentPerformanceData.studentId}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-center">Graphical View</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={studentPerformanceData.data} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={60} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Conducted" fill="#82ca9d" name="Conducted" />
              <Bar dataKey="Attended" fill="#8884d8" name="Attended" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-center">Numerical View</h3>
          <div className="space-y-4">
            {studentPerformanceData.data.map((item, index) => (
              <div key={index} className="p-4 rounded-lg" style={{ border: `2px solid ${COLORS[index]}`, backgroundColor: `${COLORS[index]}10`}}>
                <h4 className="text-lg font-bold" style={{ color: COLORS[index]}}>{item.name}</h4>
                <div className="flex justify-between items-center mt-2 text-xl">
                  <span className="font-semibold">Attended:</span>
                  <span className="font-bold">{item.Attended}</span>
                </div>
                <div className="flex justify-between items-center text-xl">
                  <span className="font-semibold">Conducted:</span>
                  <span className="font-bold">{item.Conducted}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
                  <div className="h-4 rounded-full flex items-center justify-center text-white font-bold" style={{ width: `${(item.Attended / (item.Conducted || 1)) * 100}%`, backgroundColor: COLORS[index] }}>
                    {((item.Attended / (item.Conducted || 1)) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
            <div className="p-4 rounded-lg" style={{ border: `2px solid #FF5733`, backgroundColor: `#FF573310`}}>
              <h4 className="text-lg font-bold" style={{ color: '#FF5733'}}>Total Exams & Mocks</h4>
              <div className="flex justify-between items-center mt-2 text-xl">
                <span className="font-semibold">Total Exams Attended:</span>
                <span className="font-bold">{studentPerformanceData.data.find(d => d.name === 'Exams')?.Attended || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="font-semibold">Average Exam Score:</span>
                <span className="font-bold">{studentPerformanceData.data.find(d => d.name === 'Exams')?.AvgScore?.toFixed(2) || 0}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-xl">
                <span className="font-semibold">Total Mocks Attended:</span>
                <span className="font-bold">{studentPerformanceData.data.find(d => d.name === 'Mocks')?.Attended || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="font-semibold">Average Mock Score:</span>
                <span className="font-bold">{studentPerformanceData.data.find(d => d.name === 'Mocks')?.AvgScore?.toFixed(2) || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
    )
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-100 to-gray-200 p-8">
      <AdminDashboardButton />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <BarChart2 className="w-16 h-16 mx-auto text-blue-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Reports & Analysis</h1>
        </div>

        <div className="flex justify-center mb-8">
            <div className="flex rounded-lg bg-gray-200 p-1">
                <button onClick={() => setViewMode('batch')} className={`px-6 py-2 rounded-lg ${viewMode === 'batch' ? 'bg-white shadow' : ''}`}>Batch View</button>
                <button onClick={() => setViewMode('student')} className={`px-6 py-2 rounded-lg ${viewMode === 'student' ? 'bg-white shadow' : ''}`}>Student View</button>
            </div>
        </div>

        <div className="mb-8 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow-md">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {viewMode === 'batch' ? (
            <select
              onChange={(e) => setSelectedBatch(e.target.value)}
              value={selectedBatch}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a Batch</option>
              {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
            </select>
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="Search Student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          )}
        </div>

        {viewMode === 'batch' && selectedBatch && renderBatchView()}
        {viewMode === 'student' && searchQuery && renderStudentView()}

      </motion.div>
    </div>
  );
};

export default ReportsAndAnalysisPage;