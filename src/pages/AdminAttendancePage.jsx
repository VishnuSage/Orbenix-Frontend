import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAttendanceData,
  fetchLeaveRequestsData,
  approveLeaveRequest,
  rejectLeaveRequest,
  clearSnackbarMessage,
  calculateAttendanceMetrics, // Import the action
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
import { useNotificationContext } from "../components/NotificationContext";

const AdminAttendancePage = () => {
  const dispatch = useDispatch();
  const {
    attendanceData,
    leaveRequests = [],
    error,
    snackbarMessage,
    snackbarSeverity,
  } = useSelector((state) => state.attendanceLeave);

  const [tabIndex, setTabIndex] = useState(0);
  const [leaveSearchQuery, setLeaveSearchQuery] = useState("");
  const [attendancePage, setAttendancePage] = useState(0);
  const [attendanceRowsPerPage, setAttendanceRowsPerPage] = useState(5);
  const [leaveRequestsPage, setLeaveRequestsPage] = useState(0);
  const [leaveRequestsRowsPerPage, setLeaveRequestsRowsPerPage] = useState(5);
  const [fromDateAttendance, setFromDateAttendance] = useState(new Date());
  const [toDateAttendance, setToDateAttendance] = useState(new Date());
  const [filteredAttendanceData, setFilteredAttendanceData] = useState(
    attendanceData.attendance
  );

  const { addNotifications } = useNotificationContext(); // Access the notification context

  useEffect(() => {
    dispatch(fetchAttendanceData()); // Fetch attendance data
    dispatch(fetchLeaveRequestsData()); // Fetch leave requests
  }, [dispatch]);

  useEffect(() => {
    dispatch(calculateAttendanceMetrics(filteredAttendanceData)); // Dispatch action to calculate metrics
  }, [filteredAttendanceData, dispatch]);

  const handleApproveLeave = (requestId) => {
    dispatch(approveLeaveRequest({ requestId }));
    const leaveRequest = leaveRequests.find((req) => req.id === requestId);
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
    const leaveRequest = leaveRequests.find((req) => req.id === requestId);
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

  const filteredLeaveRequests = Array.isArray(leaveRequests)
    ? leaveRequests.filter((request) => {
        const trimmedQuery = leaveSearchQuery.trim().toLowerCase();
        return (
          request.empId.toLowerCase().includes(trimmedQuery) ||
          request.name.toLowerCase().includes(trimmedQuery)
        );
      })
    : [];

  const handleFilterAttendance = () => {
    const fromDate = moment(fromDateAttendance);
    const toDate = moment(toDateAttendance);

    const filteredData = attendanceData.attendance.filter((record) => {
      const recordDate = moment(record.date);
      return recordDate.isBetween(fromDate, toDate, null, "[]"); // Inclusive
    });

    setFilteredAttendanceData(filteredData);
    setAttendancePage(0); // Reset to the first page
  };

  const handleResetFilter = () => {
    setFilteredAttendanceData(attendanceData.attendance); // Reset to full attendance data
    setFromDateAttendance(new Date());
    setToDateAttendance(new Date());
  };

  // If no filter is applied, show current month data
  const currentMonthAttendanceData = attendanceData.attendance.filter(
    (record) => {
      return moment(record.date).isSame(moment(), "month");
    }
  );

  const attendanceToDisplay =
    attendanceData.metrics.length > 0
      ? attendanceData.metrics
      : currentMonthAttendanceData;

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
                  {attendanceToDisplay.map((record) => (
                    <TableRow key={record.empId}>
                      <TableCell>{record.empId}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.daysPresent}</TableCell>
                      <TableCell>{record.daysAbsent}</TableCell>
                      <TableCell>{record.totalHoursWorked}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={attendanceToDisplay.length}
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
                      Name{" "}
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
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaveRequests.map((request) => (
                    <TableRow key={request.id}>
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
  );
};

export default AdminAttendancePage;
