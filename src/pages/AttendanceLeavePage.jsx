import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchAttendanceData,
  fetchLeaveRequestsData,
  submitLeaveRequestData,
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
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import { useNotificationContext } from "../components/NotificationContext";

const localizer = momentLocalizer(moment);

const LEAVE_TYPES = [
  { value: "Casual Leave", label: "Casual Leave" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Emergency Leave", label: "Emergency Leave" },
  { value: "Others", label: "Others" },
];

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
  color: "#e0e0e0",
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
  const {
    attendanceData,
    loading,
    leaveRequests = [],
    successMessage,
    error,
  } = useSelector((state) => state.attendanceLeave);

  const currentEmployeeId = useSelector((state) => state.auth.employee?.empId);

  const [leaveRequest, setLeaveRequest] = useState({
    type: "",
    startDate: "",
    endDate: "",
    status: "Pending",
  });

  const [submitting, setSubmitting] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("error");

  const { addNotifications } = useNotificationContext();

  useEffect(() => {
    dispatch(fetchAttendanceData(currentEmployeeId)); // Fetch attendance data
    dispatch(fetchLeaveRequestsData()); // Fetch leave requests
  }, [dispatch, currentEmployeeId]);

  useEffect(() => {
    if (successMessage) {
      setSnackbarMessage(successMessage);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      dispatch(clearSuccessMessage()); // Clear success message
    }
    if (error) {
      setSnackbarMessage(error);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  }, [successMessage, error, dispatch]);

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

  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    try {
      await dispatch(
        submitLeaveRequestData({
          ...leaveRequest,
          employeeId: currentEmployeeId,
        })
      );
      addNotifications([
        {
          type: "info", // or "success", depending on how you want to categorize it
          text: `New leave request submitted by Employee ID: ${currentEmployeeId} for ${leaveRequest.type} from ${leaveRequest.startDate} to ${leaveRequest.endDate}.`,
        },
      ]);
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

  const filteredLeaveRequests = Array.isArray(leaveRequests)
    ? leaveRequests.filter((leaveRequest) => {
        return (
          leaveRequest.type.toLowerCase().includes(filterText.toLowerCase()) ||
          leaveRequest.startDate
            .toLowerCase()
            .includes(filterText.toLowerCase()) ||
          leaveRequest.endDate.toLowerCase().includes(filterText.toLowerCase())
        );
      })
    : [];

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
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor:
                          event.status === "absent" ? "red" : "green",
                      },
                    })}
                    selectable={true}
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
                </SubHeading>{" "}
                <form onSubmit={(event) => event.preventDefault()}>
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
                bgcolor: "#f0f8 ff",
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
                      (attendanceData.remainingLeave[currentEmployeeId] / 30) *
                      100 // Assuming 30 is the total leave days for this example
                    }
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
