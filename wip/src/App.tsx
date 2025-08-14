import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './auth/AuthContext';
import { StudentProvider } from './context/StudentContext';
import ProtectedRoute from './utils/ProtectedRoute';
import PageTransitionWrapper from './components/PageTransitionWrapper';
import Header from './components/Header';

// Import pages
import HomePage from './pages/HomePage';
import AdminLoginPage from './pages/AdminLoginPage';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentRegistrationPage from './pages/StudentRegistrationPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import QRScannerPage from './pages/QRScannerPage';
import ManageStudentsPage from './pages/ManageStudentsPage';
import BatchManagementPage from './pages/BatchManagementPage';
import UploadMarksPage from './pages/UploadMarksPage';
import MonthlyReportsAdminPage from './pages/MonthlyReportsAdminPage';
import ViewAttendancePage from './pages/ViewAttendancePage';
import ViewMarksHistoryPage from './pages/ViewMarksHistoryPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeReviewPage from './pages/ResumeReviewPage';
import ReportsPage from './pages/ReportsPage';
import ReportsAndAnalysisPage from './pages/ReportsAndAnalysis';
import AIInterviewPage from './pages/AIInterviewPage';
import NotFoundPage from './pages/NotFoundPage';
import InterviewReportsPage from './pages/InterviewReportsPage';
import ResumeReviewerPage from './pages/ResumeReviewerPage';
import ResumeReviewsAdminPage from './pages/ResumeReviewsAdminPage';

function App() {
  const location = useLocation();

  return (
    <AuthProvider>
      <StudentProvider>
        <div className="min-h-screen bg-gray-50">
        <Header />

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <PageTransitionWrapper transitionType="slideRight">
                  <HomePage />
                </PageTransitionWrapper>
              }
            />
            <Route
              path="/register"
              element={
                <PageTransitionWrapper transitionType="slideLeft">
                  <StudentRegistrationPage />
                </PageTransitionWrapper>
              }
            />
            <Route
              path="/login-admin"
              element={
                <PageTransitionWrapper transitionType="fadeIn">
                  <AdminLoginPage />
                </PageTransitionWrapper>
              }
            />
            <Route
              path="/login-student"
              element={
                <PageTransitionWrapper transitionType="slideUp">
                  <StudentLoginPage />
                </PageTransitionWrapper>
              }
            />

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route
                path="/dashboard-admin"
                element={
                  <PageTransitionWrapper transitionType="crossFadeScale">
                    <AdminDashboard />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/scanner"
                element={
                  <PageTransitionWrapper transitionType="zoomIn">
                    <QRScannerPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/manage-students"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ManageStudentsPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/batches"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <BatchManagementPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/upload-marks"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <UploadMarksPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/monthly-reports"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <MonthlyReportsAdminPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/reports"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ReportsPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/reports-analysis"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ReportsAndAnalysisPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/interview-reports"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <InterviewReportsPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/resume-reviews"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ResumeReviewsAdminPage />
                  </PageTransitionWrapper>
                }
              />
            </Route>

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route
                path="/dashboard-student"
                element={
                  <PageTransitionWrapper transitionType="crossFadeScale">
                    <StudentDashboard />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/view-attendance"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ViewAttendancePage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/view-marks"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ViewMarksHistoryPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/resume"
                element={
                  <PageTransitionWrapper transitionType="slideLeft">
                    <ResumeBuilderPage />
                  </PageTransitionWrapper>
                }
              />
              <Route
                path="/resume-reviewer"
                element={
                  <PageTransitionWrapper transitionType="slideLeft">
                    <ResumeReviewerPage />
                  </PageTransitionWrapper>
                }
              />
            </Route>
            <Route
                path="/ai-interview"
                element={
                  <PageTransitionWrapper transitionType="slideLeft">
                    <AIInterviewPage />
                  </PageTransitionWrapper>
                }
              />
             <Route
               path="/interview-reports/:studentId"
               element={
                 <PageTransitionWrapper transitionType="slideLeft">
                   <InterviewReportsPage />
                 </PageTransitionWrapper>
               }
             />
              <Route
                path="/resume-review"
                element={
                  <PageTransitionWrapper transitionType="slideRight">
                    <ResumeReviewPage />
                  </PageTransitionWrapper>
                }
              />

            {/* 404 Page */}
            <Route
              path="*"
              element={
                <PageTransitionWrapper transitionType="fadeIn">
                  <NotFoundPage />
                </PageTransitionWrapper>
              }
            />
          </Routes>
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
          }}
        />
      </div>
      </StudentProvider>
    </AuthProvider>
  );
}

export default App;
