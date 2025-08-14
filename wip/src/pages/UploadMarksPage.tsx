import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, UserPlus, Eye, Download, Edit, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useStudents } from '../context/StudentContext';
import AdminDashboardButton from '../components/AdminDashboardButton';

type Mark = {
  id: string;
  studentId: string;
  exam: string;
  score: number;
  type: 'exam' | 'mock';
  date: string;
};

const UploadMarksPage: React.FC = () => {
  const { students, batches, refreshData } = useStudents();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [markType, setMarkType] = useState<'exam' | 'mock'>('exam');
  const [examName, setExamName] = useState('');
  const [score, setScore] = useState('');
  const [examDate, setExamDate] = useState('');
  const [editingMark, setEditingMark] = useState<Mark | null>(null);
  const [activeTab, setActiveTab] = useState<'marks' | 'attendance'>('marks');
  const [selectedBatchAttendance, setSelectedBatchAttendance] = useState('');
  const [selectedMonthAttendance, setSelectedMonthAttendance] = useState('');
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [attendancePreviewData, setAttendancePreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarks, setSelectedMarks] = useState<string[]>([]);
  const API_URL = '/api';

  const fetchMarks = async () => {
    try {
      const res = await fetch(`${API_URL}/marks`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setMarks(data);
    } catch (error) {
      console.error('Failed to fetch marks:', error);
    }
  };

  useEffect(() => {
    fetchMarks();
  }, []);

  const studentsInBatch = useMemo(() => {
    return selectedBatch ? students.filter(s => s.batchId === selectedBatch) : [];
  }, [selectedBatch, students]);

  const handleAddOrUpdateMark = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const markData = {
      studentId: selectedStudent,
      exam: examName,
      score: parseFloat(score),
      type: markType,
      date: examDate,
    };

    try {
      let response;
      if (editingMark) {
        response = await fetch(`${API_URL}/marks/${editingMark.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(markData),
        });
      } else {
        response = await fetch(`${API_URL}/marks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...markData, id: `MARK-${Date.now()}` }),
        });
      }

      if (response.ok) {
        fetchMarks();
        refreshData();
        if (editingMark) {
          setEditingMark(null);
        }
      } else if (response.status === 409) {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      } else {
        console.error('Failed to save mark:', response.statusText);
        alert('Failed to save mark. Please try again.');
      }
    } catch (error) {
      console.error('Failed to save mark:', error);
      alert('An error occurred while saving the mark.');
    } finally {
      setIsLoading(false);
    }
    // Reset form
    setSelectedStudent('');
    setExamName('');
    setScore('');
    setExamDate('');
    setMarkType('exam');
  };

  const handleEdit = (mark: Mark) => {
    setEditingMark(mark);
    const student = students.find(s => marks?.some(m => m.id === mark.id));
    if (student) {
      setSelectedBatch(student.batchId);
      setSelectedStudent(student.id);
      setExamName(mark.exam);
      setScore(String(mark.score));
      setExamDate(mark.date);
      setMarkType(mark.type);
    }
  };

  const handleDelete = async (markId: string) => {
    if (window.confirm('Are you sure you want to delete this mark?')) {
      try {
        await fetch(`${API_URL}/marks/${markId}`, { method: 'DELETE' });
        fetchMarks();
        refreshData();
      } catch (error) {
        console.error('Failed to delete mark:', error);
      }
    }
  };

  const handleSelectMark = (markId: string) => {
    setSelectedMarks(prev =>
      prev.includes(markId) ? prev.filter(id => id !== markId) : [...prev, markId]
    );
  };

  const handleSelectAllMarks = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMarks(allMarks.map(m => m.id));
    } else {
      setSelectedMarks([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedMarks.length} selected marks?`)) {
      setIsLoading(true);
      try {
        await Promise.all(selectedMarks.map(id => fetch(`${API_URL}/marks/${id}`, { method: 'DELETE' })));
        fetchMarks();
        refreshData();
        setSelectedMarks([]);
      } catch (error) {
        console.error('Failed to delete selected marks:', error);
        alert('An error occurred while deleting marks.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAttendanceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttendancePreviewData([]);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
          setAttendancePreviewData(json);
        } catch (error) {
          console.error("Error processing attendance file:", error);
          alert("Failed to process the attendance file. Please check the file format.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDownloadAttendanceTemplate = () => {
    const headers = [['student name', 'date', 'type (class/lab)', 'present (yes/no)', 'inTime (optional)', 'outTime (optional)']];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Template');
    XLSX.writeFile(workbook, 'attendance_upload_template.xlsx');
  };

  const handleSubmitAttendanceUpload = async () => {
    if (isLoading) return;
    if (!selectedBatchAttendance || !selectedMonthAttendance) {
      alert('Please select a batch and a month for the attendance upload.');
      return;
    }
    setIsLoading(true);

    const studentMap = new Map(students.map(s => [`${s.name.toLowerCase().trim()}-${s.batchId}`, s.id]));

    const attendancePayload = attendancePreviewData.map(row => {
      const studentName = row['student name']?.toString().toLowerCase().trim();
      const studentId = studentMap.get(`${studentName}-${selectedBatchAttendance}`);

      return {
        studentId: studentId,
        date: row['date'],
        type: row['type (class/lab)'],
        present: row['present (yes/no)'].toLowerCase() === 'yes',
        inTime: row['inTime (optional)'],
        outTime: row['outTime (optional)'],
      };
    }).filter(item => item.studentId);

    if (attendancePayload.length === 0) {
      alert('No valid attendance data to submit. Please check the file content and format.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/attendance/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatchAttendance,
          month: selectedMonthAttendance,
          attendanceData: attendancePayload,
        }),
      });

      if (response.ok) {
        alert('Attendance uploaded successfully!');
        setAttendancePreviewData([]);
        refreshData();
      } else {
        const errorData = await response.json();
        alert(`Failed to upload attendance: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('An error occurred while submitting attendance data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewData([]); // Clear previous preview
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<any>(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });
          setPreviewData(json);
        } catch (error) {
          console.error("Error processing file:", error);
          alert("Failed to process the file. Please check the file format.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleSubmitBulkUpload = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const batchMap = new Map(batches.map(b => [b.batchNumber.toLowerCase().trim(), b.id]));
    const studentNameToIdMap = new Map(students.map(s => [`${s.name.toLowerCase().trim()}-${s.batchId}`, s.id]));
    const studentIdToIdMap = new Map(students.map(s => [s.studentId, s.id]));

    const marksPayload = previewData.map(row => {
      const batchNumber = (row['batch number'] || row['batch id'])?.toString().toLowerCase().trim();
      const studentIdentifier = (row['student name or id'] || row['student name'] || row['student id'])?.toString().trim();
      
      let batchId = batchMap.get(batchNumber);
      if (!batchId) {
        const batch = batches.find(b => b.id.toLowerCase() === batchNumber);
        if (batch) {
          batchId = batch.id;
        }
      }

      let studentId;
      // Try to find by student ID first
      studentId = studentIdToIdMap.get(studentIdentifier);

      // If not found, try by name in batch
      if (!studentId && batchId) {
        studentId = studentNameToIdMap.get(`${studentIdentifier.toLowerCase()}-${batchId}`);
      }

      const type = row['exam /mock']?.toString().toLowerCase().trim();
      const scoreValue = parseFloat(row['score']);
      const dateValue = row['date'];
      const examNameValue = row['exam name']?.toString().trim();

      if (batchId && studentId && (type === 'exam' || type === 'mock') && !isNaN(scoreValue) && dateValue && examNameValue) {
        return {
          id: `MARK-${Date.now()}-${Math.random()}`,
          studentId,
          batchId,
          type,
          exam: examNameValue,
          score: scoreValue,
          date: dateValue,
        };
      }
      return null;
    }).filter(Boolean);

    if (marksPayload.length === 0) {
      alert('No valid marks to submit. Please check the file content and format.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/marks/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(marksPayload),
      });

      if (response.ok) {
        alert('Bulk marks submitted successfully!');
        setPreviewData([]);
        fetchMarks();
        refreshData();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Invalid JSON response from server.' }));
        alert(`Failed to submit bulk marks: ${errorData.message || 'Unknown server error'}`);
      }
    } catch (error) {
      console.error('Error submitting bulk marks:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred.';
      alert(`An error occurred while submitting bulk marks: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [['batch number', 'student name or id', 'exam /mock', 'exam name', 'score', 'date']];
    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks Template');
    XLSX.writeFile(workbook, 'marks_upload_template.xlsx');
  };

  const handleDownload = () => {
    if (!selectedBatch) {
      alert('Please select a batch to download.');
      return;
    }
    const batch = batches.find(b => b.id === selectedBatch);
    if (!batch) return;

    const dataToExport = students
      .filter(s => s.batchId === selectedBatch)
      .flatMap(student =>
        (student.marks || []).map(mark => ({
          'Batch Number': batch.batchNumber,
          'Student Name': student.name,
          'Type': mark.type,
          'Exam Name': mark.exam,
          'Score': mark.score,
          'Date': mark.date,
        }))
      );

    if (dataToExport.length === 0) {
      alert('No marks found for this batch.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Marks');
    XLSX.writeFile(workbook, `${batch.batchNumber}-marks.xlsx`);
  };

  const allMarks = useMemo(() => {
    return marks.map(mark => {
      const student = students.find(s => s.id === mark.studentId);
      return {
        ...mark,
        studentName: student?.name || 'N/A',
        batchNumber: batches.find(b => b.id === student?.batchId)?.batchNumber || 'N/A',
      };
    });
  }, [students, batches]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <AdminDashboardButton />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-center mb-8">Upload Student Marks & Online Attendance</h1>

        <div className="tabs flex mb-4">
          <button
            className={`tab px-4 py-2 font-medium ${activeTab === 'marks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('marks')}
          >
            Marks Upload
          </button>
          <button
            className={`tab px-4 py-2 font-medium ${activeTab === 'attendance' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab('attendance')}
          >
            Online Attendance Upload
          </button>
        </div>

        {activeTab === 'marks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Single Entry */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><UserPlus className="mr-2" />{editingMark ? 'Edit Mark' : 'Single Entry'}</h2>
              <div className="space-y-4">
                <select onChange={e => setSelectedBatch(e.target.value)} value={selectedBatch} className="w-full p-2 border rounded">
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
                </select>
                <select onChange={e => setSelectedStudent(e.target.value)} value={selectedStudent} className="w-full p-2 border rounded" disabled={!selectedBatch}>
                  <option value="">Select Student</option>
                  {studentsInBatch.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select onChange={e => setMarkType(e.target.value as any)} value={markType} className="w-full p-2 border rounded">
                  <option value="exam">Exam</option>
                  <option value="mock">Mock</option>
                </select>
                <input type="text" placeholder="Exam/Mock Name" value={examName} onChange={e => setExamName(e.target.value)} className="w-full p-2 border rounded" />
                <input type="number" placeholder="Score" value={score} onChange={e => setScore(e.target.value)} className="w-full p-2 border rounded" />
                <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="w-full p-2 border rounded" />
                <button onClick={handleAddOrUpdateMark} disabled={isLoading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400">{isLoading ? 'Submitting...' : editingMark ? 'Update Mark' : 'Add Mark'}</button>
                {editingMark && <button onClick={() => setEditingMark(null)} className="w-full bg-gray-300 text-black p-2 rounded mt-2">Cancel Edit</button>}
              </div>
            </div>

            {/* Bulk Upload & Download */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 flex items-center"><Upload className="mr-2" />Bulk Upload</h2>
              <p className="text-sm text-gray-600 mb-2">Upload an Excel file with columns: `batch number`, `student name or id`, `exam /mock`, `exam name`, `score`, `date`</p>
              <div className="flex items-center space-x-2">
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="w-full p-2 border rounded" />
              <button onClick={handleDownloadTemplate} title="Download Template" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                  <Download size={18} />
                </button>
              </div>
              {previewData.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Preview</h3>
                  <button onClick={handleSubmitBulkUpload} disabled={isLoading} className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 mt-2 disabled:bg-gray-400">{isLoading ? 'Submitting...' : 'Submit Marks'}</button>
                </div>
              )}
              
              <h2 className="text-xl font-semibold mb-4 mt-8 flex items-center"><Download className="mr-2" />Download Marks</h2>
              <div className="flex gap-4">
                <select onChange={e => setSelectedBatch(e.target.value)} value={selectedBatch} className="w-full p-2 border rounded">
                  <option value="">Select Batch to Download</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
                </select>
                <button onClick={handleDownload} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">Download</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><Upload className="mr-2" />Online Attendance Upload</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                <select
                  value={selectedBatchAttendance}
                  onChange={e => setSelectedBatchAttendance(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Month</label>
                <input
                  type="month"
                  value={selectedMonthAttendance}
                  onChange={e => setSelectedMonthAttendance(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Attendance File</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleAttendanceFileUpload}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={handleDownloadAttendanceTemplate}
                  className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  <Download size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Download template for correct format</p>
            </div>

            {attendancePreviewData.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Preview</h3>
                <button onClick={handleSubmitAttendanceUpload} disabled={isLoading} className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 mt-2 disabled:bg-gray-400">
                  {isLoading ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* View Uploaded Marks */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><Eye className="mr-2" />Uploaded Marks</h2>
          {selectedMarks.length > 0 && (
            <div className="flex justify-end mb-4">
              <button onClick={handleDeleteSelected} disabled={isLoading} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 flex items-center gap-2 disabled:bg-gray-400">
                <Trash2 size={18} /> Delete Selected ({selectedMarks.length})
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-2 text-left">
                    <input type="checkbox" onChange={handleSelectAllMarks} checked={selectedMarks.length > 0 && selectedMarks.length === allMarks.length} />
                  </th>
                  <th className="border p-2 text-left">Batch</th>
                  <th className="border p-2 text-left">Student</th>
                  <th className="border p-2 text-left">Type</th>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Score</th>
                  <th className="border p-2 text-left">Date</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allMarks.map((mark) => (
                  <tr key={mark.id} className={`hover:bg-gray-50 ${selectedMarks.includes(mark.id) ? 'bg-blue-100' : ''}`}>
                    <td className="border p-2">
                      <input type="checkbox" checked={selectedMarks.includes(mark.id)} onChange={() => handleSelectMark(mark.id)} />
                    </td>
                    <td className="border p-2">{mark.batchNumber}</td>
                    <td className="border p-2">{mark.studentName}</td>
                    <td className="border p-2">{mark.type}</td>
                    <td className="border p-2">{mark.exam}</td>
                    <td className="border p-2">{mark.score}</td>
                    <td className="border p-2">{mark.date}</td>
                    <td className="border p-2">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(mark)} className="text-blue-500"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(mark.id)} className="text-red-500"><Trash2 size={18} /></button>
                      </div>
                    </td>
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

export default UploadMarksPage;
