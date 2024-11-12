import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAttendanceRequest,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  fetchLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
} from "../redux/attendanceLeaveSlice"; // Adjust the import path as necessary
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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import moment from "moment";
import TablePagination from "@mui/material/TablePagination";
import "react-big-calendar/lib/css/react-big-calendar.css";

const AdminAttendancePage = () => {
  const dispatch = useDispatch();
  const { attendanceData, leaveRequests, error } = useSelector(
    (state) => state.attendanceLeave
  );

  const [attendanceMetrics, setAttendanceMetrics] = useState({
    presentCount: 0,
    absentCount: 0,
    totalHours: 0,
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [tabIndex, setTabIndex] = useState(0); // State for managing tab index
  const [leaveHistory, setLeaveHistory] = useState([]); // State for leave history
  const [originalLeaveHistory, setOriginalLeaveHistory] = useState([]);

  const [attendancePage, setAttendancePage] = useState(0);
  const [attendanceRowsPerPage, setAttendanceRowsPerPage] = useState(5);
  const [leaveRequestsPage, setLeaveRequestsPage] = useState(0);
  const [leaveRequestsRowsPerPage, setLeaveRequestsRowsPerPage] = useState(5);
  const [leaveHistoryPage, setLeaveHistoryPage] = useState(0);
  const [leaveHistoryRowsPerPage, setLeaveHistoryRowsPerPage] = useState(5);
  const [filteredLeaveHistory, setFilteredLeaveHistory] = useState([]);
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  // For Attendance Status
  const [fromDateAttendance, setFromDateAttendance] = useState(new Date());
  const [toDateAttendance, setToDateAttendance] = useState(new Date());

  // For Leave History
  const [fromDateLeaveHistory, setFromDateLeaveHistory] = useState(new Date());
  const [toDateLeaveHistory, setToDateLeaveHistory] = useState(new Date());

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Filter state
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAttendanceData = async () => {
      dispatch(fetchAttendanceRequest());
      try {
        // Simulate an API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const dummyAttendanceData = {
          totalDays: 31,
          attendance: [
            {
              date: "2024-10-01",
              employeeId: "EMP001",
              employeeName: "John Doe", // Added employee name
              status: "present",
              hoursWorked: "5:30:00",
            },
            {
              date: "2024-10-02",
              employeeId: "EMP001",
              employeeName: "John Doe", // Added employee name
              status: "absent",
              hoursWorked: "0:00:00",
            },
            {
              date: "2024-10-01",
              employeeId: "EMP002",
              employeeName: "Jane Smith", // Added employee name
              status: "present",
              hoursWorked: "3:15:00",
            },
            // Add more attendance records as needed
          ],
          remainingLeave: {
            EMP001: 5,
            EMP002: 3,
          },
        };
        const dummyLeaveRequests = [
          {
            id: 1,
            employeeId: "EMP001",
            name: "John Doe",
            type: "Sick Leave",
            startDate: "2024-10-01",
            endDate: "2024-10-01",
            status: "Pending",
          },
          // Add more dummy leave requests as needed
        ];

        // Dummy leave history data
        const dummyLeaveHistory = [
          {
            employeeId: "EMP001",
            name: "John Doe",
            type: "Sick Leave",
            startDate: "2024-09-01",
            endDate: "2024-09-02",
            status: "Approved",
          },
          {
            employeeId: "EMP001",
            name: "John Doe",
            type: "Vacation",
            startDate: "2024-08-15",
            endDate: "2024-08-20",
            status: "Approved",
          },
          {
            employeeId: "EMP002",
            name: "Jane Smith",
            type: "Sick Leave",
            startDate: "2024-09-10",
            endDate: "2024-09-12",
            status: "Rejected ",
          },
        ];

        dispatch(fetchAttendanceSuccess(dummyAttendanceData));
        dispatch(fetchLeaveRequests(dummyLeaveRequests));
        setLeaveHistory(dummyLeaveHistory);
        setOriginalLeaveHistory(dummyLeaveHistory); // Store original leave history
      } catch (error) {
        dispatch(fetchAttendanceFailure(error.message));
      }
    };
    fetchAttendanceData();
  }, [dispatch]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Adjust the delay as necessary

  const handleApproveLeave = (requestId) => {
    const requestToApprove = leaveRequests.find(
      (request) => request.id === requestId
    );

    // Check if the request is already approved or rejected
    if (requestToApprove && requestToApprove.status === "Pending") {
      // Calculate the number of days requested
      const startDate = new Date(requestToApprove.startDate);
      const endDate = new Date(requestToApprove.endDate);
      const daysRequested =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Calculate number of days requested

      // Dispatch the approve action
      dispatch(approveLeaveRequest({ requestId }));

      // Update the remaining leave balance
      const updatedRemainingLeave = {
        ...attendanceData.remainingLeave,
        [requestToApprove.employeeId]:
          attendanceData.remainingLeave[requestToApprove.employeeId] -
          daysRequested,
      };

      // Update the attendance data in the store
      dispatch(
        fetchAttendanceSuccess({ remainingLeave: updatedRemainingLeave })
      );

      // Show success message
      setSnackbarMessage("Leave request approved successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  };

  const handleRejectLeave = (requestId) => {
    dispatch(rejectLeaveRequest({ requestId }));
    setSnackbarMessage("Leave request rejected successfully!");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  };

  const calculateAttendanceMetrics = (attendanceRecords) => {
    let presentCount = 0;
    let absentCount = 0;
    let totalHours = 0;

    attendanceRecords.forEach((record) => {
      if (record.status === "present") {
        presentCount++;
        if (record.hoursWorked) {
          // Check if hoursWorked is defined
          const [hours, minutes, seconds] = record.hoursWorked.split(":");
          totalHours +=
            parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
        }
      } else if (record.status === "absent") {
        absentCount++;
      }
    });

    return {
      presentCount,
      absentCount,
      totalHours: (totalHours / 3600).toFixed(2), // Convert total hours to hours and format
    };
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const handleFilterLeaveHistory = () => {
    const filteredLeaveHistory = originalLeaveHistory.filter((record) => {
      const recordStartDate = new Date(record.startDate);
      const recordEndDate = new Date(record.endDate);
      return (
        recordStartDate >= fromDateLeaveHistory &&
        recordEndDate <= toDateLeaveHistory
      );
    });

    // Update the leave history with the filtered results
    setLeaveHistory(filteredLeaveHistory);
  };

  const handleResetLeaveHistoryFilters = () => {
    setFromDateLeaveHistory(new Date());
    setToDateLeaveHistory(new Date());
    // Reset leave history to show all records
    setLeaveHistory(originalLeaveHistory); // Assuming originalLeaveHistory holds all leave records
  };

  const handleFilterAttendance = () => {
    const filteredAttendance = attendanceData.attendance.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= fromDateAttendance && recordDate <= toDateAttendance;
    });

    // Update the attendance metrics based on the filtered data
    const employeeMetrics = {};

    filteredAttendance.forEach((record) => {
      const employeeId = record.employeeId;
      if (!employeeMetrics[employeeId]) {
        employeeMetrics[employeeId] = {
          presentCount: 0,
          absentCount: 0,
          totalHours: 0,
        };
      }

      if (record.status === "present") {
        employeeMetrics[employeeId].presentCount++;
        if (record.hoursWorked) {
          const [hours, minutes, seconds] = record.hoursWorked.split(":");
          employeeMetrics[employeeId].totalHours +=
            parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
        }
      } else if (record.status === "absent") {
        employeeMetrics[employeeId].absentCount++;
      }
    });

    // Update the state or perform necessary actions to reflect the filtered data
    setAttendanceMetrics(employeeMetrics);
  };

  const handleResetAttendanceFilters = () => {
    setFromDateAttendance(new Date());
    setToDateAttendance(new Date());
    // Reset attendance metrics to reflect the current month
    const currentMonthAttendance = attendanceData.attendance.filter(
      (record) => {
        const recordDate = new Date(record.date);
        return (
          recordDate.getMonth() === new Date().getMonth() &&
          recordDate.getFullYear() === new Date().getFullYear()
        );
      }
    );
    const { presentCount, absentCount, totalHours } =
      calculateAttendanceMetrics(currentMonthAttendance);
    setAttendanceMetrics({ presentCount, absentCount, totalHours });
  };

  const handleSearch = () => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    const recordsToSearch =
      filteredLeaveHistory.length > 0
        ? filteredLeaveHistory
        : originalLeaveHistory;

    const searchedHistory = recordsToSearch.filter((history) => {
      return (
        history.employeeId.toLowerCase().includes(trimmedQuery) ||
        history.name.toLowerCase().includes(trimmedQuery)
      );
    });

    setLeaveHistory(searchedHistory);
  };

  const recordsToShow =
    leaveHistory.length > 0 ? leaveHistory : originalLeaveHistory;

  useEffect(() => {
    // Apply search whenever the search query changes
    handleSearch();
  }, [debouncedSearchQuery]);

  const filteredAttendanceRecords = attendanceData.attendance.filter(
    (record) => {
      const trimmedQuery = searchQuery.trim().toLowerCase();
      return (
        record.employeeId.toLowerCase().includes(trimmedQuery) ||
        record.employeeName.toLowerCase().includes(trimmedQuery)
      );
    }
  );

  return (
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
            color: "#800080", // Set tab text color to purple
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#800080", // Set underline color to purple
          },
        }}
        variant="scrollable"
      >
        <Tab label="Attendance Status" />
        <Tab label="Leave Requests" />
        <Tab label="Leave History" />
      </Tabs>

      {tabIndex === 0 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                label="From"
                type="date"
                value={moment(fromDateAttendance).format("YYYY-MM-DD")}
                onChange={(e) =>
                  setFromDateAttendance(new Date(e.target.value))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="To"
                type="date"
                value={moment(toDateAttendance).format("YYYY-MM-DD")}
                onChange={(e) => setToDateAttendance(new Date(e.target.value))}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flexGrow: 1 }}
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
              <Button variant="outlined" onClick={handleResetAttendanceFilters}>
                Reset
              </Button>
            </Box>
            <Box sx={{ mb: 2 }}>
              <TextField
                id="search-attendance-input"
                label="Search by Employee ID or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
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
                  {Array.from(
                    new Set(filteredAttendanceRecords.map((a) => a.employeeId))
                  )
                    .slice(
                      attendancePage * attendanceRowsPerPage,
                      attendancePage * attendanceRowsPerPage +
                        attendanceRowsPerPage
                    )
                    .map((employeeId) => {
                      const employeeRecords = filteredAttendanceRecords.filter(
                        (record) => record.employeeId === employeeId
                      );
                      const { presentCount, absentCount, totalHours } =
                        calculateAttendanceMetrics(employeeRecords); // Calculate metrics for this employee

                      const employeeName =
                        employeeRecords[0]?.employeeName || "Unknown";

                      return (
                        <TableRow
                          key={employeeId}
                          sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
                        >
                          <TableCell
                            component="th"
                            scope="row"
                            sx={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {employeeId}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {employeeName}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {presentCount}{" "}
                            {/* Use the calculated present count */}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {absentCount}{" "}
                            {/* Use the calculated absent count */}
                          </TableCell>
                          <TableCell
                            sx={{ border: "1px solid #ddd", padding: "8px" }}
                          >
                            {totalHours} hours{" "}
                            {/* Use the calculated total hours */}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={attendanceData.attendance.length}
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
            <Box sx={{ mb: 2 }}>
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
            </Box>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table ">
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
                      Name
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Leave Type
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Actions
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Leave Balance
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveRequests
                    .filter((request) => {
                      const trimmedQuery = leaveSearchQuery
                        .trim()
                        .toLowerCase();
                      return (
                        request.employeeId
                          .toLowerCase()
                          .includes(trimmedQuery) ||
                        request.name.toLowerCase().includes(trimmedQuery)
                      );
                    })
                    .slice(
                      leaveRequestsPage * leaveRequestsRowsPerPage,
                      leaveRequestsPage * leaveRequestsRowsPerPage +
                        leaveRequestsRowsPerPage
                    )
                    .map((request) => (
                      <TableRow
                        key={request.id}
                        sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {request.employeeId}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {request.name}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {request.type}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {request.startDate}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {request.endDate}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {request.status}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleApproveLeave(request.id)}
                              disabled={request.status !== "Pending"}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleRejectLeave(request.id)}
                              disabled={request.status !== "Pending"}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {attendanceData.remainingLeave[request.employeeId]}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={leaveRequests.length}
                rowsPerPage={leaveRequestsRowsPerPage}
                page={leaveRequestsPage}
                onPageChange={(event, newPage) => setLeaveRequestsPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setLeaveRequestsRowsPerPage(parseInt(event.target.value, 10));
                  setLeaveRequestsPage(0);
                }}
              />
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {tabIndex === 2 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                label="From"
                type="date"
                value={moment(fromDateLeaveHistory).format("YYYY-MM-DD")}
                onChange={(e) =>
                  setFromDateLeaveHistory(new Date(e.target.value))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="To"
                type="date"
                value={moment(toDateLeaveHistory).format("YYYY-MM-DD")}
                onChange={(e) =>
                  setToDateLeaveHistory(new Date(e.target.value))
                }
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleFilterLeaveHistory}
                sx={{
                  backgroundColor: "#4B0082",
                  color: "white",
                }}
              >
                Filter
              </Button>
              <Button
                variant="outlined"
                onClick={handleResetLeaveHistoryFilters}
              >
                Reset
              </Button>
            </Box>

            <Box sx={{ mb: 2 }}>
              <TextField
                id="search-input"
                label="Search by Employee ID or Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
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
                      Name
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Leave Type
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Start Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      End Date
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                    >
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveHistory
                    .slice(
                      leaveHistoryPage * leaveHistoryRowsPerPage,
                      leaveHistoryPage * leaveHistoryRowsPerPage +
                        leaveHistoryRowsPerPage
                    )
                    .map((history, index) => (
                      <TableRow
                        key={index}
                        sx={{ "&:hover": { backgroundColor: "#e0e0e0" } }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {history.employeeId}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {history.name}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {history.type}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {history.startDate}
                        </TableCell>
                        <TableCell
                          sx={{ border: "1px solid #ddd", padding: "8px" }}
                        >
                          {history.endDate}
                        </TableCell>
                        <TableCell
                          sx={{
                            border: "1px solid #ddd",
                            padding: "8px",
                            color:
                              history.status.trim() === "Approved"
                                ? "green"
                                : history.status.trim() === "Rejected"
                                  ? "red"
                                  : "black",
                          }}
                        >
                          {history.status}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={recordsToShow.length}
                rowsPerPage={leaveHistoryRowsPerPage}
                page={leaveHistoryPage}
                onPageChange={(event, newPage) => setLeaveHistoryPage(newPage)}
                onRowsPerPageChange={(event) => {
                  setLeaveHistoryRowsPerPage(parseInt(event.target.value, 10));
                  setLeaveHistoryPage(0);
                }}
              />
            </TableContainer>
          </CardContent>
        </Card>
      )}
      {error && (
        <Typography variant="body1" color="error">
          {error}
        </Typography>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAttendancePage;
