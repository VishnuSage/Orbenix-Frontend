import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEvents,
  clockInThunk,
  clockOutThunk,
  setSnackbarMessage,
  clearSnackbar,
  addEvent,
  updateElapsedTime,
} from "../redux/timeTrackingSlice"; // Adjust the import path as necessary
import { fetchAttendanceData } from "../redux/attendanceLeaveSlice";
import {
  Box,
  Grid,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton,
  Snackbar,
  styled,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DoorFrontIcon from "@mui/icons-material/DoorFront";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import InfoIcon from "@mui/icons-material/Info";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

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

const TimeTrackingPage = () => {
  const dispatch = useDispatch();
  const isClockedIn = useSelector((state) => state.timeTracking.isClockedIn);
  const startTime = useSelector((state) => state.timeTracking.startTime);
  const elapsedTime = useSelector((state) => state.timeTracking.elapsedTime);
  const events = useSelector((state) => state.timeTracking.events);
  const snackbarOpen = useSelector((state) => state.timeTracking.snackbarOpen);
  const snackbarMessage = useSelector(
    (state) => state.timeTracking.snackbarMessage
  );

  const empId = useSelector((state) => state.auth.empId); // Access empId from the Redux state

  useEffect(() => {
    let timer;
    if (isClockedIn) {
      timer = setInterval(() => {
        dispatch(updateElapsedTime());
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dispatch, isClockedIn]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchEvents());
      } catch (error) {
        console.error("Error fetching events:", error);
        showSnackbar("Failed to fetch events. Please try again.");
      }
    };

    fetchData();
  }, [dispatch]);

  const handleSnackbarClose = () => dispatch(clearSnackbar());

  const showSnackbar = (message) => {
    dispatch(setSnackbarMessage({ open: true, message }));
  };

  const handleClockIn = async () => {
    try {
      const clockInTime = Date.now();
      await dispatch(clockInThunk({ empId: empId, dispatch }));

      // Add clock-in event
      dispatch(
        addEvent({
          title: "Clock In",
          start: new Date(clockInTime),
          end: new Date(clockInTime),
        })
      );

      showSnackbar("Clocked In Successfully!");
      await dispatch(fetchAttendanceData(empId));
    } catch (error) {
      console.error("Error during clock in:", error);
      showSnackbar("Failed to clock in. Please try again.");
    }
  };

  const handleClockOut = async () => {
    try {
      const clockOutTime = Date.now();
      await dispatch(clockOutThunk({ empId: empId, dispatch }));

      // Add clock-out event
      dispatch(
        addEvent({
          title: "Clock Out",
          start: new Date(startTime),
          end: new Date(clockOutTime),
        })
      );

      showSnackbar("Clocked Out Successfully!");
      await dispatch(fetchAttendanceData(empId));
    } catch (error) {
      console.error("Error during clock out:", error);
      showSnackbar("Failed to clock out. Please try again.");
    }
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.title === "Absent" ? "red" : "green",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
      textAlign: "center",
      padding: "5px",
    };
    return { style };
  };

  const calculateTotalHoursWorkedThisMonth = () => {
    const currentMonth = moment().month();
    let totalSeconds = 0;
    (Array.isArray(events) ? events : []).forEach((event) => {
      if (moment(event.start).month() === currentMonth) {
        const timeParts = event.title.split(":");
        if (timeParts.length === 3) {
          const hours = parseInt(timeParts[0], 10) || 0;
          const minutes = parseInt(timeParts[1], 10) || 0;
          const seconds = parseInt(timeParts[2], 10) || 0;
          totalSeconds += hours * 3600 + minutes * 60 + seconds;
        } else {
          console.error(`Invalid time format: ${event.title}`);
        }
      }
    });
    return totalSeconds;
  };

  const totalHoursWorkedThisMonth = calculateTotalHoursWorkedThisMonth();
  const formattedTotalHoursWorkedThisMonth = formatElapsedTime(
    totalHoursWorkedThisMonth
  );
  const monthlyTarget = 160 * 3600; // 160 hours per month
  const monthlyProgress =
    monthlyTarget > 0 ? (totalHoursWorkedThisMonth / monthlyTarget) * 100 : 0;

  return (
    <Box sx={{ padding: 2 }}>
      <Card variant="outlined" sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Elapsed Time: <AccessTimeIcon /> {formatElapsedTime(elapsedTime)}
          </Typography>
          <Button
            variant="contained"
            color="success"
            sx={{ margin: 1 }}
            onClick={handleClockIn}
            disabled={isClockedIn}
            startIcon={<DoorFrontIcon />}
          >
            Clock In
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClockOut}
            disabled={!isClockedIn}
            startIcon={<MeetingRoomIcon />}
          >
            Clock Out
          </Button>
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ marginBottom: 2, height: 500 }}>
        <CardContent sx={{ height: "100%" }}>
          <Typography variant="h5">Work Hours Calendar</Typography>
          <Calendar
            localizer={localizer}
            events={Array.isArray(events) ? events : []}
            onSelectEvent={(event) => console.log(event)}
            onSelectSlot={(slotInfo) => console.log(slotInfo)}
            defaultView="month"
            defaultDate={new Date()}
            eventPropGetter={(event) => eventStyleGetter(event)}
          />
        </CardContent>
      </Card>
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
              Total Hours Worked
            </SubHeading>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
              <Typography
                variant="h4"
                component="span"
                sx={{ fontWeight: "bold", marginRight: 2 }}
              >
                {formattedTotalHoursWorkedThisMonth}
              </Typography>
              <Typography
                variant="body1"
                component="span"
                sx={{ color: "gray" }}
              >
                hours worked this month
              </Typography>
              <Tooltip title="Monthly target: 160 hours" arrow>
                <IconButton sx={{ marginLeft: 2 }}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ marginTop: 2 }}>
              <LinearProgress
                variant="determinate"
                value={monthlyProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": { backgroundColor: "purple" },
                }}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TimeTrackingPage;
