import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import moment from "moment";
import allApi from "../services/allApi"; // Import the allApi module

const initialState = {
  isClockedIn: false,
  startTime: null,
  elapsedTime: 0,
  events: [],
  monthlyHours: {},
  employeesTimeData: [], // For admin view
  dailyStatus: {
    isCurrentlyClocked: false, // Initial state for isCurrentlyClocked
    totalHours: 0,
    lastClockIn: null,
    lastClockOut: null,
  }, // Track daily clock in/out status
  monthlyStats: {
    totalHours: 0,
    daysPresent: 0,
    daysAbsent: 0,
  },
  snackbarOpen: false,
  snackbarMessage: "",
  isLoading: false,
  error: null,
};

// Async thunk to fetch monthly hours
export const fetchMonthlyHours = createAsyncThunk(
  "timeTracking/fetchMonthlyHours",
  async ({ empId, month, year }, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchMonthlyHoursApi(empId, month, year);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch all employees' time data (for admin)
export const fetchAllEmployeesTime = createAsyncThunk(
  "timeTracking/fetchAllEmployeesTime",
  async (date, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchAllEmployeesTimeApi(date);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to handle clocking in
export const clockInThunk = createAsyncThunk(
  "timeTracking/clockIn",
  async ({ empId }, { dispatch, rejectWithValue }) => {
    try {
      console.log("Sending Clock-In Request:", { empId });
      const response = await allApi.clockInApi(empId);
      console.log("API Response:", response.data);

      // Destructure properly from the response object
      const { clockInTime, entry, attendanceEntry } = response; // Access within the response object
      dispatch(fetchDailyStatus({ empId: empId, date: new Date() }));
      // Update state in timeTrackingSlice based on the response data
      return {
        clockInTime: clockInTime,
        entry: entry,
        attendanceEntry: attendanceEntry,
      };
    } catch (error) {
      console.error("Failed to clock in:", error);
      return rejectWithValue(error.response?.message || "Failed to clock in");
    }
  }
);

// Thunk to handle clocking out
export const clockOutThunk = createAsyncThunk(
  "timeTracking/clockOut",
  async ({ empId }, { dispatch, rejectWithValue }) => {
    try {
      const response = await allApi.clockOutApi(empId);
      // Assuming the response structure is the same
      const { entry, clockOutTime, hoursWorked } = response; // Access within the response object
      // Dispatch an action to refetch daily status
      dispatch(fetchDailyStatus({ empId: empId, date: new Date() }));
      // Dispatch an action to update monthly stats after clocking out
      dispatch(
        fetchMonthlyStats({
          empId: empId,
          month: moment().month() + 1,
          year: moment().year(),
        })
      );
      return {
        entry,
        clockOutTime,
        hoursWorked,
      };
    } catch (error) {
      console.error("Failed to clock out:", error);
      return rejectWithValue(error.response?.message || "Failed to clock out");
    }
  }
);

// Thunk to fetch daily status and update elapsed time
export const fetchDailyStatus = createAsyncThunk(
  "timeTracking/fetchDailyStatus",
  async ({ empId, date }, { rejectWithValue }) => {
    try {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const response = await allApi.fetchDailyHoursApi(empId, formattedDate);
      console.log("fetchDailyStatus Response:", response);
      const {
        totalHours,
        isCurrentlyClocked,
        status,
        events,
        hoursWorked,
        lastClockIn,
      } = response;

      // Calculate elapsed time
      let elapsedTime = 0;
      let lastClockInTime = null;
      for (const event of events) {
        if (event.type === "clockIn") {
          lastClockInTime = new Date(event.timestamp);
        } else if (event.type === "clockOut" && lastClockInTime) {
          elapsedTime += (new Date(event.timestamp) - lastClockInTime) / 1000; // Calculate elapsed time
          lastClockInTime = null;
        }
      }

      // Handle missing clock-out event
      if (isCurrentlyClocked && lastClockInTime) {
        const now = new Date();
        elapsedTime += (now - lastClockInTime) / 1000;
      }

      return {
        totalHours,
        isCurrentlyClocked,
        status,
        events,
        hoursWorked,
        elapsedTime,
        lastClockIn,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.message || "Failed to fetch daily status"
      );
    }
  }
);

// Thunk to fetch monthly statistics
export const fetchMonthlyStats = createAsyncThunk(
  "timeTracking/fetchMonthlyStats",
  async ({ empId, month, year }, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchMonthlyHoursApi(empId, month, year);
      console.log("fetchMonthlyStats API Response:", response);

      // Convert the fraction of an hour to full hours
      const totalHoursWorked = (response.totalHours * 60) / 60; // Convert from fraction of an hour to full hours

      return {
        totalHours: totalHoursWorked,
        month,
        year,
        empId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const timeTrackingSlice = createSlice({
  name: "timeTracking",
  initialState,
  reducers: {
    clockOut: (state) => {
      state.isClockedIn = false;
      state.elapsedTime += Date.now() - state.startTime; // Update elapsed time
      state.startTime = null; // Reset start time
    },
    resetTimer: (state) => {
      state.elapsedTime = 0; // Reset elapsed time
    },
    setSnackbarOpen: (state, action) => {
      state.snackbarOpen = action.payload;
    },
    setSnackbarMessage: (state, action) => {
      const { open, message } = action.payload;
      state.snackbarOpen = open;
      state.snackbarMessage = message; // Ensure message is a string
    },
    clearSnackbar: (state) => {
      state.snackbarOpen = false; // Close the snackbar
      state.snackbarMessage = ""; // Clear the message
    },
    updateElapsedTime: (state) => {
      if (state.isClockedIn) {
        state.elapsedTime += 1; // Increment elapsed time by 1 second
      }
    },
    addEvent: (state, action) => {
      // Add new event to the events array
      state.events.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Clock In/Out cases
      .addCase(clockInThunk.fulfilled, (state, action) => {
        const { clockInTime } = action.payload;
        state.isClockedIn = true;
        state.startTime = new Date(clockInTime).getTime();
        state.dailyStatus = {
          ...state.dailyStatus,
          isCurrentlyClocked: true,
          lastClockIn: clockInTime,
        };
      })
      .addCase(clockInThunk.rejected, (state, action) => {
        state.snackbarOpen = true;
        state.snackbarMessage = action.payload || "Failed to clock in.";
      })
      .addCase(clockOutThunk.fulfilled, (state, action) => {
        const { clockOutTime, hoursWorked } = action.payload;
        state.isClockedIn = false;
        state.elapsedTime = 0;
        state.startTime = null;
        state.dailyStatus = {
          ...state.dailyStatus,
          isCurrentlyClocked: false,
          lastClockOut: clockOutTime,
          hoursWorked,
        };
        // Update monthly stats
        state.monthlyStats.totalHours += hoursWorked;
      })
      .addCase(clockOutThunk.rejected, (state, action) => {
        state.snackbarOpen = true;
        state.snackbarMessage = action.payload || "Failed to clock out.";
      })
      // Daily status cases
      .addCase(fetchDailyStatus.fulfilled, (state, action) => {
        console.log("Daily Status Fetched:", action.payload);
        state.dailyStatus = action.payload;
        state.elapsedTime = action.payload.elapsedTime;
        // Update events array to include daily hours
        state.events.push({
          title: `Hours Worked: ${action.payload.hoursWorked || 0}`,
          start: new Date(action.payload.date),
          end: new Date(action.payload.date),
        });
      })
      .addCase(fetchDailyStatus.rejected, (state, action) => {
        state.error = action.payload;
        state.snackbarOpen = true; // Open snackbar on error
        state.snackbarMessage =
          action.payload || "Failed to fetch daily status."; // Set error message
      })
      // Monthly stats cases
      .addCase(fetchMonthlyStats.fulfilled, (state, action) => {
        state.monthlyStats = action.payload;
      })
      .addCase(fetchMonthlyStats.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Monthly hours cases
      .addCase(fetchMonthlyHours.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyHours.fulfilled, (state, action) => {
        state.isLoading = false;
        state.monthlyHours = action.payload;
      })
      .addCase(fetchMonthlyHours.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.snackbarOpen = true;
        state.snackbarMessage = "Failed to fetch monthly hours.";
      })
      // Admin time tracking cases
      .addCase(fetchAllEmployeesTime.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEmployeesTime.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employeesTimeData = action.payload;
      })
      .addCase(fetchAllEmployeesTime.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.snackbarOpen = true;
        state.snackbarMessage = "Failed to fetch employees' time data.";
      });
  },
});

// Export actions
export const {
  clockOut,
  resetTimer,
  setSnackbarOpen,
  setSnackbarMessage,
  clearSnackbar,
  updateElapsedTime,
  addEvent,
} = timeTrackingSlice.actions;

// Additional selectors
export const selectDailyStatus = (state) => state.timeTracking.dailyStatus;
export const selectMonthlyStats = (state) => state.timeTracking.monthlyStats;

// Inside your timeTrackingSlice.js
export const selectDailyHours = (state, employees) => {
  const dailyStatus = selectDailyStatus(state); // Get the dailyStatus from the state
  const dailyHours = {};

  employees.forEach((employee) => {
    // Handle cases where dailyStatus[employee.empId] might be undefined
    const statusData = dailyStatus[employee.empId] || {
      totalHours: 0,
      isCurrentlyClocked: false,
      lastClockIn: null,
      lastClockOut: null,
    };

    dailyHours[employee.empId] = {
      // Convert totalHours (in hours) to totalSeconds (in seconds)
      totalSeconds: statusData.totalHours * 3600, // Assuming totalHours is in hours
      isActive: statusData.isCurrentlyClocked,
      lastClockIn: statusData.lastClockIn,
      lastClockOut: statusData.lastClockOut,
    };
  });

  return dailyHours;
};

// Selectors
export const selectMonthlyHours = (state) => state.timeTracking.monthlyHours;
export const selectEmployeesTimeData = (state) =>
  state.timeTracking.employeesTimeData;
export const selectIsLoading = (state) => state.timeTracking.isLoading;
export const selectError = (state) => state.timeTracking.error;

// Helper selector for filtering employees time data
export const selectFilteredEmployeesTime = (state, searchQuery) => {
  const employeesTimeData = selectEmployeesTimeData(state);
  if (!searchQuery) return employeesTimeData;

  return employeesTimeData.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.empId.toString().includes(searchQuery) ||
      employee.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );
};

// Export the reducer
export default timeTrackingSlice.reducer;
