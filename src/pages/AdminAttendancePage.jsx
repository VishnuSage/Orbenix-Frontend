import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAttendanceData,
  fetchLeaveRequestsData,
  approveLeaveRequest,
  rejectLeaveRequest,
  clearSnackbarMessage,
  calculateAttendanceMetrics,
  fetchAllLeaveRequestsData, // Use fetchAllLeaveRequestsData
  fetchAllAttendanceData,
  fetchAllEmployeesTimeData, // Import the new action
  setDateRange,
  clearDateRange,
} from "../redux/attendanceLeaveSlice";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import moment from "moment";
import TablePagination from "@mui/material/TablePagination";
import { useNotificationContext } from "../components/NotificationContext";
import { fetchEmployees } from "../redux/employeeSlice";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";

const localizer = momentLocalizer(moment);

const AdminAttendancePage = () => {
  const dispatch = useDispatch();
  const {
    attendanceData,
    leaveRequests = [],
    error,
    snackbarMessage,
    snackbarSeverity,
    allLeaveRequests,
    allAttendanceData,
    allEmployeesTimeData, // Use the new selector
    loadingEmployeesTime, // Use the new selector for loading state
    selectedDateRange,
  } = useSelector((state) => state.attendanceLeave);

  const [tabIndex, setTabIndex] = useState(0);
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  const [attendancePage, setAttendancePage] = useState(0);
  const [attendanceRowsPerPage, setAttendanceRowsPerPage] = useState(5);
  const [leaveRequestsPage, setLeaveRequestsPage] = useState(0);
  const [leaveRequestsRowsPerPage, setLeaveRequestsRowsPerPage] = useState(5);
  const [selectedFromDate, setSelectedFromDate] = useState(
    dayjs().startOf("month") // Now a Day.js object
  );
  const [selectedToDate, setSelectedToDate] = useState(
    dayjs().endOf("month") // Now a Day.js object
  );
  const [isLoading, setIsLoading] = useState(true);

  const { addNotifications } = useNotificationContext();

  useEffect(() => {
    dispatch(fetchEmployees()); // Fetch employees to get names for leave requests
  }, [dispatch]);

  useEffect(() => {
    // Fetch attendance data for all employees
    dispatch(fetchAllAttendanceData())
      .then((response) => {
        console.log("All Attendance Data:", response);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching all attendance data:", error);
        setIsLoading(false);
      });
  }, [dispatch]);

  // Fetch all employees' time data when the component mounts or when the date range changes
  useEffect(() => {
    const fetchData = async () => {
      const fromDate = dayjs(selectedFromDate).format("YYYY-MM-DD");
      const toDate = dayjs(selectedToDate).format("YYYY-MM-DD");

      await dispatch(
        fetchAllEmployeesTimeData({
          fromDate,
          toDate,
        })
      );
    };
    fetchData();
  }, [dispatch, selectedFromDate, selectedToDate]);

  // Fetch all leave requests when the component mounts
  useEffect(() => {
    dispatch(fetchAllLeaveRequestsData())
      .then((response) => {
        console.log("All Leave Requests:", response);
      })
      .catch((error) => {
        console.error("Error fetching all leave requests:", error);
      });
  }, [dispatch]);

  const handleApproveLeave = (requestId) => {
    dispatch(approveLeaveRequest({ requestId }));
    const leaveRequest = allLeaveRequests.find(
      (req) => req.leaveRequestId === requestId
    );
    if (leaveRequest) {
      addNotifications([
        {
          type: "success",
          text: `Leave request for ${leaveRequest.name} has been approved.`,
        },
      ]);
    }
  };

  const handleRejectLeave = (requestId) => {
    dispatch(rejectLeaveRequest({ requestId }));
    const leaveRequest = allLeaveRequests.find(
      (req) => req.leaveRequestId === requestId
    );
    if (leaveRequest) {
      addNotifications([
        {
          type: "error",
          text: `Leave request for ${leaveRequest.name} has been rejected.`,
        },
      ]);
    }
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const filteredLeaveRequests = Array.isArray(allLeaveRequests)
    ? allLeaveRequests.filter((request) => {
        const trimmedQuery = leaveSearchQuery.trim().toLowerCase();
        return (
          request.empId.toLowerCase().includes(trimmedQuery) ||
          request.name.toLowerCase().includes(trimmedQuery)
        );
      })
    : [];

  const handleFilterAttendance = () => {
    const fromDate = selectedFromDate
      ? dayjs(selectedFromDate).format("YYYY-MM-DD") // Format the date to YYYY-MM-DD
      : null;
    const toDate = selectedToDate
      ? dayjs(selectedToDate).format("YYYY-MM-DD") // Format the date to YYYY-MM-DD
      : null;

    // Set the date range in the state
    dispatch(setDateRange({ fromDate, toDate }));

    // Fetch attendance data with the new date range
    dispatch(
      fetchAllEmployeesTimeData({
        fromDate: fromDate || dayjs().startOf("month").toISOString(),
        toDate: toDate || dayjs().endOf("month").toISOString(),
      })
    );

    setAttendancePage(0); // Reset the page to the first page
  };

  const filteredEmployeesTimeData = Array.isArray(allEmployeesTimeData)
    ? allEmployeesTimeData.filter((employee) => {
        const trimmedQuery = leaveSearchQuery.trim().toLowerCase();
        return (
          employee.empId.toLowerCase().includes(trimmedQuery) ||
          employee.name.toLowerCase().includes(trimmedQuery)
        );
      })
    : [];

  const handleResetFilter = () => {
    setSelectedFromDate(null);
    setSelectedToDate(null);
    dispatch(clearDateRange());
    const currentMonthStart = dayjs().startOf("month").toISOString();
    const currentMonthEnd = dayjs().endOf("month").toISOString();
    dispatch(
      fetchAllEmployeesTimeData({
        fromDate: currentMonthStart,
        toDate: currentMonthEnd,
      })
    );
  };

  const formatTotalHours = (totalHours) => {
    const hours = Math.floor(totalHours);
    const minutes = Math.floor((totalHours - hours) * 60);
    const seconds = Math.floor(((totalHours - hours) * 60 - minutes) * 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          padding: 3,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          sx={{
            mb: 3,
            "& .MuiTabs-flexContainer": { justifyContent: "space-around" },
            "& .MuiTab-root": {
              color: "#800080",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#800080",
            },
          }}
          variant="scrollable"
        >
          <Tab label="Attendance Status" />
          <Tab label="Leave Requests" />
        </Tabs>

        {tabIndex === 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
              >
                <DatePicker
                  label="From"
                  value={selectedFromDate}
                  onChange={(newValue) => setSelectedFromDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <DatePicker
                  label="To"
                  value={selectedToDate}
                  onChange={(newValue) => setSelectedToDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
                <Button
                  variant="contained"
                  onClick={handleFilterAttendance}
                  sx={{
                    backgroundColor: "#4B0082",
                    color: "white",
                  }}
                >
                  Filter
                </Button>
                <Button variant="outlined" onClick={handleResetFilter}>
                  Reset
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Employee ID
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Employee Name
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Days Present
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Days Absent
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                      >
                        Total Hours Worked
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingEmployeesTime ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : Array.isArray(filteredEmployeesTimeData) &&
                      filteredEmployeesTimeData.length > 0 ? (
                      filteredEmployeesTimeData.map((employee) => (
                        <TableRow key={employee.empId}>
                          <TableCell>{employee.empId}</TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.daysPresent}</TableCell>
                          <TableCell>{employee.daysAbsent}</TableCell>
                          <TableCell>
                            {formatTotalHours(employee.totalHoursWorked)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          No attendance data available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={
                    Array.isArray(filteredEmployeesTimeData)
                      ? filteredEmployeesTimeData.length
                      : 0
                  }
                  rowsPerPage={attendanceRowsPerPage}
                  page={attendancePage}
                  onPageChange={(event, newPage) => setAttendancePage(newPage)}
                  onRowsPerPageChange={(event) => {
                    setAttendanceRowsPerPage(parseInt(event.target.value, 10));
                    setAttendancePage(0);
                  }}
                />
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {tabIndex === 1 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <TextField
                id="search-leave-input"
                label="Search by Employee ID or Name"
                value={leaveSearchQuery}
                onChange={(e) => setLeaveSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              {isLoading ? (
                <CircularProgress />
              ) : Array.isArray(allLeaveRequests) &&
                allLeaveRequests.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          Employee ID
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          Leave Type
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          Start Date
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          End Date
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            backgroundColor: "#f5f5f5",
                          }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredLeaveRequests.map((request) => (
                        <TableRow key={request.leaveRequestId}>
                          <TableCell>{request.empId}</TableCell>
                          <TableCell>{request.name}</TableCell>
                          <TableCell>{request.type}</TableCell>
                          <TableCell>{request.startDate}</TableCell>
                          <TableCell>{request.endDate}</TableCell>
                          <TableCell>{request.status}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleApproveLeave(request.leaveRequestId)
                              }
                              disabled={request.status !== "Pending"}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleRejectLeave(request.leaveRequestId)
                              }
                              disabled={request.status !== "Pending"}
                            >
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredLeaveRequests.length}
                    rowsPerPage={leaveRequestsRowsPerPage}
                    page={leaveRequestsPage}
                    onPageChange={(event, newPage) =>
                      setLeaveRequestsPage(newPage)
                    }
                    onRowsPerPageChange={(event) => {
                      setLeaveRequestsRowsPerPage(
                        parseInt(event.target.value, 10)
                      );
                      setLeaveRequestsPage(0);
                    }}
                  />
                </TableContainer>
              ) : (
                <Typography>No leave requests found.</Typography>
              )}
            </CardContent>
          </Card>
        )}

        {error && (
          <Typography variant="body1" color="error">
            {error}
          </Typography>
        )}

        <Snackbar
          open={snackbarMessage !== ""}
          autoHideDuration={6000}
          onClose={() => dispatch(clearSnackbarMessage())}
        >
          <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

export default AdminAttendancePage;
