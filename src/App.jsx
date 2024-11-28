import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import PayrollPage from "./pages/PayrollPage.jsx";
import AttendanceLeavePage from "./pages/AttendanceLeavePage"; // Merged Attendance and Leave Management
import PerformanceTrainingPage from "./pages/PerformanceTrainingPage"; // Merged Performance and Training
import ProfileSettingsPage from "./pages/ProfileSettingsPage.jsx"; // Merged Profile and Settings
import TimeTrackingPage from "./pages/TimeTrackingPage.jsx"; // Separate Time Tracking
import AnnouncementsHelpPage from "./pages/AnnouncementsHelpPage.jsx"; // Merged Announcements and Help
import Auth from "./components/Auth";
import NotFound from "./components/NotFound"; // 404 Not Found page
import { NotificationProvider } from "./components/NotificationContext.jsx";
import AdminDashboardLayout from "./components/AdminDashboardLayout.jsx";
import AdminPayrollPage from "./pages/AdminPayrollPage.jsx";
import EmployeeManagementPage from "./pages/EmployeeManagementPage.jsx";
import AdminAttendancePage from "./pages/AdminAttendancePage.jsx";
import AdminPerformanceManagementPage from "./pages/AdminPerformanceManagementPage.jsx";
import AdminTimeTrackingPage from "./pages/AdminTimeTrackingPage.jsx";
import AdminAnnouncementsPage from "./pages/AdminAnnouncementsPage.jsx";
import { useSelector } from "react-redux"; // Import useSelector

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Get isLoggedIn from state
  console.log("Is user logged in?", isLoggedIn); // Debugging log

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Employee Dashboard with sidebar and content */}
          <Route
            path="/"
            element={isLoggedIn ? <DashboardLayout /> : <Navigate to="/auth" />}
          >
            <Route
              path="/payroll"
              element={isLoggedIn ? <PayrollPage /> : <Navigate to="/auth" />}
            />
            <Route
              path="attendance-leave"
              element={
                isLoggedIn ? <AttendanceLeavePage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="performance-training"
              element={
                isLoggedIn ? (
                  <PerformanceTrainingPage />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="profile-settings"
              element={
                isLoggedIn ? <ProfileSettingsPage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="time-tracking"
              element={
                isLoggedIn ? <TimeTrackingPage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="announcements-help"
              element={
                isLoggedIn ? <AnnouncementsHelpPage /> : <Navigate to="/auth" />
              }
            />
          </Route>
          {/* Admin Dashboard routes */}
          <Route
            path="/admin"
            element={
              isLoggedIn ? <AdminDashboardLayout /> : <Navigate to="/auth" />
            }
          >
            <Route
              path="employees"
              element={
                isLoggedIn ? (
                  <EmployeeManagementPage />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="admin-payroll"
              element={
                isLoggedIn ? <AdminPayrollPage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="attendance"
              element={
                isLoggedIn ? <AdminAttendancePage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="performance"
              element={
                isLoggedIn ? (
                  <AdminPerformanceManagementPage />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
            <Route
              path="time-management"
              element={
                isLoggedIn ? <AdminTimeTrackingPage /> : <Navigate to="/auth" />
              }
            />
            <Route
              path="announcements"
              element={
                isLoggedIn ? (
                  <AdminAnnouncementsPage />
                ) : (
                  <Navigate to="/auth" />
                )
              }
            />
          </Route>
          {/* Other pages */}
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />{" "}
          {/* Catch-all route for 404 */}
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
