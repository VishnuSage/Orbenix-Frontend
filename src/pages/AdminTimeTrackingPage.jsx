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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search"; // Import the search icon
import { fetchEmployees } from "../redux/employeeSlice";

const AdminTimeTrackingPage = () => {
  const dispatch = useDispatch();

  // Access employees and status from the Redux store
  const { employees, status } = useSelector((state) => state.employees);
  const [dailyHours, setDailyHours] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    // Fetch employee data if not already loaded
    if (status === "idle") {
      dispatch(fetchEmployees());
    }
  }, [dispatch, status]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    const calculatedHours = {};
    employees.forEach((employee) => {
      let totalSeconds = 0;
      let isActive = false; // Track if the employee is active

      employee.events &&
        employee.events.forEach((event) => {
          const eventDate = event.start.split("T")[0];
          if (eventDate === today) {
            // Make sure event.title exists and is in the correct format
            const timeParts = event.title && event.title.split(":");
            if (timeParts && timeParts.length === 3) {
              const hours = parseInt(timeParts[0], 10);
              const minutes = parseInt(timeParts[1], 10);
              const seconds = parseInt(timeParts[2], 10);
              totalSeconds += hours * 3600 + minutes * 60 + seconds;
            }
            // Check if the employee is active based on the event
            if (event.isClockedIn) {
              isActive = true;
            }
          }
        });
      calculatedHours[employee.id] = {
        totalSeconds,
        isActive,
      };
    });

    setDailyHours(calculatedHours);
  }, [employees]);

  // Handle loading state
  if (status === "loading") {
    return <CircularProgress />;
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

  // Filter employees based on search query
  const filteredEmployees = employees.filter((employee) => {
    const lowercasedQuery = searchQuery.trim().toLowerCase(); // Trim and convert to lowercase
    const employeeId = employee.id.toString(); // Ensure employee ID is a string
    const employeeName = employee.name.toLowerCase(); // Convert employee name to lowercase

    // Debugging output
    console.log(
      `Searching for: "${lowercasedQuery}" in Employee ID: "${employeeId}" and Name: "${employee.name}"`
    );

    return (
      employeeName.includes(lowercasedQuery) || // Check employee name
      employeeId.toLowerCase().includes(lowercasedQuery) // Check employee ID
    );
  });

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
                const { totalSeconds, isActive } = dailyHours[employee.id] || {
                  totalSeconds: 0,
                  isActive: false,
                };
                return (
                  <TableRow
                    key={employee.id}
                    hover
                    style={{
                      backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff",
                    }}
                  >
                    <TableCell>{employee.id}</TableCell>
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
