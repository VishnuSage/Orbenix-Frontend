import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Import the allApi file
import dayjs from "dayjs";

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
      return response; // Return the data for the fulfilled action
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message for the rejected action
    }
  }
);

// Async thunk for fetching all attendance data (for admin)
export const fetchAllAttendanceData = createAsyncThunk(
  "attendanceLeave/fetchAllAttendanceData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchAllAttendanceData(); // Fetch all attendance data
      console.log("fetchAllAttendanceData Response:", response);
      return response; // Return the data for the fulfilled action
    } catch (error) {
      return rejectWithValue(error.message); // Return the error message for the rejected action
    }
  }
);

// Async thunk for fetching leave requests data
export const fetchLeaveRequestsData = createAsyncThunk(
  "attendanceLeave/fetchLeaveRequestsData",
  async (empId, { rejectWithValue }) => {
    try {
      console.log("Before API Call:", empId); // Log empId before the call
      const response = await allApi.fetchLeaveRequests(empId);
      console.log("API Response:", response); // Log the response
      return response;
    } catch (error) {
      console.error("Error in fetchLeaveRequestsData:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for submitting leave request data
export const submitLeaveRequestData = createAsyncThunk(
  "attendanceLeave/submitLeaveRequestData",
  async (leaveRequest, { dispatch, rejectWithValue }) => {
    try {
      const response = await allApi.submitLeaveRequest(
        leaveRequest.empId,
        leaveRequest
      );
      dispatch(
        setSnackbarMessage({
          message: "Leave request submitted successfully!",
          severity: "success",
        })
      );
      return response; // Return the data for the fulfilled action
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

// Async thunk for approving a leave request
export const approveLeaveRequestData = createAsyncThunk(
  "attendanceLeave/approveLeaveRequestData",
  async ({ empId, leaveRequestId }, { dispatch, rejectWithValue }) => {
    try {
      await allApi.approveLeaveRequest(empId, leaveRequestId);
      dispatch(
        setSnackbarMessage({
          message: "Leave request approved successfully!",
          severity: "success",
        })
      );
      return { empId, leaveRequestId };
    } catch (error) {
      dispatch(
        setSnackbarMessage({
          message: "Failed to approve leave request.",
          severity: "error",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for rejecting a leave request
export const rejectLeaveRequestData = createAsyncThunk(
  "attendanceLeave/rejectLeaveRequestData",
  async ({ empId, leaveRequestId }, { dispatch, rejectWithValue }) => {
    try {
      await allApi.rejectLeaveRequest(empId, leaveRequestId);
      dispatch(
        setSnackbarMessage({
          message: "Leave request rejected successfully!",
          severity: "success",
        })
      );
      return { empId, leaveRequestId };
    } catch (error) {
      dispatch(
        setSnackbarMessage({
          message: "Failed to reject leave request.",
          severity: "error",
        })
      );
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching all leave requests (admin)
export const fetchAllLeaveRequestsData = createAsyncThunk(
  "attendanceLeave/fetchAllLeaveRequestsData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchAllLeaveRequests();
      console.log("API Response for All Leave Requests:", response);
      return response.leaveRequests; // Extract the leaveRequests array
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching all employees' attendance data
export const fetchAllEmployeesTimeData = createAsyncThunk(
  "attendanceLeave/fetchAllEmployeesTimeData",
  async ({ fromDate, toDate }, { rejectWithValue }) => {
    try {
      console.log("Fetching attendance data with date range:", {
        fromDate,
        toDate,
      });

      const response = await allApi.fetchAllEmployeesTimeApi(
        fromDate, // Assuming fromDate and toDate are already in YYYY-MM-DD format
        toDate
      );

      console.log("API Response for Attendance Data:", response);

      return response;
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      return rejectWithValue(error.message);
    }
  }
);

const attendanceLeaveSlice = createSlice({
  name: "attendanceLeave",
  initialState: {
    attendanceData: {
      totalDays: 0,
      attendance: [],
      monthlyLeaveCount: {},
      metrics: [], // Add a place to store metrics
    },
    leaveRequests: [],
    leaveDetails: { currentLeaveCount: 0, remainingDays: 0 },
    allLeaveRequests: [],
    allEmployeesAttendance: [],
    loading: true,
    allEmployeesTimeData: [],
    loadingEmployeesTime: false, // Loading state for employee time data
    error: null,
    successMessage: "",
    snackbarMessage: "",
    snackbarSeverity: "error",
    selectedDateRange: {
      fromDate: null, // Initial value for fromDate
      toDate: null, // Initial value for toDate
    },
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
    calculateRemainingLeave(state, action) {
      const { empId } = action.payload; // Assuming you're passing the empId to this reducer
      const currentMonthLeaveCount =
        state.attendanceData.monthlyLeaveCount[empId] || 0;
      const remainingDays =
        state.leaveDetails.remainingDays - currentMonthLeaveCount;
      state.leaveDetails.remainingDays = remainingDays;
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
    setSnackbarMessage(state, action) {
      const { message, severity } = action.payload;
      state.snackbarMessage = message;
      state.snackbarSeverity = severity;
    },
    clearSnackbarMessage(state) {
      state.snackbarMessage = "";
      state.snackbarSeverity = "error";
    },
    setDateRange(state, action) {
      const { fromDate, toDate } = action.payload;
      state.selectedDateRange = { fromDate, toDate }; // Update selectedDateRange directly
    },
    clearDateRange(state) {
      state.selectedDateRange = {
        fromDate: null,
        toDate: null,
      };
    },
    calculateAttendanceMetrics(state) {
      // This reducer is only used to update metrics for the current employee's attendance data
      const attendanceEntries = state.attendanceData.attendance;
      const metrics = {};

      attendanceEntries.forEach((record) => {
        const { empId, status, hoursWorked } = record;

        if (!metrics[empId]) {
          metrics[empId] = {
            empId,
            name: record.name,
            daysPresent: 0,
            daysAbsent: 0,
            totalHoursWorked: 0,
          };
        }

        if (status === "present") {
          metrics[empId].daysPresent += 1;
          metrics[empId].totalHoursWorked += hoursWorked || 0;
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
      .addCase(fetchAttendanceData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendanceData.fulfilled, (state, action) => {
        state.attendanceData = {
          attendance: action.payload.dailyRecords,
          monthlyLeaveCount: action.payload.monthlyLeaveCount,
          totalLeavesThisMonth: action.payload.totalLeavesThisMonth,
        };
        state.loading = false;
        state.metrics = calculateAttendanceMetrics(state); // Calculate metrics for the current employee
      })
      .addCase(fetchAttendanceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllAttendanceData.pending, (state) => {
        state.loading = true; // Set loading to true while fetching
      })
      .addCase(fetchAllAttendanceData.fulfilled, (state, action) => {
        state.allEmployeesAttendance = action.payload; // Store fetched attendance data for all employees
        state.loading = false; // Set loading to false after fetching
      })
      .addCase(fetchAllAttendanceData.rejected, (state, action) => {
        state.error = action.payload; // Set error state
        state.loading = false; // Set loading to false on error
      })
      .addCase(fetchLeaveRequestsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeaveRequestsData.fulfilled, (state, action) => {
        state.leaveRequests = action.payload.leaveRequests;
        state.leaveDetails = action.payload.leaveDetails;
        state.loading = false;
      })
      .addCase(fetchLeaveRequestsData.rejected, (state, action) => {
        console.error("Fetch leave requests failed:", action.payload);
        state.error = action.payload; // Set the error state
      })
      .addCase(submitLeaveRequestData.fulfilled, (state, action) => {
        state.leaveRequests.push(action.payload);
      })
      .addCase(approveLeaveRequestData.fulfilled, (state, action) => {
        const { empId, leaveRequestId } = action.payload;
        const requestIndex = state.leaveRequests.findIndex(
          (request) => request.id === leaveRequestId
        );
        if (requestIndex !== -1) {
          state.leaveRequests[requestIndex].status = "Approved";
        }
      })
      .addCase(rejectLeaveRequestData.fulfilled, (state, action) => {
        const { empId, leaveRequestId } = action.payload;
        const requestIndex = state.leaveRequests.findIndex(
          (request) => request.id === leaveRequestId
        );
        if (requestIndex !== -1) {
          state.leaveRequests[requestIndex].status = "Rejected";
        }
      })
      .addCase(fetchAllLeaveRequestsData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllLeaveRequestsData.fulfilled, (state, action) => {
        state.allLeaveRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllLeaveRequestsData.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllEmployeesTimeData.pending, (state) => {
        state.loadingEmployeesTime = true; // Set loading state to true
      })
      .addCase(fetchAllEmployeesTimeData.fulfilled, (state, action) => {
        console.log("Fetched Employees Time Data:", action.payload);
        state.loadingEmployeesTime = false; // Set loading state to false
        state.allEmployeesTimeData = action.payload; // Update the state with fetched data
      })
      .addCase(fetchAllEmployeesTimeData.rejected, (state, action) => {
        state.loadingEmployeesTime = false; // Set loading state to false
        state.error = action.payload; // Capture the error message
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
  setSnackbarMessage,
  clearSnackbarMessage,
  setDateRange,
  clearDateRange,
  calculateAttendanceMetrics,
} = attendanceLeaveSlice.actions;

export default attendanceLeaveSlice.reducer;
