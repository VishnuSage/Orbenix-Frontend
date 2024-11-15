import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Import the allApi file

// Utility function to get the number of days in a specific month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Async thunk for fetching attendance data
export const fetchAttendanceData = createAsyncThunk(
  "attendanceLeave/fetchAttendanceData",
  async (empId, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchAttendanceData(empId);
      return response.data; // Return the data for the fulfilled action
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message for the rejected action
    }
  }
);

// Async thunk for fetching leave requests data
export const fetchLeaveRequestsData = createAsyncThunk(
  "attendanceLeave/fetchLeaveRequestsData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchLeaveRequestsData();
      return response.data; // Return the data for the fulfilled action
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message for the rejected action
    }
  }
);

// Async thunk for submitting leave request data
export const submitLeaveRequestData = createAsyncThunk(
  "attendanceLeave/submitLeaveRequestData",
  async (leaveRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await allApi.submitLeaveRequestData(leaveRequest);
      dispatch(
        setSnackbarMessage({
          message: "Leave request submitted successfully!",
          severity: "success",
        })
      );
      return response.data; // Return the data for the fulfilled action
    } catch (error) {
      dispatch(
        setSnackbarMessage({
          message: "Failed to submit leave request.",
          severity: "error",
        })
      );
      return rejectWithValue(error.message); // Return the error message for the rejected action
    }
  }
);

// Async thunk for logging attendance
export const logAttendance = createAsyncThunk(
  "attendanceLeave/logAttendance",
  async ({ empId, status }, { rejectWithValue }) => {
    const date = new Date().toISOString().split("T")[0]; // Get today's date
    try {
      const response = await allApi.logAttendanceApi(empId, status, date); // Pass the date to the API
      return response; // Return the response for the fulfilled action
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message for the rejected action
    }
  }
);

const attendanceLeaveSlice = createSlice({
  name: "attendanceLeave",
  initialState: {
    attendanceData: {
      totalDays: 0,
      attendance: [],
      remainingLeave: {},
      metrics: [], // Add a place to store metrics
    },
    leaveRequests: [],
    adminLeaveRequests: [],
    loading: false,
    error: null,
    successMessage: "",
    snackbarMessage: "",
    snackbarSeverity: "error",
  },
  reducers: {
    fetchAttendanceRequest(state) {
      state.loading = true;
    },
    fetchAttendanceSuccess(state, action) {
      state.loading = false;
      const payload = action.payload || {}; // Ensure payload is defined
      state.attendanceData = {
        ...state.attendanceData,
        ...payload,
        totalDays:
          payload.totalDays ||
          getDaysInMonth(new Date().getFullYear(), new Date().getMonth()), // Set totalDays from payload or calculate
      };
      state.metrics = calculateAttendanceMetrics(
        state.attendanceData.attendance
      ); // Calculate metrics after fetching data
    },
    fetchAttendanceFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    submitLeaveRequest(state, action) {
      const { type, startDate, endDate, empId } = action.payload;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysRequested =
        Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

      if (state.attendanceData.remainingLeave[empId] >= daysRequested) {
        state.leaveRequests.push({
          id: Date.now(),
          type,
          startDate,
          endDate,
          empId,
          status: "Pending",
        });
        state.attendanceData.remainingLeave[empId] -= daysRequested;
        state.successMessage = "Leave request submitted successfully";
      } else {
        state.error = "Insufficient leave balance";
      }
    },
    clearSuccessMessage(state) {
      state.successMessage = "";
    },
    approveLeaveRequest(state, action) {
      const { requestId } = action.payload;
      const requestIndex = state.leaveRequests.findIndex(
        (request) => request.id === requestId
      );
      if (requestIndex !== -1) {
        state.leaveRequests[requestIndex].status = "Approved";
      }
    },
    rejectLeaveRequest(state, action) {
      const { requestId } = action.payload;
      const requestIndex = state.leaveRequests.findIndex(
        (request) => request.id === requestId
      );
      if (requestIndex !== -1) {
        state.leaveRequests[requestIndex].status = "Rejected";
      }
    },
    fetchAdminLeaveRequests(state, action) {
      state.adminLeaveRequests = action.payload;
    },
    setSnackbarMessage(state, action) {
      const { message, severity } = action.payload;
      state.snackbarMessage = message;
      state.snackbarSeverity = severity;
    },
    clearSnackbarMessage(state) {
      state.snackbarMessage = "";
      state.snackbarSeverity = "error";
    },
    calculateAttendanceMetrics(state) {
      const attendanceEntries = state.attendanceData.attendance;
      const metrics = {};

      attendanceEntries.forEach((record) => {
        const { empId, status, hoursWorked } = record;

        if (!metrics[empId]) {
          metrics[empId] = {
            empId,
            name: record.name, // Assuming name is part of the record
            daysPresent: 0,
            daysAbsent: 0,
            totalHoursWorked: 0,
          };
        }

        if (status === "present") {
          metrics[empId].daysPresent += 1;
          metrics[empId].totalHoursWorked += hoursWorked || 0; // Add hours worked if available
        } else if (status === "absent") {
          metrics[empId].daysAbsent += 1;
        }
      });

      // Store metrics in state
      state.attendanceData.metrics = Object.values(metrics);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logAttendance.fulfilled, (state, action) => {
        const { empId, status } = action.meta.arg; // Get empId and status from action metadata
        const date = new Date().toISOString().split("T")[0]; // Get today's date
        const attendanceEntry = state.attendanceData.attendance.find(
          (entry) => entry.date === date && entry.empId === empId
        );

        if (attendanceEntry) {
          attendanceEntry.status = status; // Update existing entry
        } else {
          state.attendanceData.attendance.push({ date, empId, status }); // Add new entry
        }
        // Recalculate metrics after logging attendance
        state.metrics = calculateAttendanceMetrics(
          state.attendanceData.attendance
        );
      })
      .addCase(logAttendance.rejected, (state, action) => {
        state.error = action.payload; // Handle error
        state.snackbarMessage = "Failed to log attendance.";
      });
  },
});

// Export actions and reducer
export const {
  fetchAttendanceRequest,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  submitLeaveRequest,
  clearSuccessMessage,
  approveLeaveRequest,
  rejectLeaveRequest,
  fetchAdminLeaveRequests,
  setSnackbarMessage,
  clearSnackbarMessage,
  calculateAttendanceMetrics,
} = attendanceLeaveSlice.actions;

export default attendanceLeaveSlice.reducer;
