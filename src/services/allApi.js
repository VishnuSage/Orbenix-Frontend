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

    console.log("API Response:", response); // Log the entire response

    if (!response.data || !response.data.token || !response.data.user) {
      throw new Error("Invalid response structure");
    }

    const token = response.data.token;
    const user = response.data.user;

    return {
      empId: user.empId,
      roles: user.roles,
      token: token,
      user: user,
    };
  } catch (error) {
    console.error("Login error:", error);
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
    const response = await commonApi("POST", "/api/auth/update-password", {
      empId,
      currentPassword,
      newPassword,
    });
    return response;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update password"
    );
  }
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
    `/api/payrolls/${payrollData.empId}/${payrollData.month}`,
    payrollData
  );
};

export const deletePayroll = async (empId, month) => {
  return await commonApi("DELETE", `/api/payrolls/${empId}/${month}`);
};

export const fetchPayrollByMonth = async (empId, month) => {
  return await commonApi("GET", `/api/payrolls/${empId}/${month}`);
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
// Time Tracking APIs
// -----------------------------------
export const clockInApi = async (empId) => {
  return await commonApi("POST", "/api/time/clock-in", { empId });
};

export const clockOutApi = async (empId) => {
  return await commonApi("POST", "/api/time/clock-out", { empId });
};

export const fetchEventsApi = async (empId) => {
  return await commonApi("GET", `/api/time/events/${empId}`);
};

export const logAttendanceApi = async (empId, status, date) => {
  console.log("Logging attendance:", { empId, status, date }); // Log the attendance data being sent
  return await commonApi("POST", "/api/time/attendance", {
    empId,
    status,
    date,
  });
};

export const fetchAttendanceDataApi = async (empId) => {
  return await commonApi("GET", `/api/time/attendance/${empId}`);
};

export const fetchDailyHoursApi = async (empId, date) => {
  return await commonApi("GET", `/api/time/daily-hours/${empId}?date=${date}`);
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
    console.log("Add Training Response:", response); // Log the response
    return response;
  } catch (error) {
    console.error("Error adding training details:", error); // Log the error
    throw new Error(
      error.response?.data?.message || "Failed to add training details"
    );
  }
};

export const updateTrainingDetails = async (trainingData) => {
  // Check if trainingData and trainingId are defined
  if (!trainingData || !trainingData.trainingId) {
    throw new Error("Invalid training data: trainingId is required.");
  }

  try {
    const response = await commonApi(
      "PUT",
      `/api/performance/training/${trainingData.trainingId}`, // Updated to use trainingId
      trainingData
    );

    // Ensure the response is structured correctly
    if (!response) {
      throw new Error("No response received from the server.");
    }

    return response; // Return the updated training data
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update training details"
    );
  }
};

export const deleteTrainingDetails = async (trainingId) => {
  // Updated parameter name
  try {
    console.log("Making DELETE request for training ID:", trainingId); // Updated to use trainingId
    const response = await commonApi(
      "DELETE",
      `/api/training/${trainingId}` // Updated to use trainingId
    );
    console.log("Delete response:", response);
    if (!response || !response.trainingId) {
      // Updated to check for trainingId
      throw new Error("Invalid response from server");
    }
    return response;
  } catch (error) {
    console.error("Delete request failed:", error);
    throw error;
  }
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
// Profile API
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
  registerUser,
  fetchEmployeeByEmailOrPhone,
  fetchUserRoles,
  updatePassword,
  fetchAllPayrolls,
  fetchEmployeePayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  fetchPayrollByMonth,
  fetchLoanRequests,
  fetchAttendanceData,
  fetchLeaveRequestsData,
  submitLeaveRequestData,
  clockInApi,
  clockOutApi,
  fetchEventsApi,
  logAttendanceApi,
  fetchAttendanceDataApi,
  fetchDailyHoursApi,
  fetchAllPerformance,
  fetchPerformanceDataByEmployee,
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
  uploadProfileImage,
  fetchEmployeeProfile,
  resetPassword,
};

export default allApi;
