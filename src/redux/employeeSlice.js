import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import allApi from './allApi'; // Import the allApi functions

// Async thunk for fetching employees from the API
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async () => {
    const response = await allApi.fetchEmployees();
    if (response.error) {
      throw new Error(response.message);
    }
    return response; // Assuming the API returns an array of employee objects including roles
  }
);

// Async thunk for adding an employee to the API
export const addEmployeeAsync = createAsyncThunk(
  "employees/addEmployee",
  async (employee) => {
    const response = await allApi.addEmployee(employee);
    if (response.error) {
      throw new Error(response.message);
    }
    return response; // Assuming the API returns the added employee object including roles
  }
);

// Async thunk for updating an employee in the API
export const updateEmployeeAsync = createAsyncThunk(
  "employees/updateEmployee",
  async (employee) => {
    const response = await allApi.updateEmployee(employee);
    if (response.error) {
      throw new Error(response.message);
    }
    return response; // Assuming the API returns the updated employee object including roles
  }
);

// Async thunk for deleting an employee from the API
export const deleteEmployeeAsync = createAsyncThunk(
  "employees/deleteEmployee",
  async (empId) => {
    const response = await allApi.deleteEmployee(empId);
    if (response.error) {
      throw new Error(response.message);
    }
    return empId; // Return the empId of the deleted employee
  }
);

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [], // Start with an empty array
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.employees = action.payload; // Use data from API
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addEmployeeAsync.fulfilled , (state, action) => {
        state.employees.push(action.payload); // Use data from API
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (emp) => emp.empId === action.payload.empId
        );
        if (index !== -1) {
          state.employees[index] = action.payload; // Update employee details including roles
        }
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (emp) => emp.empId !== action.payload // Remove employee from the state
        );
      });
  },
});

// Selector to check if an employee exists
export const selectEmployeeExists = (state, { email, phone }) =>
  state.employees.employees.some(
    (emp) => emp.email === email || emp.phone === phone
  );

export default employeeSlice.reducer;