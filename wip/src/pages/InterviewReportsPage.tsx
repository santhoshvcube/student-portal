import React, { useState, useEffect, useContext } from 'react';
import { StudentContext } from '../context/StudentContext';
import { useParams } from 'react-router-dom';

type Interview = {
  id: number;
  studentId: string;
  interviewMode: string;
  focusArea: string;
  questions: string;
  answers: string;
  scores: string;
  feedback: string;
  date: string;
};

const InterviewReportsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const { students } = useContext(StudentContext);
  const { studentId } = useParams<{ studentId: string }>();

  useEffect(() => {
    const fetchInterviews = async () => {
      if (studentId) {
        try {
          const response = await fetch(`http://localhost:3000/api/interviews/${studentId}`);
          const data = await response.json();
          setInterviews(data);
        } catch (error) {
          console.error("Error fetching interviews:", error);
        }
      }
    };
    fetchInterviews();
  }, [studentId]);

  const student = students.find(s => s.id === studentId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Reports for {student?.name}</h1>
      {interviews.length === 0 ? (
        <p>No interview reports found for this student.</p>
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => (
            <div key={interview.id} className="p-4 border rounded-lg">
              <h2 className="text-xl font-semibold">{interview.interviewMode}</h2>
              {interview.focusArea && <p><strong>Focus Area:</strong> {interview.focusArea}</p>}
              <p><strong>Date:</strong> {new Date(interview.date).toLocaleDateString()}</p>
              <div className="mt-4">
                <h3 className="font-bold">Results:</h3>
                <ul className="list-disc ml-5">
                  {JSON.parse(interview.questions).map((q: string, i: number) => (
                    <li key={i}>
                      <p><strong>Q:</strong> {q}</p>
                      <p><strong>A:</strong> {JSON.parse(interview.answers)[i]}</p>
                      <p><strong>Score:</strong> {JSON.parse(interview.scores)[i]}/10</p>
                      <p><strong>Feedback:</strong> {JSON.parse(interview.feedback)[i]}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewReportsPage;