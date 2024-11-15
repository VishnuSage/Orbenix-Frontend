import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from "../services/allApi"; // Import the allApi file

const initialState = {
  selectedPayroll: null,
  filteredHistory: [],
  fromMonth: "",
  toMonth: "",
  activeTab: 0,
  loanAmount: "",
  repaymentDuration: "",
  loanAmountError: "",
  repaymentDurationError: "",
  loanRequests: [],
  notification: { message: "", type: "" },
  empId: "", // Employee ID for the logged-in user
  name: "", // Name for the logged-in user
  loanNumber: null,
  payrollData: {
    allPayrolls: [],
    employeePayroll: null, // To store specific employee payroll data
  },
  isLoadingPayrolls: false, // Loading state for payrolls
  isLoadingLoanRequests: false, // Loading state for loan requests
};

// Async thunk to fetch payrolls based on user role
export const fetchAllPayrolls = createAsyncThunk(
  "payroll/fetchAllPayrolls",
  async (empId, { getState }) => {
    const state = getState();
    const userRole = state.auth.userRole; // Assuming you have userRole in your auth slice

    const response = await allApi.fetchAllPayrolls(empId, userRole);
    return response; // Return the fetched payrolls
  }
);

// Async thunk to fetch specific payroll data for an employee
export const fetchEmployeePayroll = createAsyncThunk(
  "payroll/fetchEmployeePayroll",
  async (empId) => {
    const response = await allApi.fetchEmployeePayroll(empId);
    return response; // Return the fetched employee payroll data
  }
);

// Async thunk to fetch loan requests from the API
export const fetchLoanRequests = createAsyncThunk(
  "payroll/fetchLoanRequests",
  async (empId) => {
    const response = await allApi.fetchLoanRequests(empId);
    return response; // Return the fetched loan requests
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
    setLoanAmountError(state, action) {
      state.loanAmountError = action.payload;
    },
    setRepaymentDurationError(state, action) {
      state.repaymentDurationError = action.payload;
    },
    resetLoanForm(state) {
      state.loanAmount = "";
      state.repaymentDuration = "";
      state.loanAmountError = "";
      state.repaymentDurationError = "";
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
    addPayrollData(state, action) {
      const newPayroll = action.payload; // Expecting the new payroll data in the payload
      state.payrollData.allPayrolls.push(newPayroll); // Add the new payroll to the list
    },
    deletePayrollData(state, action) {
      const idToDelete = action.payload; // Expecting the ID of the payroll to delete
      state.payrollData.allPayrolls = state.payrollData.allPayrolls.filter(
        (payroll) => payroll.id !== idToDelete
      ); // Remove the payroll from the list
    },
    updatePayrollData(state, action) {
      const updatedPayroll = action.payload; // Expecting the updated payroll data in the payload
      const index = state.payrollData.allPayrolls.findIndex(
        (payroll) => payroll.id === updatedPayroll.id
      );

      if (index !== -1) {
        state.payrollData.allPayrolls[index] = updatedPayroll; // Update the payroll in the list
      }
    },
    filterPayrollData(state, action) {
      const { fromMonth, toMonth } = action.payload;

      if (!Array.isArray(state.payrollData.allPayrolls)) {
        console.error(
          "allPayrolls is not an array:",
          state.payrollData.allPayrolls
        );
        return; // Exit if it's not an array
      }

      state.filteredHistory = state.payrollData.allPayrolls.filter(
        (payroll) => {
          const payrollDate = new Date(payroll.month);
          return (
            payrollDate >= new Date(fromMonth) &&
            payrollDate <= new Date(toMonth)
          );
        }
      );
    },
    searchPayrollData(state, action) {
      const searchQuery = action.payload;
      // Implement search logic...
      state.filteredHistory = state.payrollData.allPayrolls.filter(
        (payroll) =>
          payroll.empId.toString().includes(searchQuery) ||
          payroll.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllPayrolls.pending, (state) => {
        state.isLoadingPayrolls = true; // Set loading state to true
      })
      .addCase(fetchAllPayrolls.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.payrollData.allPayrolls = action.payload; // Store fetched payrolls
        } else {
          console.error("Fetched payrolls are not an array:", action.payload);
          state.payrollData.allPayrolls = []; // Reset to empty array if not an array
        }
        state.isLoadingPayrolls = false; // Set loading state to false
      })
      .addCase(fetchAllPayrolls.rejected, (state) => {
        state.notification = {
          message: "Failed to fetch payrolls", // Set error message
          type: "error",
        };
        state.isLoadingPayrolls = false; // Set loading state to false
      })
      .addCase(fetchEmployeePayroll.fulfilled, (state, action) => {
        state.payrollData.employeePayroll = action.payload; // Store fetched employee payroll data
      })
      .addCase(fetchLoanRequests.pending, (state) => {
        state.isLoadingLoanRequests = true; // Set loading state to true
      })
      .addCase(fetchLoanRequests.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.loanRequests = action.payload; // Store fetched loan requests
        } else {
          console.error(
            "Fetched loan requests are not an array:",
            action.payload
          );
          state.loanRequests = []; // Reset to empty array if not an array
        }
        state.isLoadingLoanRequests = false; // Set loading state to false
      })
      .addCase(fetchLoanRequests.rejected, (state) => {
        state.notification = {
          message: "Failed to fetch loan requests", // Set error message
          type: "error",
        };
        state.isLoadingLoanRequests = false; // Set loading state to false
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
  setLoanAmountError,
  setRepaymentDurationError,
  resetLoanForm,
  setNotification,
  addLoanRequest,
  updateLoanRequestStatus,
  addPayrollData,
  deletePayrollData,
  updatePayrollData,
  filterPayrollData,
  searchPayrollData,
} = payrollSlice.actions;

export const selectPayroll = (state) => state.payroll;
export const selectLoanRequests = (state) => state.payroll.loanRequests || [];
export const selectEmployeePayroll = (state) =>
  state.payroll.payrollData.employeePayroll;

export default payrollSlice.reducer;
