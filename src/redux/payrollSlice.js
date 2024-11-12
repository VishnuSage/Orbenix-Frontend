import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  selectedPayroll: null,
  filteredHistory: [],
  fromMonth: "",
  toMonth: "",
  activeTab: 0,
  loanAmount: "",
  repaymentDuration: "",
  loanRequests: [],
  notification: { message: "", type: "" },
  empId: "", // Employee ID for the logged-in user
  name: "", // Name for the logged-in user
  loanNumber: null,
  payrollData: {
    allPayrolls: [],
    employeePayroll: null, // To store specific employee payroll data
  },
  isLoading: false, // Loading state for API calls
};

// Async thunk to fetch payrolls based on user role
export const fetchAllPayrolls = createAsyncThunk(
  "payroll/fetchAllPayrolls",
  async (empId, { getState }) => {
    const state = getState();
    const userRole = state.auth.userRole; // Assuming you have userRole in your auth slice

    const endpoint =
      userRole === "admin" ? `/api/payrolls` : `/api/payrolls?empId=${empId}`;
    const response = await axios.get(endpoint);
    return response.data; // Return the fetched payrolls
  }
);

// Async thunk to fetch specific payroll data for an employee
export const fetchEmployeePayroll = createAsyncThunk(
  "payroll/fetchEmployeePayroll",
  async (empId) => {
    const response = await axios.get(`/api/employees/${empId}/payroll`);
    return response.data; // Return the fetched employee payroll data
  }
);

// Async thunk to fetch loan requests from the API
export const fetchLoanRequests = createAsyncThunk(
  "payroll/fetchLoanRequests",
  async (empId) => {
    const response = await axios.get(`/api/loanRequests?empId=${empId}`);
    return response.data; // Return the fetched loan requests
  }
);

// Function to generate a shorter loan number
const generateShortLoanNumber = () => {
  const timestamp = Date.now().toString(36);
  const randomNum = Math.floor(Math.random() * 10000).toString(36);
  return `LN-${timestamp}-${randomNum}`;
};

// Function to calculate monthly payment
const calculateMonthlyPayment = (principal, duration, interestRate = 0) => {
  const monthlyInterestRate = interestRate / 1200;
  if (monthlyInterestRate === 0) {
    return (principal / duration).toFixed(2);
  }
  const monthlyPayment =
    (principal *
      monthlyInterestRate *
      Math.pow(1 + monthlyInterestRate, duration)) /
    (Math.pow(1 + monthlyInterestRate, duration) - 1);
  return monthlyPayment.toFixed(2);
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    setSelectedPayroll(state, action) {
      state.selectedPayroll = action.payload;
    },
    setFilteredHistory(state, action) {
      state.filteredHistory = action.payload;
    },
    setFromMonth(state, action) {
      state.fromMonth = action.payload;
    },
    setToMonth(state, action) {
      state.toMonth = action.payload;
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setLoanAmount(state, action) {
      state.loanAmount = action.payload;
    },
    setRepaymentDuration(state, action) {
      state.repaymentDuration = action.payload;
    },
    setNotification(state, action) {
      state.notification = action.payload;
    },
    addLoanRequest(state, action) {
      const newLoanRequest = {
        ...action.payload,
        loanNumber: generateShortLoanNumber(),
        status: "Pending",
        approvedDate: null,
        monthlyPayment: null,
        remainingBalance: null,
        paymentHistory: [],
        requestedDate: new Date().toISOString(),
      };
      state.loanRequests.push(newLoanRequest);
    },
    updateLoanRequestStatus(state, action) {
      const { loanNumber, status } = action.payload;
      const loanIndex = state.loanRequests.findIndex(
        (loan) => loan.loanNumber === loanNumber
      );

      if (loanIndex !== -1) {
        state.loanRequests[loanIndex].status = status;

        if (status === "Approved") {
          const principal = state.loanRequests[loanIndex].amount;
          const duration = state.loanRequests[loanIndex].duration;
          const monthlyPayment = calculateMonthlyPayment(principal, duration);
          state.loanRequests[loanIndex].monthlyPayment = monthlyPayment;
          state.loanRequests[loanIndex].remainingBalance = principal; // Set initial remaining balance to principal
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPayrolls.pending, (state) => {
        state.isLoading = true; // Set loading state to true
      })
      .addCase(fetchAllPayrolls.fulfilled, (state, action) => {
        state.payrollData.allPayrolls = action.payload; // Store fetched payrolls
        state.isLoading = false; // Set loading state to false
      })
      .addCase(fetchAllPayrolls.rejected, (state) => {
        state.notification = {
          message: "Failed to fetch payrolls", // Set error message
          type: "error",
        };
        state.isLoading = false; // Set loading state to false
      })
      .addCase(fetchEmployeePayroll.fulfilled, (state, action) => {
        state.payrollData.employeePayroll = action.payload; // Store fetched employee payroll data
      })
      .addCase(fetchLoanRequests.fulfilled, (state, action) => {
        state.loanRequests = action.payload; // Store fetched loan requests
      });
  },
});

// Export actions and selectors
export const {
  setSelectedPayroll,
  setFilteredHistory,
  setFromMonth,
  setToMonth,
  setActiveTab,
  setLoanAmount,
  setRepaymentDuration,
  setNotification,
  addLoanRequest,
  updateLoanRequestStatus,
} = payrollSlice.actions;

export const selectPayroll = (state) => state.payroll;
export const selectLoanRequests = (state) => state.payroll.loanRequests;
export const selectEmployeePayroll = (state) => state.payroll.payrollData.employeePayroll;

export default payrollSlice.reducer;
