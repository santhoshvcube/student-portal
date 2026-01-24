import React, { useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BarChart3, Clock, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useStudents } from '../context/StudentContext';
import { useAuth } from '../auth/AuthContext';

const ViewAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { students } = useStudents();
  const [selectedMonth, setSelectedMonth] = useState('');

  const student = students.find(s => s.id === user?.id);

  const records = useMemo(() => {
    if (!student) return [];
    if (!selectedMonth) return student.attendance || [];
    // selectedMonth is yyyy-MM
    return (student.attendance || []).filter(r => r.date?.startsWith(selectedMonth));
  }, [student, selectedMonth]);

  const downloadCSV = () => {
    if (!student) return;
    const rows = records.map(r => ({ date: r.date, type: r.type, present: r.present ? 'yes' : 'no', inTime: r.inTime || '', outTime: r.outTime || '' }));
    const header = ['date','type','present','inTime','outTime'];
    const csv = [header.join(',')].concat(rows.map(r => header.map(h => JSON.stringify((r as any)[h] ?? '')).join(','))).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.name.replace(/\s+/g,'_')}_attendance${selectedMonth ? `_${selectedMonth}` : ''}.csv`;
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
      pdf.save(`${student?.name?.replace(/\s+/g, '_')}_attendance${selectedMonth ? `_${selectedMonth}` : ''}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('Failed to generate PDF.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-teal-50 to-blue-100 p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Attendance Records</h1>
              <p className="text-gray-600">Track your attendance across classes and sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="p-2 border rounded" />
            <button onClick={downloadCSV} className="bg-green-500 text-white p-2 rounded flex items-center gap-2"><Download /> Download</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Records {selectedMonth ? `( ${selectedMonth} )` : ''}</h2>
          <div className="overflow-x-auto" ref={tableRef}>
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Present</th>
                  <th className="p-2 border">In Time</th>
                  <th className="p-2 border">Out Time</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-gray-500">No records found.</td></tr>}
                {records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="p-2 border">{r.date}</td>
                    <td className="p-2 border">{r.type}</td>
                    <td className="p-2 border">{r.present ? 'Yes' : 'No'}</td>
                    <td className="p-2 border">{r.inTime || '-'}</td>
                    <td className="p-2 border">{r.outTime || '-'}</td>
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

export default ViewAttendancePage;
