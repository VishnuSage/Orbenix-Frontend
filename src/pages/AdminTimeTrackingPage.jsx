import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Import the search icon
import { fetchEmployees } from "../redux/employeeSlice"; // Ensure this fetches from your API
import {
  selectDailyHours,
  selectFilteredEmployees,
} from "../redux/timeTrackingSlice"; // Import selectors from your slice

const AdminTimeTrackingPage = () => {
  const dispatch = useDispatch();

  // Access employees and status from the Redux store
  const { employees, status } = useSelector((state) => state.employees);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    // Fetch employee data if not already loaded
    if (status === "idle") {
      dispatch(fetchEmployees()); // This should now fetch from the API
    }
  }, [dispatch, status]);

  // Calculate daily hours using the selector
  const dailyHours = useSelector((state) => selectDailyHours(state, employees));

  // Filter employees based on search query using the selector
  const filteredEmployees = useSelector((state) =>
    selectFilteredEmployees(state, employees, searchQuery)
  );

  // Handle loading state
  if (status === "loading") {
    return <CircularProgress />;
  }

  // Handle error state
  if (status === "error") {
    return (
      <Typography color="error">
        Error loading employees. Please try again later.
      </Typography>
    );
  }

  // Check for empty filtered employees
  if (filteredEmployees.length === 0) {
    return <Typography>No employees found.</Typography>;
  }

  // Function to render status indicator
  const renderStatus = (isActive) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: isActive ? "green" : "red",
            marginRight: 8,
          }}
        />
        {isActive ? "Active" : "Inactive"}
      </div>
    );
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  return (
    <Box
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent background
        padding: "16px",
        borderRadius: "8px",
        boxShadow: 2,
        marginBottom: "16px",
      }}
    >
      <TextField
        variant="outlined"
        label="Search by Name or Employee ID" // Added label for shrinking effect
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        style={{ width: "100%", marginBottom: "16px" }} // Added margin for spacing
      />
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Employee ID
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Name
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Position
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Department
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Hours Worked Today
              </TableCell>
              <TableCell
                style={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((employee, index) => {
                const { totalSeconds, isActive } = dailyHours[
                  employee.empId
                ] || {
                  totalSeconds: 0,
                  isActive: false,
                };
                return (
                  <TableRow
                    key={employee.empId}
                    hover
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                    }}
                  >
                    <TableCell>{employee.empId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.position}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{(totalSeconds / 3600).toFixed(2)}</TableCell>
                    <TableCell>{renderStatus(isActive)}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEmployees.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default AdminTimeTrackingPage;
