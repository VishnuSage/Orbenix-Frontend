import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
import { logAttendance } from "../redux/attendanceLeaveSlice"; // Import the logAttendance action
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
import DoorFrontIcon from "@mui/icons-material/DoorFront"; // Import Door Front icon for Clock In
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom"; // Import Meeting Room icon for Clock Out
import InfoIcon from "@mui/icons-material/Info";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { clockIn, clockOut, updateElapsedTime, setEvents } from "../redux/timeTrackingSlice"; // Import Redux actions
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

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

const TimeTrackingPage = () => {
  const dispatch = useDispatch(); // Initialize dispatch
  const isClockedIn = useSelector((state) => state.timeTracking.isClockedIn); // Get clocked in state from Redux
  const startTime = useSelector((state) => state.timeTracking.startTime); // Get start time from Redux
  const elapsedTime = useSelector((state) => state.timeTracking.elapsedTime); // Get elapsed time from Redux
  const events = useSelector((state) => state.timeTracking.events); // Get events from Redux

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    let timer;
    if (isClockedIn) {
      timer = setInterval(() => {
        dispatch(updateElapsedTime()); // Dispatch action to update elapsed time
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dispatch, isClockedIn]);

  const handleClockIn = () => {
    dispatch(clockIn()); // Dispatch clockIn action
    dispatch(logAttendance({ date: new Date().toISOString().split('T')[0], status: 'present' })); // Log attendance as present
    setSnackbarMessage("Clocked In Successfully!");
    setSnackbarOpen(true);
  };
  
  const handleClockOut = () => {
    const endTime = Date.now();
    const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
    
    // Format elapsed time as HH:MM:SS
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    const formattedTime = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    
    // Add the worked hours to the events array
    dispatch(setEvents([...events, {
      title: formattedTime, // Use formatted elapsed time as the title
      start: new Date(), // Use the current date
      end: new Date(), // Use the current date
    }])); // Dispatch action to set events
    
    dispatch(clockOut()); // Dispatch clockOut action
    dispatch(logAttendance({ date: new Date().toISOString().split('T')[0], status: 'absent' })); // Log attendance as absent
    setSnackbarMessage("Clocked Out Successfully!");
    setSnackbarOpen(true);
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s `;
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.title === "Absent" ? "red" : "green",
      borderRadius: "0px",
      opacity: 0.8,
      color: "white", // Change text color to white for better visibility
      border: "0px",
      display: "block",
      textAlign: "center", // Center the text
      padding: "5px", // Add some padding
    };
    return { style };
  };

  useEffect(() => {
    const currentWeek = moment().week();
    const absentDays = [];
    const existingEvents = [...events]; // Copy existing events to avoid modifying state directly
  
    for (let i = 1; i <= 7; i++) {
      const day = moment().day(i).week(currentWeek).startOf('day');
      if (day.isBefore(moment().startOf('day'))) {
        let isAbsent = true;
        existingEvents.forEach((event) => {
          if (moment(event.start).isSame(day, "day")) {
            isAbsent = false;
          }
        });
        if (isAbsent && day.day() !== 0 && day.day() !== 6) { // Mark absent only for weekdays
          absentDays.push({
            title: "Absent",
            start: day.toDate(),
            end: day.toDate(),
          });
        }
      }
    }
  
    if (absentDays.length > 0) {
      dispatch(setEvents([...events, ...absentDays])); // Dispatch action to set events with absent days
    }
  }, [dispatch, events]); // Add events to the dependency array

  const calculateTotalHoursWorkedThisMonth = () => {
    const currentMonth = moment().month();
    let totalSeconds = 0;
    events.forEach((event) => {
      if (moment(event.start).month() === currentMonth) {
        const timeParts = event.title.split(":");

        if (timeParts.length === 3) {
          const hours = parseInt(timeParts[0], 10) || 0; // Default to 0 if NaN
          const minutes = parseInt(timeParts[1], 10) || 0; // Default to 0 if NaN
          const seconds = parseInt(timeParts[2], 10) || 0; // Default to 0 if NaN

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
  const monthlyProgress = (totalHoursWorkedThisMonth / monthlyTarget) * 100;

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
            startIcon={<DoorFrontIcon />} // Use Door Front icon for Clock In
          >
            Clock In
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClockOut}
            disabled={!isClockedIn}
            startIcon={<MeetingRoomIcon />} // Use Meeting Room icon for Clock Out
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
            events={events}
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
                value={monthlyProgress} // Assuming monthlyProgress is a percentage
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
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default TimeTrackingPage;