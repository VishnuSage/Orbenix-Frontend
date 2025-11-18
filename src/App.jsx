import { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const PayrollPage = lazy(() => import("./pages/PayrollPage.jsx"));
const AttendanceLeavePage = lazy(() => import("./pages/AttendanceLeavePage"));
const PerformanceTrainingPage = lazy(() =>
  import("./pages/PerformanceTrainingPage")
);
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage.jsx"));
const TimeTrackingPage = lazy(() => import("./pages/TimeTrackingPage.jsx"));
const AnnouncementsHelpPage = lazy(() => import("./pages/AnnouncementsHelpPage.jsx"));
const Auth = lazy(() => import("./components/Auth"));
const NotFound = lazy(() => import("./components/NotFound"));
const NotificationProvider = lazy(() => import("./components/NotificationContext.jsx"));
const AdminDashboardLayout = lazy(() => import("./components/AdminDashboardLayout.jsx"));
const AdminPayrollPage = lazy(() => import("./pages/AdminPayrollPage.jsx"));
const EmployeeManagementPage = lazy(() => import("./pages/EmployeeManagementPage.jsx"));
const AdminAttendancePage = lazy(() => import("./pages/AdminAttendancePage.jsx"));
const AdminPerformanceManagementPage = lazy(() => import("./pages/AdminPerformanceManagementPage.jsx"));
const AdminTimeTrackingPage = lazy(() => import("./pages/AdminTimeTrackingPage.jsx"));
const AdminAnnouncementsPage = lazy(() => import("./pages/AdminAnnouncementsPage.jsx"));
import { useSelector } from "react-redux"; // Import useSelector

function App() {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Get isLoggedIn from state
  console.log("Is user logged in?", isLoggedIn); // Debugging log

  return (
    <Suspense fallback={<div style={{textAlign: 'center', marginTop: '2rem'}}>Loading...</div>}>
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
    </Suspense>
  );
}

export default App;
