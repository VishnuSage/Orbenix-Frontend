import { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clockInThunk,
  clockOutThunk,
  setSnackbarMessage,
  clearSnackbar,
  addEvent,
  updateElapsedTime,
  fetchDailyStatus,
  fetchMonthlyStats,
} from "../redux/timeTrackingSlice";
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
  CircularProgress, // Import CircularProgress
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
  const dailyStatus = useSelector((state) => state.timeTracking.dailyStatus);
  const monthlyStats = useSelector((state) => state.timeTracking.monthlyStats);
  const snackbarOpen = useSelector((state) => state.timeTracking.snackbarOpen);
  const snackbarMessage = useSelector(
    (state) => state.timeTracking.snackbarMessage
  );
  const attendanceData = useSelector(
    (state) => state.attendanceLeave.attendanceData.attendance
  );

  const empId = useSelector((state) => state.auth.empId);

  const monthlyTarget = 160;

  const monthlyProgress =
    monthlyTarget > 0 ? (monthlyStats.totalHours / monthlyTarget) * 100 : 0;

  // Fetch attendance and daily status data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch attendance data
      await dispatch(fetchAttendanceData(empId));

      // Fetch daily status for today
      await dispatch(fetchDailyStatus({ empId: empId, date: new Date() }));

      // Fetch monthly stats
      await dispatch(
        fetchMonthlyStats({
          empId: empId,
          month: moment().month() + 1,
          year: moment().year(),
        })
      );
    };
    fetchData();
  }, [dispatch, empId]);

  // Update elapsedTime every second when clocked in
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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Set time to midnight

    const resetTimer = () => {
      dispatch(resetTimer());
    };

    const timerId = setTimeout(resetTimer, tomorrow - today);
    return () => clearTimeout(timerId);
  }, [dispatch]);

  const handleSnackbarClose = () => dispatch(clearSnackbar());

  const showSnackbar = (message) => {
    dispatch(setSnackbarMessage({ open: true, message }));
  };

  const handleClockIn = async () => {
    try {
      const response = await dispatch(clockInThunk({ empId: empId }));

      const { clockInTime } = response;

      dispatch(
        addEvent({
          title: "Clock In",
          start: new Date(clockInTime),
          end: new Date(clockInTime),
        })
      );

      showSnackbar("Clocked In Successfully!");
      // No need to fetch attendance data again here
    } catch (error) {
      console.error("Error during clock in:", error);
      showSnackbar("Failed to clock in. Please try again.");
    }
  };

  const handleClockOut = async () => {
    try {
      const clockOutTime = Date.now();
      await dispatch(clockOutThunk({ empId: empId }));

      dispatch(
        addEvent({
          title: "Clock Out",
          start: new Date(startTime),
          end: new Date(clockOutTime),
        })
      );

      await dispatch(
        fetchMonthlyStats({
          empId: empId,
          month: moment().month() + 1,
          year: moment().year(),
        })
      );

      showSnackbar("Clocked Out Successfully!");
      // No need to fetch attendance data again here
    } catch (error) {
      console.error("Error during clock out:", error);
      showSnackbar("Failed to clock out. Please try again.");
    }
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${secs}`;
  };

  const formatTotalHours = (totalHours) => {
    const totalSeconds = Math.floor(totalHours * 3600);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const [calendarEvents, setCalendarEvents] = useState([]);

  const prepareCalendarEvents = useCallback(() => {
    const calendarEvents = [];
    const today = moment().startOf("day");

    if (dailyStatus && dailyStatus.status !== undefined) {
      const workedHours = dailyStatus.totalHours || 0;
      const formattedHours = formatTotalHours(workedHours);

      if (dailyStatus.status === "present") {
        calendarEvents.push({
          title: formattedHours,
          start: today.toDate(),
          end: today.toDate(),
        });
      } else {
        calendarEvents.push({
          title: "Absent",
          start: today.toDate(),
          end: today.toDate(),
          style: {
            backgroundColor: "red",
            color: "white",
            borderRadius: "0px",
            opacity: 0.8,
          },
        });
      }
    } else {
      calendarEvents.push({
        title: "Loading attendance data...",
        start: today.toDate(),
        end: today.toDate(),
      });
    }

    return calendarEvents;
  }, [dailyStatus]);

  useEffect(() => {
    const calendarEvents = prepareCalendarEvents();
    setCalendarEvents(calendarEvents);
  }, [prepareCalendarEvents]);

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
            disabled={dailyStatus.isCurrentlyClocked}
            startIcon={<DoorFrontIcon />}
          >
            Clock In
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleClockOut}
            disabled={!dailyStatus.isCurrentlyClocked}
            startIcon={<MeetingRoomIcon />}
          >
            Clock Out
          </Button>
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ marginBottom: 2, height: 500 }}>
        <CardContent sx={{ height: "100%" }}>
          <Typography variant="h5"> Work Hours Calendar</Typography>
          {dailyStatus.isLoading ? (
            <CircularProgress />
          ) : (
            <Calendar
              localizer={localizer}
              events={prepareCalendarEvents()}
              onSelectEvent={(event) => console.log(event)}
              onSelectSlot={(slotInfo) => console.log(slotInfo)}
              defaultView="month"
              defaultDate={new Date()}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: event.title.includes("Absent")
                    ? "red"
                    : "green",
                  borderRadius: "0px",
                  opacity: 0.8,
                  color: "white",
                  border: "0px",
                  display: "block",
                  textAlign: "center",
                  padding: "5px",
                },
              })}
            />
          )}
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
              Total Time Worked This Month
            </SubHeading>
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 1 }}>
              <Typography
                variant="h4"
                component="span"
                sx={{ fontWeight: "bold", marginRight: 2 }}
              >
                {monthlyStats.totalHours
                  ? formatTotalHours(monthlyStats.totalHours) // Use formatTotalHours here
                  : "00:00:00"}{" "}
                {/* Default to 00:00:00 if totalHours is 0 */}
              </Typography>
              <Typography
                variant="body1"
                component="span"
                sx={{ color: "gray" }}
              >
                total time worked this month
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
