import { commonApi } from "./commonApi"; // Assuming commonApi is a utility for handling common API calls

// -----------------------------------
// Employee APIs
// -----------------------------------
export const fetchEmployees = async () => {
  return await commonApi("GET", "/api/employees");
};

export const addEmployee = async (employee) => {
  return await commonApi("POST", "/api/employees", employee);
};

export const updateEmployee = async (employee) => {
  return await commonApi("PUT", `/api/employees/${employee.empId}`, employee);
};

export const deleteEmployee = async (empId) => {
  return await commonApi("DELETE", `/api/employees/${empId}`);
};

export const fetchEmployeeById = async (empId) => {
  return await commonApi("GET", `/api/employees/${empId}`);
};

export const updateEmployeeProfile = async (profileData) => {
  return await commonApi(
    "PUT",
    `/api/employees/${profileData.empId}`,
    profileData
  );
};

// -----------------------------------
// Authentication APIs
// -----------------------------------
export const login = async (credentials) => {
  const { emailOrPhone, password } = credentials;
  return await commonApi("POST", "/api/auth/login", { emailOrPhone, password });
};

export const sendOtp = async (email) => {
  return await commonApi("POST", "/api/auth/send-otp", { email });
};

export const verifyOtp = async ({ email, otp }) => {
  return await commonApi("POST", "/api/auth/verify-otp", { email, otp });
};

export const registerUser = async ({ emailOrPhone, password }) => {
  return await commonApi("POST", "/api/auth/register", {
    emailOrPhone,
    password,
  });
};

export const fetchEmployeeByEmailOrPhone = async (identifier) => {
  return await commonApi("GET", `/api/employees?identifier=${identifier}`);
};

export const fetchUserRoles = async (empId) => {
  return await commonApi("GET", `/api/employees/${empId}/roles`);
};

export const updatePassword = async ({
  empId,
  currentPassword,
  newPassword,
}) => {
  return await commonApi("POST", "/api/auth/updatePassword", {
    empId,
    currentPassword,
    newPassword,
  });
};

// -----------------------------------
// Payroll APIs
// -----------------------------------
export const fetchAllPayrolls = async (empId, userRole) => {
  const endpoint =
    userRole === "admin" ? `/api/payrolls` : `/api/payrolls?empId=${empId}`;
  return await commonApi("GET", endpoint);
};

export const fetchEmployeePayroll = async (empId) => {
  return await commonApi("GET", `/api/employees/${empId}/payroll`);
};

export const fetchLoanRequests = async (empId) => {
  return await commonApi("GET", `/api/loanRequests?empId=${empId}`);
};

// -----------------------------------
// Attendance APIs
// -----------------------------------
export const fetchAttendanceData = async (empId) => {
  return await commonApi("GET", `/api/attendance/${empId}`);
};

export const fetchLeaveRequestsData = async () => {
  return await commonApi("GET", "/api/leaveRequests");
};

export const submitLeaveRequestData = async (leaveRequest) => {
  return await commonApi("POST", "/api/leaveRequests", leaveRequest);
};

// -----------------------------------
// Event APIs
// -----------------------------------
export const fetchEventsApi = async () => {
  return await commonApi("GET", "/api/events");
};

export const logAttendanceApi = async (empId, status, date) => {
  return await commonApi("POST", "/api/attendance", { empId, date, status });
};

// -----------------------------------
// Performance APIs
// -----------------------------------
export const fetchAllPerformance = async () => {
  return await commonApi("GET", "/api/performance");
};

export const fetchAllTraining = async () => {
  return await commonApi("GET", "/api/training");
};

export const addPerformanceData = async (newData) => {
  return await commonApi("POST", "/api/performance", newData);
};

export const updatePerformanceData = async (updatedData) => {
  return await commonApi(
    "PUT",
    `/api/performance/${updatedData.empId}/${updatedData.month}`,
    updatedData
  );
};

export const deletePerformanceData = async ({ empId, month }) => {
  return await commonApi("DELETE", `/api/performance/${empId}/${month}`);
};

export const addTrainingDetails = async (newTraining) => {
  return await commonApi("POST", "/api/training", newTraining);
};

export const updateTrainingDetails = async (updatedTraining) => {
  return await commonApi(
    "PUT",
    `/api/training/${updatedTraining.id}`,
    updatedTraining
  );
};

export const deleteTrainingDetails = async (id) => {
  return await commonApi("DELETE", `/api/training/${id}`);
};

// -----------------------------------
// Announcements APIs
// -----------------------------------
export const fetchAnnouncements = async () => {
  return await commonApi("GET", "/api/announcements");
};

export const addAnnouncement = async (announcement) => {
  return await commonApi("POST", "/api/announcements", announcement);
};

export const removeAnnouncement = async (id) => {
  return await commonApi("DELETE", `/api/announcements/${id}`);
};

export const updateAnnouncement = async (announcement) => {
  return await commonApi(
    "PUT",
    `/api/announcements/${announcement.id}`,
    announcement
  );
};

// Assuming commonApi is already imported in allApi.js
export const fetchNotifications = async () => {
  return await commonApi("GET", "/api/notifications");
};

export const createNotification = async (notification) => {
  return await commonApi("POST", "/api/notifications", notification);
};

export const deleteNotification = async (id) => {
  return await commonApi("DELETE", `/api/notifications/${id}`);
};

// -----------------------------------
// Export all API functions
// -----------------------------------
const allApi = {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  fetchEmployeeById,
  updateEmployeeProfile,
  login,
  sendOtp,
  verifyOtp,
  registerUser,
  fetchEmployeeByEmailOrPhone,
  fetchUserRoles,
  updatePassword,
  fetchAllPayrolls,
  fetchEmployeePayroll,
  fetchLoanRequests,
  fetchAttendanceData,
  fetchLeaveRequestsData,
  submitLeaveRequestData,
  fetchEventsApi,
  logAttendanceApi,
  fetchAllPerformance,
  fetchAllTraining,
  addPerformanceData,
  updatePerformanceData,
  deletePerformanceData,
  addTrainingDetails,
  updateTrainingDetails,
  deleteTrainingDetails,
  fetchAnnouncements,
  addAnnouncement,
  removeAnnouncement,
  updateAnnouncement,
  fetchNotifications,
  createNotification,
  deleteNotification,
};

export default allApi;
