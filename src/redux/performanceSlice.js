import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Import the API functions

const initialState = {
  performanceData: [],
  trainingData: [],
  employees: [],
  isLoading: true,
  snackbar: {
    open: false,
    message: "",
    severity: "success",
  },
};

// Async thunk to fetch all data
export const fetchAllData = createAsyncThunk(
  "performance/fetchAllData",
  async (_, { rejectWithValue }) => {
    try {
      const performanceResponse = await allApi.fetchAllPerformance(); // Adjusted API call
      const trainingResponse = await allApi.fetchAllTraining(); // Adjusted API call
      return {
        performance: performanceResponse,
        training: trainingResponse,
      };
    } catch (error) {
      return rejectWithValue(error.response.data || "Failed to fetch data");
    }
  }
);

// Async thunk to fetch employees
export const fetchEmployees = createAsyncThunk(
  "performance/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchEmployees(); // Adjusted API call
      return response; // Return the employee data
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to fetch employees"
      );
    }
  }
);

// Async thunk to add performance data
export const addPerformanceData = createAsyncThunk(
  "performance/addPerformanceData",
  async (newData, { rejectWithValue }) => {
    try {
      const response = await allApi.addPerformanceData(newData); // Adjusted API call
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to add performance data"
      );
    }
  }
);

// Async thunk to update performance data
export const updatePerformanceData = createAsyncThunk(
  "performance/updatePerformanceData",
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await allApi.updatePerformanceData(updatedData); // Adjusted API call
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to update performance data"
      );
    }
  }
);

// Async thunk to delete performance data
export const deletePerformanceData = createAsyncThunk(
  "performance/deletePerformanceData",
  async ({ empId, month }, { rejectWithValue }) => {
    try {
      await allApi.deletePerformanceData({ empId, month }); // Adjusted API call
      return { empId, month }; // Return the id for the reducer to remove it from the state
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to delete performance data"
      );
    }
  }
);

// Async thunk to add training details
export const addTrainingDetails = createAsyncThunk(
  "performance/addTrainingDetails",
  async (newTraining, { rejectWithValue }) => {
    try {
      const response = await allApi.addTrainingDetails(newTraining); // Adjusted API call
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to add training details"
      );
    }
  }
);

// Async thunk to update training details
export const updateTrainingDetails = createAsyncThunk(
  "performance/updateTrainingDetails",
  async (updatedTraining, { rejectWithValue }) => {
    try {
      const response = await allApi.updateTrainingDetails(updatedTraining); // Adjusted API call
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to update training details"
      );
    }
  }
);

// Async thunk to delete training details
export const deleteTrainingDetails = createAsyncThunk(
  "performance/deleteTrainingDetails",
  async (id, { rejectWithValue }) => {
    try {
      await allApi.deleteTrainingDetails(id); // Adjusted API call
      return id; // Return the id for the reducer to remove it from the state
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to delete training details"
      );
    }
  }
);

const performanceSlice = createSlice({
  name: "performance",
  initialState,
  reducers: {
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setSnackbar(state, action) {
      state.snackbar = { ...action.payload, open: true };
    },
    closeSnackbar(state) {
      state.snackbar.open = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllData.fulfilled, (state, action) => {
        state.performanceData = action.payload.performance;
        state.trainingData = action.payload.training;
        state.isLoading = false;
        state.snackbar = {
          open: true,
          message: "Data fetched successfully!",
          severity: "success",
        };
      })
      .addCase(fetchAllData.rejected, (state, action) => {
        state.isLoading = false;
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })
      // Fetch employees
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employees = action.payload; // Store employees in the state
      })
      .addCase(addPerformanceData.fulfilled, (state, action) => {
        state.performanceData.push(action.payload);
        state.snackbar = {
          open: true,
          message: "Performance data added successfully!",
          severity: "success",
        };
      })
      .addCase(addPerformanceData.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })
      .addCase(updatePerformanceData.fulfilled, (state, action) => {
        const index = state.performanceData.findIndex(
          (item) =>
            item.empId === action.payload.empId &&
            item.month === action.payload.month
        );
        if (index !== -1) {
          state.performanceData[index] = action.payload;
          state.snackbar = {
            open: true,
            message: "Performance data updated successfully!",
            severity: "success",
          };
        }
      })
      .addCase(updatePerformanceData.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })
      .addCase(deletePerformanceData.fulfilled, (state, action) => {
        const { empId, month } = action.payload;
        state.performanceData = state.performanceData.filter(
          (item) => !(item.empId === empId && item.month === month)
        );
        state.snackbar = {
          open: true,
          message: "Performance data deleted successfully!",
          severity: "success",
        };
      })
      .addCase(deletePerformanceData.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })
      .addCase(addTrainingDetails.fulfilled, (state, action) => {
        state.trainingData.push(action.payload);
        state.snackbar = {
          open: true,
          message: "Training details added successfully!",
          severity: "success",
        };
      })
      .addCase(addTrainingDetails.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })
      .addCase(updateTrainingDetails.fulfilled, (state, action) => {
        const index = state.trainingData.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.trainingData[index] = action.payload;
          state.snackbar = {
            open: true,
            message: "Training details updated successfully!",
            severity: "success",
          };
        }
      })
      .addCase(updateTrainingDetails.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })
      .addCase(deleteTrainingDetails.fulfilled, (state, action) => {
        const id = action.payload;
        state.trainingData = state.trainingData.filter(
          (item) => item.id !== id
        );
        state.snackbar = {
          open: true,
          message: "Training details deleted successfully!",
          severity: "success",
        };
      })
      .addCase(deleteTrainingDetails.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      });
  },
});

// Export actions
export const { setLoading, setSnackbar, closeSnackbar } =
  performanceSlice.actions;

// Selector for performance metrics
export const selectPerformanceMetrics = (state) => {
  const performanceData = state.performance.performanceData;
  const totalPerformance = performanceData.reduce(
    (acc, curr) => acc + curr.performance,
    0
  );
  const averagePerformance = performanceData.length
    ? (totalPerformance / performanceData.length).toFixed(2)
    : 0; // Handle empty performanceData
  const percentageChange =
    performanceData.length >= 2
      ? ((performanceData[performanceData.length - 1].performance -
          performanceData[performanceData.length - 2].performance) /
          performanceData[performanceData.length - 2].performance) *
        100
      : 0;

  return { totalPerformance, averagePerformance, percentageChange };
};

export default performanceSlice.reducer;
