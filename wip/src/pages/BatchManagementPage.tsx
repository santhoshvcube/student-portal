import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Plus, X, ClipboardList } from 'lucide-react';
import AdminDashboardButton from '../components/AdminDashboardButton';
import { useStudents, Batch, Schedule } from '../context/StudentContext';
import toast from 'react-hot-toast';

const BatchManagementPage: React.FC = () => {
  const { batches, setBatches, schedules, setSchedules } = useStudents();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    startDate: '',
    endDate: '',
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    task: '',
    assignedDate: new Date().toISOString().slice(0, 10),
    submissionDate: ''
  });
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [monthlyData, setMonthlyData] = useState({
      classes: 0,
      labs: 0,
      exams: 0,
      mocks: 0,
  });

  const API_URL = 'http://localhost:3003/api';

  const handleCreateBatch = async () => {
    const batchData = {
      ...newBatch,
      batchType: 'MCD',
      attendanceTypes: ['class', 'lab', 'hr_session'],
      monthlyData: {},
    };

    try {
      let response;
      if (selectedBatch) {
        // Update existing batch
        const existingBatch = batches.find(b => b.id === selectedBatch);
        if (!existingBatch) {
          toast.error("Batch not found!");
          return;
        }
        const updatedBatch = {
          ...existingBatch,
          batchNumber: newBatch.batchNumber,
          startDate: newBatch.startDate,
          endDate: newBatch.endDate,
        };
        response = await fetch(`${API_URL}/batches/${selectedBatch}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedBatch),
        });
      } else {
        // Create new batch
        response = await fetch(`${API_URL}/batches`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(batchData),
        });
      }

      if (response.ok) {
        toast.success(`Batch ${selectedBatch ? 'updated' : 'created'} successfully!`);
        setShowCreateModal(false);
        setNewBatch({ batchNumber: '', startDate: '', endDate: '' });
        setSelectedBatch(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save batch.');
      }
    } catch (error) {
      console.error('Failed to save batch:', error);
      toast.error('An error occurred while saving the batch.');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        const response = await fetch(`${API_URL}/batches/${batchId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          toast.success('Batch deleted successfully!');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to delete batch.');
        }
      } catch (error) {
        console.error('Failed to delete batch:', error);
        toast.error('An error occurred while deleting the batch.');
      }
    }
  };

  const handleSaveMonthlyData = async () => {
    if (!selectedBatch) {
      toast.error("Please select a batch.");
      return;
    }

    const batchToUpdate = batches.find(b => b.id === selectedBatch);
    if (!batchToUpdate) {
      toast.error("Batch not found!");
      return;
    }

    const updatedMonthlyData = {
      ...batchToUpdate.monthlyData,
      [selectedMonth]: monthlyData,
    };

    const updatedBatch = {
      ...batchToUpdate,
      monthlyData: updatedMonthlyData,
    };

    try {
      const response = await fetch(`${API_URL}/batches/${selectedBatch}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBatch),
      });

      if (response.ok) {
        toast.success("Monthly data saved successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to save monthly data.');
      }
    } catch (error) {
      console.error('Failed to save monthly data:', error);
      toast.error('An error occurred while saving monthly data.');
    }
  };
  
  React.useEffect(() => {
    if (selectedBatch) {
        const batch = batches.find(b => b.id === selectedBatch);
        if (batch && batch.monthlyData && batch.monthlyData[selectedMonth]) {
            setMonthlyData(batch.monthlyData[selectedMonth]);
        } else {
            setMonthlyData({ classes: 0, labs: 0, exams: 0, mocks: 0 });
        }
    }
  }, [selectedBatch, selectedMonth, batches]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-indigo-50 to-purple-100 p-8">
      <AdminDashboardButton />
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Batch Management</h1>
          <p className="text-xl text-gray-600">Create, organize, and manage student batches efficiently</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setShowCreateModal(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
              <Plus size={18} /> Create New Batch
            </button>
            <button
              onClick={() => setShowAssignTaskModal(true)}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <ClipboardList size={18} /> Assign Task
            </button>
          </div>

          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Create New Batch</h3>
                <div className="space-y-4">
                  <input type="text" placeholder="Batch Number" className="w-full p-2 border rounded" value={newBatch.batchNumber} onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })} />
                  <input type="date" className="w-full p-2 border rounded" value={newBatch.startDate} onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })} />
                  <input type="date" className="w-full p-2 border rounded" value={newBatch.endDate} onChange={(e) => setNewBatch({ ...newBatch, endDate: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={handleCreateBatch}>
                    {selectedBatch ? "Save Changes" : "Create Batch"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center bg-gray-50 p-6 rounded-lg mb-6">
            <div>
                <label htmlFor="month-select" className="font-semibold text-lg">Select Month:</label>
                <input
                    type="month"
                    id="month-select"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="p-2 border rounded-lg w-full mt-2"
                />
            </div>
            <div>
                <label htmlFor="batch-select" className="font-semibold text-lg">Select Batch:</label>
                <select id="batch-select" value={selectedBatch || ''} onChange={e => setSelectedBatch(e.target.value)} className="p-2 border rounded-lg w-full mt-2">
                    <option value="" disabled>--Select a Batch--</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
                </select>
            </div>
          </div>
          
          {selectedBatch && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="font-semibold">Classes</label>
                    <input type="number" min="0" className="w-full p-2 border rounded mt-1" value={monthlyData.classes} onChange={e => setMonthlyData({...monthlyData, classes: parseInt(e.target.value)})} />
                </div>
                <div>
                    <label className="font-semibold">Labs</label>
                    <input type="number" min="0" className="w-full p-2 border rounded mt-1" value={monthlyData.labs} onChange={e => setMonthlyData({...monthlyData, labs: parseInt(e.target.value)})} />
                </div>
                <div>
                    <label className="font-semibold">Exams</label>
                    <input type="number" min="0" className="w-full p-2 border rounded mt-1" value={monthlyData.exams} onChange={e => setMonthlyData({...monthlyData, exams: parseInt(e.target.value)})} />
                </div>
                <div>
                    <label className="font-semibold">Mocks</label>
                    <input type="number" min="0" className="w-full p-2 border rounded mt-1" value={monthlyData.mocks} onChange={e => setMonthlyData({...monthlyData, mocks: parseInt(e.target.value)})} />
                </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button onClick={handleSaveMonthlyData} className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600" disabled={!selectedBatch}>
                Save Monthly Data
            </button>
          </div>
          
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">Batch Tasks Overview</h2>
            <div className="space-y-6">
              {batches.map(batch => {
                const batchTasks = schedules.filter(s => s.batchId === batch.id);
                return (
                  <div key={batch.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{batch.batchNumber}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedBatch(batch.id);
                            setNewBatch({
                              batchNumber: batch.batchNumber,
                              startDate: batch.startDate,
                              endDate: batch.endDate
                            });
                            setShowCreateModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBatch(batch.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {batch.startDate} to {batch.endDate}
                    </p>
                    {batchTasks.length === 0 ? (
                      <p className="text-gray-500">No tasks assigned</p>
                    ) : (
                      <div className="space-y-3">
                        {batchTasks.map(task => (
                          <div key={task.id} className="border-b pb-3 group relative">
                            <p className="font-medium">{task.task}</p>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                              <span>Assigned: {task.assignedDate}</span>
                              <span>Due: {task.submissionDate}</span>
                            </div>
                            <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="text-blue-600 hover:text-blue-800 text-xs"
                                onClick={() => {
                                  setSelectedBatch(batch.id);
                                  setNewTask({
                                    task: task.task,
                                    assignedDate: task.assignedDate,
                                    submissionDate: task.submissionDate
                                  });
                                  setEditingTaskId(task.id);
                                  setShowAssignTaskModal(true);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                className="text-red-600 hover:text-red-800 text-xs"
                                onClick={() => {
                                  if (window.confirm('Delete this task?')) {
                                    fetch(`${API_URL}/schedules/${task.id}`, { method: 'DELETE' })
                                      .then(res => {
                                        if (res.ok) {
                                          toast.success("Task deleted successfully!");
                                        } else {
                                          toast.error("Failed to delete task.");
                                        }
                                      });
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </motion.div>
          {showAssignTaskModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-xl w-full max-w-md">
                <h3 className="text-xl font-bold mb-4">Assign Task to Batch</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block font-semibold mb-1">Select Batch</label>
                    <select
                      value={selectedBatch || ''}
                      onChange={e => setSelectedBatch(e.target.value)}
                      className="p-2 border rounded w-full"
                    >
                      <option value="" disabled>--Select a Batch--</option>
                      {batches.map(b => <option key={b.id} value={b.id}>{b.batchNumber}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Project Title</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      value={newTask.task}
                      onChange={e => setNewTask({...newTask, task: e.target.value})}
                      rows={3}
                      placeholder="Enter project title"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Assigned Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={newTask.assignedDate}
                      onChange={e => setNewTask({...newTask, assignedDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Submission Date</label>
                    <input
                      type="date"
                      className="w-full p-2 border rounded"
                      value={newTask.submissionDate}
                      onChange={e => setNewTask({...newTask, submissionDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded" onClick={() => setShowAssignTaskModal(false)}>Cancel</button>
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    onClick={async () => {
                      if (!selectedBatch) {
                        toast.error("Please select a batch");
                        return;
                      }
                      if (!newTask.task.trim()) {
                        toast.error("Please enter project title");
                        return;
                      }

                      try {
                        let response;
                        if (editingTaskId) {
                          // Update existing task
                          response = await fetch(`${API_URL}/schedules/${editingTaskId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ...newTask, batchId: selectedBatch }),
                          });
                        } else {
                          // Create new task
                          const newSchedule = {
                            ...newTask,
                            id: Math.random().toString(36).substring(7),
                            batchId: selectedBatch,
                          };
                          response = await fetch(`${API_URL}/schedules`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(newSchedule),
                          });
                        }

                        if (response.ok) {
                          toast.success(`Task ${editingTaskId ? 'updated' : 'assigned'} successfully!`);
                        } else {
                          const errorData = await response.json();
                          toast.error(errorData.error || 'Failed to save task.');
                        }
                      } catch (error) {
                        console.error('Failed to save task:', error);
                        toast.error('An error occurred while saving the task.');
                      } finally {
                        setNewTask({
                          task: '',
                          assignedDate: new Date().toISOString().slice(0, 10),
                          submissionDate: ''
                        });
                        setShowAssignTaskModal(false);
                        setSelectedBatch(null);
                        setEditingTaskId(null);
                      }
                    }}
                  >
                    {editingTaskId ? "Save Changes" : "Assign Task"}
                  </button>
                </div>
              </div>
            </div>
          )}
    </div>
  );
};

export default BatchManagementPage;
