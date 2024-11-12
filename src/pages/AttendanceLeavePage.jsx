import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logAttendance } from "../redux/attendanceLeaveSlice"; // Import the logAttendance action
import {
  fetchAttendanceRequest,
  fetchAttendanceSuccess,
  fetchAttendanceFailure,
  submitLeaveRequest,
  fetchLeaveRequests,
  clearSuccessMessage,
} from "../redux/attendanceLeaveSlice"; // Adjust the import path as necessary
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";

const localizer = momentLocalizer(moment);

const LEAVE_TYPES = [
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Emergency Leave", label: "Emergency Leave" },
  { value: "Others", label: "Others" },
];

// Styled Typography for Gradient Text
const GradientText = styled(Typography)(({ theme }) => ({
  background:
    "linear-gradient(90deg, rgba(128,0,128,1) 0%, rgba(0,0,0,1) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: "bold",
  marginBottom: "16px",
}));

const SubHeading = styled(Typography)(({ theme }) => ({
  fontWeight: "600",
  color: "#e0e0e0", // Light gray for contrast against dark background
  borderBottom: "2px solid transparent",
  background:
    "linear-gradient(90deg, rgba(128,0,128,1) 0%, rgba(0,0,0,1) 100%)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  paddingBottom: "4px",
  marginBottom: "12px",
}));

