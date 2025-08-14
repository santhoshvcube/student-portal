import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Users, Calendar, BookOpen, Target, BarChart2 } from 'lucide-react';
import AdminDashboardButton from '../components/AdminDashboardButton';
import { useStudents } from '../context/StudentContext';

const ReportsPage: React.FC = () => {
  const { students, batches } = useStudents();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (batches.length > 0 && !selectedBatch) {
      setSelectedBatch(batches[0].id);
    }
  }, [batches, selectedBatch]);

  const filteredStudents = useMemo(() => {
    let filtered = students;
    if (selectedBatch) {
      filtered = filtered.filter(s => s.batchId === selectedBatch);
    }
    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobile.includes(searchQuery)
      );
    }
    return filtered;
  }, [students, selectedBatch, searchQuery]);

  const selectedStudent = useMemo(() => {
    if (searchQuery && filteredStudents.length === 1) {
      return filteredStudents[0];
    }
    return null;
  }, [filteredStudents, searchQuery]);

  const studentPerformanceData = useMemo(() => {
    if (!selectedStudent) return null;

    const monthAttendance = selectedStudent.attendance?.filter(a => a.date.startsWith(selectedMonth)) || [];
    const classesAttended = monthAttendance.filter(a => a.type === 'class' && a.present).length;
    const labsAttended = monthAttendance.filter(a => a.type === 'lab' && a.present).length;
    
    const monthMarks = selectedStudent.marks?.filter(m => m.date.startsWith(selectedMonth)) || [];
    const examsAttended = monthMarks.filter(m => m.type === 'exam').length;
    const mocksAttended = monthMarks.filter(m => m.type === 'mock').length;

    const batch = batches.find(b => b.id === selectedStudent.batchId);
    if (!batch) return null;

    const data = [
      { name: 'Classes', Attended: classesAttended, Conducted: batch.monthlyData?.[selectedMonth]?.classes || 0 },
      { name: 'Labs', Attended: labsAttended, Conducted: batch.monthlyData?.[selectedMonth]?.labs || 0 },
      { name: 'Exams', Attended: examsAttended, Conducted: batch.monthlyData?.[selectedMonth]?.exams || 0 },
      { name: 'Mocks', Attended: mocksAttended, Conducted: batch.monthlyData?.[selectedMonth]?.mocks || 0 },
    ];

    return {
      name: selectedStudent.name,
      studentId: selectedStudent.studentId,
      data,
    };
  }, [selectedStudent, selectedMonth, batches]);

  const batchData = useMemo(() => {
    if (!selectedBatch) return null;
    const batchStudents = students.filter(s => s.batchId === selectedBatch);
    if (batchStudents.length === 0) return { totalStudents: 0, averageAttendance: 0, averageExamScore: 0, averageMockScore: 0 };

    const totalStudents = batchStudents.length;
    
    const monthFilter = (item: { date: string }) => item.date.startsWith(selectedMonth);

    const totalAttendance = batchStudents.reduce((acc, s) => acc + (s.attendance?.filter(monthFilter).length || 0), 0);
    const presentAttendance = batchStudents.reduce((acc, s) => acc + (s.attendance?.filter(a => a.present && monthFilter(a)).length || 0), 0);
    const averageAttendance = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

    const examMarks = batchStudents.flatMap(s => s.marks?.filter(m => m.type === 'exam' && monthFilter(m)) || []);
    const averageExamScore = examMarks.length > 0 ? examMarks.reduce((acc, m) => acc + m.score, 0) / examMarks.length : 0;

    const mockMarks = batchStudents.flatMap(s => s.marks?.filter(m => m.type === 'mock' && monthFilter(m)) || []);
    const averageMockScore = mockMarks.length > 0 ? mockMarks.reduce((acc, m) => acc + m.score, 0) / mockMarks.length : 0;

    return {
      totalStudents,
      averageAttendance,
      averageExamScore,
      averageMockScore,
    };
  }, [selectedBatch, selectedMonth, students]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-200 p-8">
      <AdminDashboardButton />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        <div className="text-center mb-8">
          <BarChart2 className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reports & Analysis</h1>
          <p className="text-xl text-blue-700 font-semibold">
            Select a month and batch to view batch performance, or search for a student to see their detailed analysis.
          </p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setSearchQuery('');
            }}
            value={selectedBatch}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
          </select>
          <input
            type="text"
            placeholder="Search Student by Name/ID/Mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!selectedBatch}
          />
        </div>

        {studentPerformanceData ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-2">
              Performance Analysis for <span className="text-blue-600">{studentPerformanceData.name}</span>
            </h2>
            <p className="text-center text-gray-500 mb-8">Student ID: {studentPerformanceData.studentId}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-center">Graphical View</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={studentPerformanceData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
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
                    <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: `${COLORS[index]}20`}}>
                      <h4 className="text-lg font-bold" style={{ color: COLORS[index]}}>{item.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="font-semibold">Attended:</span>
                        <span className="text-2xl font-bold">{item.Attended}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Conducted:</span>
                        <span className="text-2xl font-bold">{item.Conducted}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="h-2.5 rounded-full" style={{ width: `${(item.Attended / item.Conducted) * 100}%`, backgroundColor: COLORS[index] }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : batchData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-6">
              Batch Performance: <span className="text-blue-600">{batches.find(b => b.id === selectedBatch)?.batchNumber}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="bg-blue-100 p-6 rounded-lg">
                <Users className="w-10 h-10 mx-auto text-blue-500 mb-2" />
                <p className="text-3xl font-bold">{batchData.totalStudents}</p>
                <p className="text-gray-600">Total Students</p>
              </div>
              <div className="bg-green-100 p-6 rounded-lg">
                <Calendar className="w-10 h-10 mx-auto text-green-500 mb-2" />
                <p className="text-3xl font-bold">{batchData.averageAttendance.toFixed(1)}%</p>
                <p className="text-gray-600">Avg. Attendance</p>
              </div>
              <div className="bg-yellow-100 p-6 rounded-lg">
                <BookOpen className="w-10 h-10 mx-auto text-yellow-500 mb-2" />
                <p className="text-3xl font-bold">{batchData.averageExamScore.toFixed(2)}</p>
                <p className="text-gray-600">Avg. Exam Score</p>
              </div>
              <div className="bg-purple-100 p-6 rounded-lg">
                <Target className="w-10 h-10 mx-auto text-purple-500 mb-2" />
                <p className="text-3xl font-bold">{batchData.averageMockScore.toFixed(2)}</p>
                <p className="text-gray-600">Avg. Mock Score</p>
              </div>
            </div>
            <div className="mt-8">
                <h3 className="text-2xl font-bold text-center mb-4">Student List</h3>
                <ul className="divide-y divide-gray-200">
                    {filteredStudents.map(student => (
                        <li key={student.id} className="py-3 px-2 hover:bg-gray-50 rounded-md">
                            <p className="font-semibold">{student.name} <span className="font-normal text-gray-500">({student.studentId})</span></p>
                        </li>
                    ))}
                </ul>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ReportsPage;