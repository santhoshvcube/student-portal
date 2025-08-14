import React, { useState, useRef, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Upload, Trash2, Edit, FileDown } from 'lucide-react';
import AdminDashboardButton from '../components/AdminDashboardButton';
import { useStudents, Student, Batch } from '../context/StudentContext';
import { v4 as uuidv4 } from 'uuid';

interface ManageStudentsPageProps {}

const ManageStudentsPage: React.FC<ManageStudentsPageProps> = () => {
  const [search, setSearch] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const { students, batches, refreshData } = useStudents();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [batch, setBatch] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  // Get unique batches and their counts
  const batchOptions = React.useMemo(() => {
    return batches.map(batch => ({
      batch: batch.id,
      count: students.filter(s => s.batchId === batch.id).length,
      batchNumber: batch.batchNumber
    })).sort((a, b) => a.batchNumber.localeCompare(b.batchNumber));
  }, [batches, students]);

  const batchIdToNumberMap = React.useMemo(() =>
    new Map(batches.map(b => [b.id, b.batchNumber])),
  [batches]);

  // Filtered students based on search and batch
  const filteredStudents = students.filter(s =>
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase()) ||
     s.mobile.toLowerCase().includes(search)) &&
    (filterBatch === '' || s.batchId === filterBatch)
  );

  // Handle single student add
  const API_URL = 'http://localhost:3000/api';

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (studentId && name && email && mobile && batch) {
      const newStudent = {
        id: uuidv4(),
        studentId: studentId,
        name,
        email,
        mobile,
        batchId: batch,
        active: true,
        photo: '',
        password: mobile,
        profileComplete: false,
        education: [],
      };
      try {
        const response = await fetch(`${API_URL}/students`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newStudent),
        });
        if (response.ok) {
          refreshData();
          setStudentId('');
          setName('');
          setEmail('');
          setMobile('');
          setBatch('');
          setShowAddModal(false);
        } else {
          console.error('Failed to add student:', await response.json());
        }
      } catch (error) {
        console.error('Failed to add student:', error);
      }
    }
  };

  // Handle bulk upload (CSV/Excel)
  const processFile = (e: React.ChangeEvent<HTMLInputElement>) => {
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setUploadErrors(['Please select a file to upload.']);
      return;
    }

    setUploadErrors([]);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');

      const batchNumberToIdMap = new Map(batches.map(b => [b.batchNumber, b.id]));
      const errors: string[] = [];
      const newStudents: Student[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const [id, name, email, mobile, batchNumber] = line.replace(/\r$/, '').split(',').map(s => s.trim());
        
        if (!id || !name || !email || !mobile || !batchNumber) {
          errors.push(`Row ${i + 1}: Missing data. Each row must have ID, Name, Email, Mobile, and Batch Number.`);
          continue;
        }

        const batchId = batchNumberToIdMap.get(batchNumber);
        if (!batchId) {
          errors.push(`Row ${i + 1}: Invalid Batch Number "${batchNumber}". Please ensure the batch exists.`);
          continue;
        }

        newStudents.push({
          id,
          studentId: id,
          name,
          email,
          mobile,
          batchId,
          active: true,
          photo: '',
          education: [],
          attendance: [],
          qrCode: '',
          password: mobile,
          profileComplete: false,
        });
      }

      if (errors.length > 0) {
        setUploadErrors(errors);
      } else {
        try {
          const response = await fetch(`${API_URL}/students/bulk`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newStudents),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred during bulk upload.');
          }

          refreshData();
          setShowUploadModal(false);
          setSelectedFile(null);
        } catch (error: any) {
          console.error('Failed to upload students:', error);
          setUploadErrors([error.message]);
        }
      }
    };
    reader.readAsText(selectedFile);
  };

  // Handle student update
  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      try {
        await fetch(`${API_URL}/students/${editingStudent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingStudent),
        });
        refreshData();
        setShowEditModal(false);
        setEditingStudent(null);
      } catch (error) {
        console.error('Failed to update student:', error);
      }
    }
  };

  // Toggle student active status
  const toggleStudentStatus = async (student: Student) => {
    const updatedStudent = { ...student, active: !student.active };
    try {
      await fetch(`${API_URL}/students/${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStudent),
      });
      refreshData();
    } catch (error) {
      console.error('Failed to update student status:', error);
    }
  };

  // Handle export to CSV
  const handleExport = () => {
    const dataToExport = filteredStudents.map(({ id, name, email, mobile, batchId, active }) =>
      ({ id, name, email, mobile, batchId, active })
    );

    if (dataToExport.length === 0) {
      alert('No students to export.');
      return;
    }

    const csvContent = [
      Object.keys(dataToExport[0]).join(','), // Header row
      ...dataToExport.map(item => Object.values(item).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `students-export-${filterBatch || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Student Management</h1>
          <p className="text-xl text-gray-600">Add, view, and manage student accounts</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-dashed border-green-300 rounded-xl hover:border-green-400 transition-colors cursor-pointer"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Add Single Student</h3>
              <p className="text-gray-600">Manually add individual student profiles</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-6 border-2 border-dashed border-blue-300 rounded-xl hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => setShowUploadModal(true)}
            >
              <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Bulk Upload</h3>
              <p className="text-gray-600">Upload multiple students using CSV files</p>
            </motion.div>
          </div>

          {/* Student List Table */}
          <div className="mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex-1 mb-4 md:mb-0">
                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="border rounded-lg px-4 py-2 w-full"
                />
              </div>
              <div className="flex-shrink-0">
                <select
                  value={filterBatch}
                  onChange={e => setFilterBatch(e.target.value)}
                  className="border rounded-lg px-4 py-2"
                >
                  <option value="">All Batches</option>
                  {batchOptions.map(({ batch, count, batchNumber }) => (
                    <option key={batch} value={batch}>
                      {batchNumber} ({count})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-shrink-0 ml-4">
                <button
                  onClick={handleExport}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center"
                >
                  <FileDown className="w-5 h-5 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {students.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No students found. Add students to get started.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b p-4 text-left">ID</th>
                      <th className="border-b p-4 text-left">Name</th>
                      <th className="border-b p-4 text-left">Mobile</th>
                      <th className="border-b p-4 text-left">Email</th>
                      <th className="border-b p-4 text-left">Batch</th>
                      <th className="border-b p-4 text-left">Status</th>
                      <th className="border-b p-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border-b p-4">{student.id}</td>
                        <td className="border-b p-4 font-medium">{student.name}</td>
                        <td className="border-b p-4">{student.mobile}</td>
                        <td className="border-b p-4">{student.email}</td>
                        <td className="border-b p-4">{batchIdToNumberMap.get(student.batchId) || student.batchId}</td>
                        <td className="border-b p-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            student.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {student.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="border-b p-4">
                          <div className="flex gap-2">
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                              onClick={() => {
                                setEditingStudent(student);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                              onClick={() => {
                                if (window.confirm('Delete this student permanently?')) {
                                  fetch(`${API_URL}/students/${student.id}`, { method: 'DELETE' })
                                    .then(res => {
                                      if (res.ok) {
                                        refreshData();
                                      } else {
                                        console.error('Failed to delete student');
                                      }
                                    });
                                }
                              }}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <button
                              className={`p-2 text-white rounded-full ${
                                student.active ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              onClick={() => toggleStudentStatus(student)}
                            >
                              {student.active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Edit Student Modal */}
          {showEditModal && editingStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Student</h2>
                <form onSubmit={handleUpdateStudent} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Student ID"
                    value={editingStudent.studentId}
                    onChange={e => setEditingStudent({ ...editingStudent, studentId: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={editingStudent.name}
                    onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={editingStudent.email}
                    onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={editingStudent.mobile}
                    onChange={e => setEditingStudent({ ...editingStudent, mobile: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <select
                    value={editingStudent.batchId}
                    onChange={e => setEditingStudent({ ...editingStudent, batchId: e.target.value })}
                    className="border rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNumber} ({batch.batchType})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Update Student
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Add Student Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setShowAddModal(false)}
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Add Student</h2>
                <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Student ID"
                    value={studentId}
                    onChange={e => setStudentId(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                    required
                  />
                  <select
                    value={batch}
                    onChange={e => setBatch(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.batchNumber} ({batch.batchType})
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
                  >
                    Add Student
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Bulk Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
                <button
                  className="absolute top-2 right-4 text-gray-400 hover:text-gray-700 text-2xl"
                  onClick={() => setShowUploadModal(false)}
                >
                  ×
                </button>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Bulk Upload Students</h2>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="mb-4 w-full"
                  onChange={handleFileChange}
                />
                <button
                  onClick={handleUpload}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center"
                  disabled={!selectedFile}
                >
                  Upload
                </button>
                <p className="text-sm text-gray-500 mb-2">
                  Upload a CSV file with columns: <b>id, name, email, mobile, batchNumber</b>. <a href="/students_template.csv" download className="text-blue-500 hover:underline">Download sample template</a>
                </p>
                {uploadErrors.length > 0 && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Upload Errors:</strong>
                    <ul className="mt-2 list-disc list-inside">
                      {uploadErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <AdminDashboardButton />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ManageStudentsPage;
