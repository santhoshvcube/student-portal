import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Award, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../auth/AuthContext';

const ViewMarksHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { students } = useStudents();
  const [selectedMonth, setSelectedMonth] = useState('');

  const student = students.find(s => s.id === user?.id);

  const marks = useMemo(() => {
    if (!student) return [];
    if (!selectedMonth) return student.marks || [];
    return (student.marks || []).filter(m => m.date?.startsWith(selectedMonth));
  }, [student, selectedMonth]);

  const downloadCSV = () => {
    if (!student) return;
    const header = ['exam','type','score','date'];
    const rows = marks.map(m => `${JSON.stringify(m.exam)},${JSON.stringify(m.type)},${JSON.stringify(m.score)},${JSON.stringify(m.date)}`);
    const csv = [header.join(',')].concat(rows).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g,'_')}_marks${selectedMonth ? `_${selectedMonth}` : ''}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tableRef = useRef<HTMLDivElement | null>(null);
  const downloadPDF = async () => {
    if (!tableRef.current) return;
    try {
      const canvas = await html2canvas(tableRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${student?.name?.replace(/\s+/g, '_')}_marks${selectedMonth ? `_${selectedMonth}` : ''}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Failed to generate PDF.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-rose-50 to-pink-100 p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Marks History</h1>
              <p className="text-gray-600">View your examination results and academic progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 border rounded" />
            <button onClick={downloadCSV} className="bg-green-500 text-white p-2 rounded flex items-center gap-2"><Download /> Download</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Marks</h2>
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border">Exam</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Score</th>
                  <th className="p-2 border">Date</th>
                </tr>
              </thead>
              <tbody>
                {(!marks || marks.length === 0) && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No marks found.</td></tr>}
                {marks.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{m.exam}</td>
                    <td className="p-2 border">{m.type}</td>
                    <td className="p-2 border">{m.score}</td>
                    <td className="p-2 border">{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ViewMarksHistoryPage;
