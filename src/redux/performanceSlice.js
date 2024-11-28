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

// Async thunk to fetch all training data
export const fetchTrainingData = createAsyncThunk(
  "performance/fetchTrainingData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchAllTraining(); // Adjusted API call
      console.log("Training Data Response:", response); // Log the response
      return response;
    } catch (error) {
      return rejectWithValue(
        typeof error.response.data === "string"
          ? error.response.data
          : "Failed to fetch training data"
      );
    }
  }
);

// Async thunk to fetch all performance data
export const fetchPerformanceData = createAsyncThunk(
  "performance/fetchPerformanceData",
  async (_, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchAllPerformance(); // Adjusted API call
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response.data || "Failed to fetch performance data"
      );
    }
  }
);

// Async thunk to fetch performance data by employee
export const fetchPerformanceDataByEmployee = createAsyncThunk(
  "performance/fetchPerformanceDataByEmployee",
  async (empId, { rejectWithValue }) => {
    try {
      const response = await allApi.fetchPerformanceDataByEmployee(empId); // Adjusted API call
      console.log("Performance Data Response:", response); // Log the response
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response.data ||
          `Failed to fetch performance data for employee with id ${empId}`
      );
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
        typeof error.response.data === "string"
          ? error.response.data
          : "Failed to add training details"
      );
    }
  }
);

// Async thunk to update training details
export const updateTrainingDetails = createAsyncThunk(
  "performance/updateTrainingDetails",
  async (trainingData, { rejectWithValue }) => {
    try {
      const response = await allApi.updateTrainingDetails(trainingData);
      return response; // Return updated training data
    } catch (error) {
      return rejectWithValue(error.response.data.message || "Update failed");
    }
  }
);

// Async thunk to delete training details
export const deleteTrainingDetails = createAsyncThunk(
  "performance/deleteTrainingDetails",
  async (trainingId, { rejectWithValue }) => {
    try {
      await allApi.deleteTrainingDetails(trainingId);
      // Return the ID that was passed in
      return { id: trainingId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete training details"
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
      // Fetch training data
      .addCase(fetchTrainingData.fulfilled, (state, action) => {
        state.trainingData = action.payload;
        state.isLoading = false;
        state.snackbar = {
          open: true,
          message: "Training data fetched successfully!",
          severity: "success",
        };
      })
      .addCase(fetchTrainingData.rejected, (state, action) => {
        state.isLoading = false;
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })

      // Fetch performance data
      .addCase(fetchPerformanceData.fulfilled, (state, action) => {
        state.performanceData = action.payload;
        state.isLoading = false;
        state.snackbar = {
          open: true,
          message: "Performance data fetched successfully!",
          severity: "success",
        };
      })
      .addCase(fetchPerformanceData.rejected, (state, action) => {
        state.isLoading = false;
        state.snackbar = {
          open: true,
          message: action.payload,
          severity: "error",
        };
      })

      // Fetch performance data by employee
      .addCase(fetchPerformanceDataByEmployee.fulfilled, (state, action) => {
        state.performanceData = action.payload; // Ensure you set the data correctly
        state.isLoading = false;
      })
      .addCase(fetchPerformanceDataByEmployee.rejected, (state, action) => {
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
          (td) => td.trainingId === action.payload.trainingId
        );
        if (index !== -1) {
          state.trainingData[index] = action.payload; // Update training data in state
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
        if (action.payload && action.payload.id) {
          const filteredData = state.trainingData.filter(
            (item) => item.trainingId !== action.payload.id
          );
          state.trainingData = filteredData;
          state.snackbar = {
            open: true,
            message: "Training details deleted successfully",
            severity: "success",
          };
        } else {
          state.snackbar = {
            open: true,
            message: "Error: Invalid response from server",
            severity: "error",
          };
        }
      })
      .addCase(deleteTrainingDetails.rejected, (state, action) => {
        state.snackbar = {
          open: true,
          message:
            action.error?.message ||
            action.payload ||
            "Failed to delete training details",
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
