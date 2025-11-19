import { useEffect, useState } from "react";
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
import { fetchEmployees } from "../redux/employeeSlice"; // Adjust the path as needed
import { fetchDailyStatus } from "../redux/timeTrackingSlice"; // Import selectors from your slice

const AdminTimeTrackingPage = () => {
  const dispatch = useDispatch();

  const employees = useSelector((state) => state.employees.employees);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [isLoading, setIsLoading] = useState(true);
  const [dailyHours, setDailyHours] = useState({});
  const [dailyStatusForEmployees, setDailyStatusForEmployees] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Fetch employee data if not already loaded
      if (employees.length === 0) {
        await dispatch(fetchEmployees());
      }

      // Fetch daily hours and status for each employee
      const dailyHoursData = {};
      const employeeDailyStatus = {};
      for (const employee of employees) {
        const response = await dispatch(
          fetchDailyStatus({ empId: employee.empId, date: new Date() })
        );
        console.log(
          "Daily Status Response for Employee:",
          employee.empId,
          response
        );
        dailyHoursData[employee.empId] = response.payload.totalHours || 0; // Store the total hours
        employeeDailyStatus[employee.empId] = response.payload; // Store the entire dailyStatus object
      }
      setDailyHours(dailyHoursData);
      setDailyStatusForEmployees(employeeDailyStatus);
      setIsLoading(false);
    };

    fetchData();
  }, [dispatch, employees]);

  // Function to format total hours
  const formatTotalHours = (totalHours) => {
    const totalSeconds = Math.floor(totalHours * 3600); // Convert hours to seconds

    // If totalSeconds is less than 1, return a message indicating less than a minute
    if (totalSeconds < 1) return "Less than a minute"; // Return a message for very small values

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Return formatted time
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Filter employees based on search query using the selector
  const filterEmployees = (employees, searchQuery) => {
    if (!searchQuery) {
      return employees;
    }

    return employees.filter((employee) => {
      return (
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.empId.toString().includes(searchQuery)
      );
    });
  };

  const filteredEmployees = filterEmployees(employees, searchQuery);

  const status = useSelector((state) => state.employees.status);

  // Handle loading state
  if (isLoading) {
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
  const renderStatus = (isCurrentlyClocked) => {
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: isCurrentlyClocked ? "green" : "red",
            marginRight: 8,
          }}
        />
        {isCurrentlyClocked ? "Active" : "Inactive"}
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
                const totalHours = dailyHours[employee.empId] || 0; // Get total hours for the employee
                const formattedTime = formatTotalHours(totalHours);
                const isCurrentlyClocked =
                  dailyStatusForEmployees[employee.empId]?.isCurrentlyClocked ||
                  false;

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
                    <TableCell>{formattedTime}</TableCell>
                    <TableCell>{renderStatus(isCurrentlyClocked)}</TableCell>
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
