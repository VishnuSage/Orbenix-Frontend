import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  performanceData: [],
  trainingData: [], // Change trainingData to trainingData (array to hold multiple training records)
  isLoading: true,
};

const performanceSlice = createSlice({
  name: "performance",
  initialState,
  reducers: {
    setPerformanceData(state, action) {
      state.performanceData = action.payload;
      state.isLoading = false;
    },
    setTrainingDetails(state, action) {
      state.trainingData = action.payload; // Update to set the entire training data
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    addPerformanceData(state, action) {
      state.performanceData.push(action.payload);
    },
    updatePerformanceData(state, action) {
      const index = state.performanceData.findIndex(
        (item) =>
          item.month === action.payload.month &&
          item.employeeId === action.payload.employeeId
      );
      if (index !== -1) {
        state.performanceData[index] = action.payload;
      }
    },
    deletePerformanceData(state, action) {
      state.performanceData = state.performanceData.filter(
        (item) =>
          !(
            item.month === action.payload.month &&
            item.employeeId === action.payload.employeeId
          )
      );
    },
    addTrainingDetails(state, action) {
      // New action to add training details
      if (!state.trainingData) {
        state.trainingData = []; // Ensure trainingData is initialized
      }
      state.trainingData.push(action.payload);
    },
    updateTrainingDetails(state, action) {
      // New action to update training details
      const index = state.trainingData.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.trainingData[index] = action.payload;
      }
    },
    deleteTrainingDetails(state, action) {
      // New action to delete training details
      state.trainingData = state.trainingData.filter(
        (item) => item.id !== action.payload
      );
    },
  },
});

// Export actions
export const {
  setPerformanceData,
  setTrainingDetails,
  setLoading,
  addPerformanceData,
  updatePerformanceData,
  deletePerformanceData,
  addTrainingDetails, // Export new action
  updateTrainingDetails, // Export new action
  deleteTrainingDetails, // Export new action
} = performanceSlice.actions;

// Export the reducer
export default performanceSlice.reducer;
