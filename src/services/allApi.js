import { commonApi } from "./commonApi";

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

// -----------------------------------
// Authentication APIs
// -----------------------------------
export const login = async (credentials) => {
  const { emailOrPhone, password } = credentials;
  try {
    const response = await commonApi("POST", "/api/auth/login", {
      emailOrPhone,
      password,
    });
    if (!response.data || !response.data.token || !response.data.user) {
      throw new Error("Invalid response structure");
    }
    return {
      empId: response.data.user.empId,
      roles: response.data.user.roles,
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const registerUser = async ({ emailOrPhone, password }) => {
  return await commonApi("POST", "/api/auth/register", {
    emailOrPhone,
    password,
  });
};

export const fetchEmployeeByEmailOrPhone = async (emailOrPhone) => {
  return await commonApi(
    "GET",
    `/api/employees?emailOrPhone=${encodeURIComponent(emailOrPhone)}`
  );
};

export const fetchUserRoles = async (empId) => {
  return await commonApi("GET", `/api/employees/${empId}/roles`);
};

export const resetPassword = async ({ emailOrPhone, newPassword }) => {
  try {
    const response = await commonApi("POST", "/api/auth/password-reset", {
      emailOrPhone,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};

export const updatePassword = async ({
  empId,
  currentPassword,
  newPassword,
}) => {
  try {
    return await commonApi("POST", "/api/auth/update-password", {
      empId,
      currentPassword,
      newPassword,
    });
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update password"
    );
  }
};

// -----------------------------------
// Time Tracking APIs
// -----------------------------------

// Clock In API
export const clockInApi = async (empId) => {
  return await commonApi("POST", "/api/time/clock-in", { empId });
};

// Clock Out API
export const clockOutApi = async (empId) => {
  return await commonApi("POST", "/api/time/clock-out", { empId });
};

// Fetch Daily Hours API
export const fetchDailyHoursApi = async (empId, date) => {
  return await commonApi("GET", `/api/time/daily-hours/${empId}?date=${date}`);
};

// Fetch Monthly Hours API
export const fetchMonthlyHoursApi = async (empId, month, year) => {
  return await commonApi(
    "GET",
    `/api/time/monthly-hours/${empId}?month=${month}&year=${year}`
  );
};

// Calculate Daily Hours API
export const calculateDailyHoursApi = async (empId, date) => {
  return await commonApi("GET", `/api/time/daily-hours/${empId}?date=${date}`);
};

// Fetch All Employees Time API
export const fetchAllEmployeesTimeApi = async (fromDate, toDate) => {
  let queryParams = "";

  if (fromDate && toDate) {
    // Only add query parameters if dates are provided
    queryParams = `?fromDate=${fromDate}&toDate=${toDate}`;
  }

  return await commonApi("GET", `/api/time/all-employees${queryParams}`);
};

// -----------------------------------
// Attendance and Leave APIs
// -----------------------------------

// Fetch Attendance Data API
export const fetchAttendanceData = async (empId) => {
  return await commonApi("GET", `/api/attendance/${empId}`);
};

// Submit Leave Request API
export const submitLeaveRequest = async (empId, leaveData) => {
  return await commonApi("POST", `/api/attendance/${empId}/leave`, leaveData);
};

// Fetch Leave Requests API
export const fetchLeaveRequests = async (empId) => {
  return await commonApi("GET", `/api/attendance/${empId}/leave`);
};

// Fetch All Attendance Data API
export const fetchAllAttendanceData = async () => {
  return await commonApi("GET", `/api/attendance`);
};

// Approve Leave Request API
export const approveLeaveRequest = async (empId, leaveRequestId) => {
  return await commonApi(
    "PATCH", // Use PATCH for partial updates
    `/api/attendance/${empId}/leave/${leaveRequestId}/approve`
  );
};

// Reject Leave Request API
export const rejectLeaveRequest = async (empId, leaveRequestId) => {
  return await commonApi(
    "PATCH", // Use PATCH for partial updates
    `/api/attendance/${empId}/leave/${leaveRequestId}/reject`
  );
};

// Fetch All Leave Requests API
export const fetchAllLeaveRequests = async () => {
  return await commonApi("GET", `/api/attendance/leave-requests`);
};

// -----------------------------------
// Payroll APIs
// -----------------------------------
export const fetchAllPayrolls = async (empId, userRole) => {
  const endpoint =
    userRole === "admin" || userRole === "superAdmin"
      ? `/api/payrolls`
      : `/api/payrolls?empId=${empId}`;
  return await commonApi("GET", endpoint);
};

export const fetchEmployeePayroll = async (empId) => {
  return await commonApi("GET", `/api/employees/${empId}/payroll`);
};

export const createPayroll = async (payrollData) => {
  return await commonApi("POST", "/api/payrolls", payrollData);
};

export const updatePayroll = async (payrollData) => {
  return await commonApi(
    "PUT",
    `/api/payrolls/${payrollData._id}`,
    payrollData
  );
};

export const deletePayroll = async (payrollData) => {
  return await commonApi("DELETE", `/api/payrolls/${payrollData._id}`);
};

export const fetchPayrollByMonth = async (empId, month) => {
  return await commonApi("GET", `/api/payrolls/${empId}/${month}`);
};

// Fetch all loan requests
export const fetchAllLoanRequests = async () => {
  return await commonApi("GET", `/api/payrolls/loan-requests`);
};

// Fetch loan requests by employee ID
export const fetchLoanRequestsByEmpId = async (empId) => {
  return await commonApi("GET", `/api/payrolls/loan-requests?empId=${empId}`);
};

export const addLoanRequest = async (loanRequestData) => {
  return await commonApi(
    "POST",
    "/api/payrolls/loan-requests",
    loanRequestData
  );
};

export const approveLoanRequest = async (loanNumber) => {
  return await commonApi(
    "PATCH",
    `/api/payrolls/loan-requests/${loanNumber}/approve`
  );
};

export const rejectLoanRequest = async (loanNumber) => {
  return await commonApi(
    "PATCH",
    `/api/payrolls/loan-requests/${loanNumber}/reject`
  );
};

// -----------------------------------
// Performance APIs
// -----------------------------------
export const fetchAllPerformance = async () => {
  return await commonApi("GET", "/api/performance");
};

export const fetchPerformanceDataByEmployee = async (empId) => {
  return await commonApi("GET", `/api/performance/${empId}`);
};

export const fetchAllTraining = async () => {
  return await commonApi("GET", "/api/performance/training");
};

export const addPerformanceData = async (newData) => {
  return await commonApi("POST", "/api/performance", newData);
};

export const updatePerformanceData = async (updatedData) => {
  return await commonApi("PUT", "/api/performance", updatedData);
};

export const deletePerformanceData = async ({ empId, month }) => {
  return await commonApi("DELETE", `/api/performance/${empId}/${month}`);
};

export const addTrainingDetails = async (newTraining) => {
  try {
    const response = await commonApi(
      "POST",
      "/api/performance/training",
      newTraining
    );
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add training details"
    );
  }
};

export const updateTrainingDetails = async (trainingData) => {
  if (!trainingData || !trainingData.trainingId) {
    throw new Error("Invalid training data: trainingId is required.");
  }
  try {
    const response = await commonApi(
      "PUT",
      `/api/performance/training/${trainingData.trainingId}`,
      trainingData
    );
    if (!response) {
      throw new Error("No response received from the server.");
    }
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update training details"
    );
  }
};

export const deleteTrainingDetails = async (trainingId) => {
  const response = await commonApi(
    "DELETE",
    `/api/performance/training/${trainingId}`
  );
  if (!response || !response.trainingId) {
    throw new Error("Invalid response from server");
  }
  return response;
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

// -----------------------------------
// Notifications APIs
// -----------------------------------
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
// Profile APIs
// -----------------------------------
export const uploadProfileImage = async (empId, formData) => {
  return await commonApi(
    "POST",
    `/api/profiles/${empId}/profile-image`,
    formData
  );
};

export const updateEmployeeProfile = async (empId, profileData) => {
  if (!empId) {
    throw new Error("empId is required to update the employee profile.");
  }
  return await commonApi("PUT", `/api/profiles/${empId}`, profileData);
};

export const fetchEmployeeProfile = async (empId) => {
  return await commonApi("GET", `/api/profiles/${empId}`);
};

// Export all API functions
const allApi = {
  // Employee
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  fetchEmployeeById,
  updateEmployeeProfile,
  // Auth
  login,
  registerUser,
  fetchEmployeeByEmailOrPhone,
  fetchUserRoles,
  updatePassword,
  resetPassword,
  // Time Tracking
  clockInApi,
  clockOutApi,
  fetchDailyHoursApi,
  fetchMonthlyHoursApi,
  fetchAllEmployeesTimeApi,
  calculateDailyHoursApi,
  // Attendance
  fetchAttendanceData,
  submitLeaveRequest,
  fetchLeaveRequests,
  fetchAllLeaveRequests,
  fetchAllAttendanceData,
  approveLeaveRequest,
  rejectLeaveRequest,
  rejectLoanRequest,
  // Payroll
  fetchAllPayrolls,
  fetchEmployeePayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  fetchPayrollByMonth,
  fetchAllLoanRequests,
  fetchLoanRequestsByEmpId,
  addLoanRequest,
  approveLoanRequest,
  // Performance
  fetchAllPerformance,
  fetchPerformanceDataByEmployee,
  fetchAllTraining,
  addPerformanceData,
  updatePerformanceData,
  deletePerformanceData,
  addTrainingDetails,
  updateTrainingDetails,
  deleteTrainingDetails,
  // Announcements
  fetchAnnouncements,
  addAnnouncement,
  removeAnnouncement,
  updateAnnouncement,
  // Notifications
  fetchNotifications,
  createNotification,
  deleteNotification,
  // Profile
  uploadProfileImage,
  fetchEmployeeProfile,
};

export default allApi;
