import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import io from 'socket.io-client';

export type AttendanceRecord = {
  date: string;
  type: 'class' | 'lab' | 'hr_session';
  present?: boolean;
  inTime?: string;
  outTime?: string;
  sessionName?: string;
};

export type MonthlyConducted = {
  classes: number;
  labs: number;
  exams: number;
  mocks: number;
};

export type Batch = {
  id: string;
  batchNumber: string;
  batchType: 'MCD';
  students: string[];
  startDate: string;
  endDate: string;
  qrCode: string;
  attendanceTypes: ('class' | 'lab' | 'hr_session')[];
  monthlyData?: { [month: string]: MonthlyConducted };
  classesConducted?: number;
  labsConducted?: number;
  examsConducted?: number;
  mocksConducted?: number;
};

export type Schedule = {
  id: string;
  batchId: string;
  task: string;
  assignedDate: string;
  submissionDate: string;
  submittedDateByStudent?: string;
};

export type Education = {
  level?: 'SSC/10th' | 'Intermediate/Diploma' | 'Degree' | 'PG';
  boardOrUniversity?: string;
  institution?: string;
  course?: string;
  passoutYear?: number;
  percentageOrCgpa?: number;
};

export type Student = {
  id: string;
  studentId: string;
  name: string;
  photo: string;
  email: string;
  mobile: string;
  password?: string;
  batchId: string;
  education: Education[];
  experience?: {
    years: number;
    description?: string;
  };
  active: boolean;
  attendance: AttendanceRecord[];
  qrCode: string;
  profileComplete?: boolean;
  resumeStatus?: 'pending' | 'approved' | 'rejected';
  marks?: { id: string; exam: string; score: number, type: 'exam' | 'mock', date: string }[];
  monthlyData?: { [month: string]: { classes: number, labs: number, exams: number, mocks: number, classesAttended: number, labsAttended: number, totalExamMarks: number, totalMockMarks: number } };
};

type StudentContextType = {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
  schedules: Schedule[];
  setSchedules: React.Dispatch<React.SetStateAction<Schedule[]>>;
  refreshData: () => void;
  loading: boolean;
};

const StudentContext = createContext<StudentContextType>({
  students: [],
  setStudents: () => {},
  batches: [],
  setBatches: () => {},
  schedules: [],
  setSchedules: () => {},
  refreshData: () => {},
  loading: true,
});

export const useStudents = () => useContext(StudentContext);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const API_URL = '/api';

  const refreshData = async () => {
    try {
      const [studentsRes, batchesRes, schedulesRes, marksRes] = await Promise.all([
        fetch(`${API_URL}/students`),
        fetch(`${API_URL}/batches`),
        fetch(`${API_URL}/schedules`),
        fetch(`${API_URL}/marks`),
      ]);
      const studentsData = await studentsRes.json();
      const batchesData = await batchesRes.json();
      const schedulesData = await schedulesRes.json();
      const marksData = await marksRes.json();

      const studentsWithMarks = studentsData.map((student: Student) => ({
        ...student,
        marks: marksData.filter((mark: any) => mark.studentId === student.id),
      }));

      setStudents(studentsWithMarks);
      setBatches(batchesData);
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    const socket = io();
    socket.on('data_changed', () => {
      refreshData();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <StudentContext.Provider value={{ students, setStudents, batches, setBatches, schedules, setSchedules, refreshData, loading }}>
      {children}
    </StudentContext.Provider>
  );
};

export { StudentContext };