const AttendanceLeavePage = () => {
  const dispatch = useDispatch();
  const { attendanceData, loading, leaveRequests, successMessage, error } =
    useSelector((state) => state.attendanceLeave);

  // Assuming we have a way to get the current employee's ID
  const currentEmployeeId = "EMP001"; // Replace with actual logic to get the current employee's ID

  const [leaveRequest, setLeaveRequest] = useState({
    type: "",
    startDate: "",
    endDate: "",
    status: "Pending",
  });

  const checkDateConflict = (newStartDate, newEndDate) => {
    return leaveRequests.some((request) => {
      const existingStartDate = new Date(request.startDate);
      const existingEndDate = new Date(request.endDate);
      return (
        (newStartDate >= existingStartDate &&
          newStartDate <= existingEndDate) ||
        (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
        (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
      );
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const calculateRemainingLeave = (leaveRequests) => {
    const totalLeaveDays = attendanceData.remainingLeave[currentEmployeeId]; // Total leave days for the employee
    const usedLeaveDays = leaveRequests.reduce((total, request) => {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Calculate total days of leave
      return total + days;
    }, 0);
    return totalLeaveDays - usedLeaveDays;
  };

  useEffect(() => {
    const fetchAttendanceData = async () => {
      dispatch(fetchAttendanceRequest());
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
  
        const today = new Date();
        const dummyAttendance = [];
  
        // Create attendance data only for dates up to today
        for (let day = 1; day <= 31; day++) {
          const date = new Date(2024, 9, day); // October 2024
          if (date > today) break; // Stop if the date exceeds today
  
          const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  
          // Determine attendance based on day of the week
          let status;
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            // For weekends, randomly set present or absent
            status = Math.random() < 0.5 ? "present" : "absent";
          } else {
            // For weekdays, assume present
            status = "present";
          }
  
          dummyAttendance.push({
            date: date.toISOString().split("T")[0],
            status,
            employeeId: currentEmployeeId,
          });
        }
  
        // Calculate remaining leave based on current leave requests
        const remainingLeave = calculateRemainingLeave(leaveRequests); // Calculate remaining leave
  
        dispatch(
          fetchAttendanceSuccess({
            totalDays: dummyAttendance.length,
            attendance: dummyAttendance,
            remainingLeave: { [currentEmployeeId]: remainingLeave }, // Update remaining leave for the current employee
          })
        );
      } catch (error) {
        dispatch(fetchAttendanceFailure("Failed to fetch attendance data"));
      }
    };
  
    fetchAttendanceData();
  }, [dispatch, leaveRequests]); // Add leaveRequests to the dependency array

  const handleLeaveRequestSubmit = (event) => {
    event.preventDefault();
    const startDate = new Date(leaveRequest.startDate);
    const endDate = new Date(leaveRequest.endDate);
    const today = new Date();

    if (!leaveRequest.type) {
      setSnackbarMessage("Please select a leave type.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!leaveRequest.startDate || !leaveRequest.endDate) {
      setSnackbarMessage("Please select both start and end dates.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (startDate < today || endDate < today) {
      setSnackbarMessage("Start and end dates must be in the future.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (startDate > endDate) {
      setSnackbarMessage("Start date must be before the end date.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setDialogOpen(true);
  };

  // Function to handle confirmation in the dialog
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      dispatch(submitLeaveRequest(leaveRequest));
  
      // Log attendance as absent for the leave period
      const startDate = new Date(leaveRequest.startDate);
      const endDate = new Date(leaveRequest.endDate);
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // Calculate total days of leave
  
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        dispatch(
          logAttendance({
            date: date.toISOString().split("T")[0],
            status: "absent",
            employeeId: currentEmployeeId,
          })
        );
      }
  
      dispatch(fetchLeaveRequests()); // Fetch updated leave requests after submission
  
      setSnackbarMessage("Leave request submitted successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Failed to submit leave request.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDialogOpen(false);
      setSubmitting(false);
    }
  };

  const handleDateChange = (date) => {
    // Update the current month
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const style = {
      backgroundColor: "green",
      borderRadius: "0px",
      opacity: 0.8,
      color: "black",
      border: "0px",
      display: "block",
    };

    if (event.status === "absent") {
      style.backgroundColor = "red";
    }

    return { style };
  };

  const handleLeaveTypeChange = (event) => {
    setLeaveRequest((prevLeaveRequest) => ({
      ...prevLeaveRequest,
      type: event.target.value,
    }));
  };

  const handleStartDateChange = (event) => {
    setLeaveRequest((prevLeaveRequest) => ({
      ...prevLeaveRequest,
      startDate: event.target.value,
    }));
  };

  const handleEndDateChange = (event) => {
    setLeaveRequest((prevLeaveRequest) => ({
      ...prevLeaveRequest,
      endDate: event.target.value,
    }));
  };

  const handleFilterTextChange = (event) => {
    setFilterText(event.target.value);
  };

  const filteredLeaveRequests = leaveRequests.filter((leaveRequest) => {
    return (
      leaveRequest.type.toLowerCase().includes(filterText.toLowerCase()) ||
      leaveRequest.startDate.toLowerCase().includes(filterText.toLowerCase()) ||
      leaveRequest.endDate.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  return (
    <Box sx={{ padding: 2 }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <LinearProgress sx={{ width: "100%", maxWidth: "600px" }} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <SubHeading variant="h6" component="h2">
                  Attendance Calendar
                </SubHeading>
                {attendanceData.attendance.length === 0 ? (
                  <Typography>No attendance data available.</Typography>
                ) : (
                  <Calendar
                    localizer={localizer}
                    events={attendanceData.attendance.map((event) => ({
                      title: event.status === "present" ? "Present" : "Absent",
                      start: new Date(event.date),
                      end: new Date(event.date),
                      status: event.status,
                    }))}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 400 }}
                    eventPropGetter={eventStyleGetter}
                    components={{
                      event: ({ event }) => (
                        <Tooltip title={event.title}>
                          <div
                            style={{
                              backgroundColor:
                                event.status === "absent" ? "red" : "green",
                              borderRadius: "0px",
                              opacity: 0.8,
                              color: "black",
                              border: "0px",
                              display: "block",
                              padding: "5px",
                            }}
                          >
                            {event.title}
                          </div>
                        </Tooltip>
                      ),
                    }}
                    onNavigate={(date) => handleDateChange(date)}
                    onSelectEvent={(event) => console.log(event)}
                    selectable={true}
                    navLink={({ date, label, onView, setActive }) => (
                      <IconButton onClick={onView}>
                        {label === "prev" ? (
                          <ChevronLeftIcon />
                        ) : (
                          <ChevronRightIcon />
                        )}
                      </IconButton>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <SubHeading variant="h6" component="h2">
                  Leave Request Form
                </SubHeading>

                <form onSubmit={(event) => event.preventDefault()}>
                  {" "}
                  {/* Prevent default form submission */}
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <InputLabel id="leave-type-label">Leave Type</InputLabel>
                    <Select
                      labelId="leave-type-label"
                      id="leave-type"
                      value={leaveRequest.type}
                      label="Leave Type"
                      onChange={handleLeaveTypeChange}
                    >
                      {LEAVE_TYPES.map((leaveType) => (
                        <MenuItem key={leaveType.value} value={leaveType.value}>
                          {leaveType.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <TextField
                      id="start-date"
                      label="Start Date"
                      type="date"
                      value={leaveRequest.startDate}
                      onChange={handleStartDateChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </FormControl>
                  <FormControl fullWidth sx={{ marginBottom: 2 }}>
                    <TextField
                      id="end-date"
                      label="End Date"
                      type="date"
                      value={leaveRequest.endDate}
                      onChange={handleEndDateChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleLeaveRequestSubmit} // Open the dialog on button click
                    disabled={submitting}
                    sx={{
                      backgroundColor: "purple",
                      color: "white",
                      "&:hover": { backgroundColor: "darkviolet" },
                    }}
                  >
                    {submitting ? "Submitting..." : "Submit Leave Request"}
                  </Button>
                </form>

                {/* Confirmation Dialog */}
                <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                  <DialogTitle>Confirm Leave Request</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to submit this leave request?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setDialogOpen(false)}
                      color="primary"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmSubmit} color="primary">
                      Confirm
                    </Button>
                  </DialogActions>
                </Dialog>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <SubHeading variant="h6" component="h2">
                  Leave Requests
                </SubHeading>
                <TextField
                  fullWidth
                  id="filter-text"
                  label="Search"
                  type="search"
                  value={filterText}
                  onChange={handleFilterTextChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ marginBottom: 2 }}
                />
                {filteredLeaveRequests.length === 0 ? (
                  <Typography>No leave requests available.</Typography>
                ) : (
                  <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                          >
                            Type
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                          >
                            Start Date
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                          >
                            End Date
                          </TableCell>
                          <TableCell
                            sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                          >
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLeaveRequests.map((leaveRequest, index) => (
                          <TableRow key={index}>
                            <TableCell>{leaveRequest.type}</TableCell>
                            <TableCell>{leaveRequest.startDate}</TableCell>
                            <TableCell>{leaveRequest.endDate}</TableCell>
                            <TableCell
                              sx={{
                                color:
                                  leaveRequest.status === "Pending"
                                    ? "orange"
                                    : "green",
                                fontWeight: "bold",
                              }}
                            >
                              {leaveRequest.status}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: "#f0f8ff",
                padding: 2,
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <CardContent>
                <SubHeading variant="h6" component="h2">
                  Remaining Leave
                </SubHeading>
                <Box
                  sx={{ display: "flex", alignItems: "center", marginTop: 1 }}
                >
                  <Typography
                    variant="h4"
                    component="span"
                    sx={{ fontWeight: "bold", marginRight: 2 }}
                  >
                    {attendanceData.remainingLeave[currentEmployeeId] !==
                    undefined
                      ? attendanceData.remainingLeave[currentEmployeeId]
                      : 0}
                  </Typography>
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{ color: "gray" }}
                  >
                    days remaining
                  </Typography>
                  <Tooltip title="Total leave days available: 30" arrow>
                    <IconButton sx={{ marginLeft: 2 }}>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box sx={{ marginTop: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={
                      (attendanceData.remainingLeave[currentEmployeeId] / 5) *
                      100
                    } // Assuming 5 is the total leave days for this example
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
            info: <InfoIcon fontSize="inherit" />,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceLeavePage;
