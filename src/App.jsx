import React from "react";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <NotificationProvider>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <Router>
          <Routes>
            {/* Employee Dashboard with sidebar and content */}
            <Route path="/" element={<DashboardLayout />}>
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="attendance-leave" element={<AttendanceLeavePage />} />
              <Route path="performance-training" element={<PerformanceTrainingPage />} />
              <Route path="profile-settings" element={<ProfileSettingsPage />} />
              <Route path="time-tracking" element={<TimeTrackingPage />} />
              <Route path="announcements-help" element={<AnnouncementsHelpPage />} />
            </ Route>
            {/* Admin Dashboard routes */}
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route path="employees" element={<EmployeeManagementPage />} />
              <Route path="admin-payroll" element={<AdminPayrollPage />} />
              <Route path="attendance" element={<AdminAttendancePage />} />
              <Route path="performance" element={<AdminPerformanceManagementPage />} />
              <Route path="time-management" element={<AdminTimeTrackingPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              {/* Add other admin routes here, e.g., attendance, performance, etc. */}
            </Route>
            {/* Other pages */}
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} /> {/* Catch-all route for 404 */}
          </Routes>
        </Router>
      </PersistGate>
    </NotificationProvider>
  );
}

export default App;