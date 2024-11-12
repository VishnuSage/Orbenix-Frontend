import { createSlice } from '@reduxjs/toolkit';

// Utility function to get the number of days in a specific month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const attendanceLeaveSlice = createSlice({
  name: 'attendanceLeave',
  initialState: {
    attendanceData: {
      totalDays: getDaysInMonth(new Date().getFullYear(), new Date().getMonth()), // Dynamically set total days for the current month
      attendance: [],
      remainingLeave: {
        EMP001: 5,
        EMP002: 3,
        // Add more employees as needed
      },
    },
    leaveRequests: [],
    adminLeaveRequests: [],
    loading: false,
    error: null,
    successMessage: "",
  },
  reducers: {
    fetchAttendanceRequest(state) {
      state.loading = true;
    },
    fetchAttendanceSuccess(state, action) {
      state.loading = false;
      state.attendanceData = {
        ...state.attendanceData,
        ...action.payload,
        totalDays: action.payload.totalDays, // Ensure totalDays is set from the payload
      };
    },
    fetchAttendanceFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    submitLeaveRequest(state, action) {
      const { type, startDate, endDate, employeeId } = action.payload;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1; // Calculate number of days requested

      // Check if the employee has enough remaining leave
      if (state.attendanceData.remainingLeave[employeeId] >= daysRequested) {
        state.leaveRequests.push(action.payload);
        state.attendanceData.remainingLeave[employeeId] -= daysRequested; // Deduct leave days
        state.successMessage = "Leave request submitted successfully";
      } else {
        state.error = "Insufficient leave balance"; // Handle insufficient leave case
      }
    },
    clearSuccessMessage(state) {
      state.successMessage = "";
    },
    logAttendance(state, action) {
      const { date, employeeId, status } = action.payload;
      const attendanceEntry = state.attendanceData.attendance.find(entry => entry.date === date && entry.employeeId === employeeId);
      
      if (attendanceEntry) {
        attendanceEntry.status = status; // Update status if entry exists
      } else {
        state.attendanceData.attendance.push({ date, employeeId, status });
      }
    },
    approveLeaveRequest(state, action) {
      const { requestId } = action.payload;
      const request = state.leaveRequests.find(req => req.id === requestId);
      
      if (request) {
        request.status = "Approved";

        // Deduct days from the employee's remaining leave
        const employeeId = request.employeeId; // Assuming employeeId is part of the request
        const daysRequested = Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1; // Calculate the days requested

        state.attendanceData.remainingLeave[employeeId] -= daysRequested; // Ded uct leave days
      }
    },
    rejectLeaveRequest(state, action) {
      const { requestId } = action.payload;
      const request = state.leaveRequests.find(req => req.id === requestId);
      
      if (request) {
        request.status = "Rejected";
      }
    },
    fetchAdminLeaveRequests(state, action) {
      state.adminLeaveRequests = action.payload;
    },
    fetchLeaveRequests(state, action) {
      state.leaveRequests = action.payload;
    },
  },
});

// Export actions and reducer
export const {
  fetchAttendanceRequest,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  submitLeaveRequest,
  clearSuccessMessage,
  logAttendance,
  approveLeaveRequest,
  rejectLeaveRequest,
  fetchAdminLeaveRequests,
  fetchLeaveRequests,
} = attendanceLeaveSlice.actions;

export default attendanceLeaveSlice.reducer;