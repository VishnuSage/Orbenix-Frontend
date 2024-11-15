import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotificationContext } from "../components/NotificationContext"; // Import the context
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  LinearProgress,
  Tooltip,
  CssBaseline,
  Alert,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import InfoIcon from "@mui/icons-material/Info";
import TrainingIcon from "@mui/icons-material/School";
import { fetchAllData, setLoading } from "../redux/performanceSlice"; // Import fetchAllData and setLoading

// RadarChart Component
const PerformanceChart = ({ data }) => (
  <Box display="flex" justifyContent="center">
    <RadarChart outerRadius={120} width={800} height={400} data={data}>
      <PolarGrid stroke="#e0e0e0" />
      <PolarAngleAxis dataKey="month" />
      <PolarRadiusAxis />
      <Radar
        name="Performance"
        dataKey="performance"
        stroke="#4a148c"
        fill="#4a148c"
        fillOpacity={0.6}
      />
      <Radar
        name="Target"
        dataKey="target"
        stroke="#ff5722"
        fill="#ff5722"
        fillOpacity={0.3}
      />
      <Legend />
    </RadarChart>
  </Box>
);

PerformanceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      performance: PropTypes.number.isRequired,
      target: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// Performance Metrics Component
const PerformanceMetrics = ({ total, average, change }) => (
  <Box sx={{ mt: 2, textAlign: "center" }}>
    <Typography variant="body1" color="text.secondary">
      <strong>Total Performance:</strong> {total}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      <strong>Average Performance:</strong> {average}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      <strong>Percentage Change (last month):</strong> {change.toFixed(2)}%
    </Typography>
  </Box>
);

PerformanceMetrics.propTypes = {
  total: PropTypes.number.isRequired,
  average: PropTypes.string.isRequired,
  change: PropTypes.number.isRequired,
};

// Training Details Component
const TrainingDetails = ({ trainingData }) => (
  <>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ textAlign: "center" }}
    >
      <strong>Date:</strong> {trainingData.date}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ textAlign: "center" }}
    >
      <strong>Time:</strong> {trainingData.time}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ textAlign: "center" }}
    >
      <strong>Duration:</strong> {trainingData.duration}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ textAlign: "center" }}
    >
      <strong>Location:</strong> {trainingData.location}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mt: 1, textAlign: "center" }}
    >
      <strong>Description:</strong> {trainingData.description}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ mt: 1, textAlign: "center" }}
    >
      <strong>Instructor:</strong> {trainingData.instructor}
    </Typography>
  </>
);

TrainingDetails.propTypes = {
  trainingData: PropTypes.shape({
    date: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    instructor: PropTypes.string.isRequired,
  }).isRequired,
};

const PerformanceTrainingPage = () => {
  const dispatch = useDispatch();
  const { performanceData, trainingData, isLoading } = useSelector(
    (state) => state.performance
  );

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const { addNotifications } = useNotificationContext();

  // Existing useEffect for fetching data
  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        await dispatch(fetchAllData()); // Use fetchAllData
        dispatch(setLoading(false)); // Set loading to false after data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setSnackbarMessage("Failed to load data.");
        setSnackbarOpen(true); // Open snackbar on error
        dispatch(setLoading(false)); // Set loading to false on error
      }
    };

    fetchData();
  }, [dispatch]); // Removed addNotifications and trainingData from this effect

  // New useEffect for handling notifications
  useEffect(() => {
    const notifiedIds = new Set(); // To keep track of notified training IDs
    if (trainingData.length > 0) {
      for (const training of trainingData) {
        if (training.id && !notifiedIds.has(training.id)) {
          notifiedIds.add(training.id); // Mark this training as notified
          const newTrainingNotification = {
            id: training.id,
            text: `New training session scheduled: ${training.description}`,
            link: `/training-details/${training.id}`,
          };
          addNotifications([newTrainingNotification]);
        }
      }
    }
  }, [trainingData, addNotifications]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  const findUpcomingTraining = (trainingData) => {
    if (trainingData.length === 0) return null;

    const now = new Date();
    let upcomingTraining = null;
    let closestTimeDifference = Infinity;

    for (const training of trainingData) {
      const [day, month, year] = training.date.split("-").map(Number);
      const timeParts = training.time.split(" ");
      const [hour, minute] = timeParts[0].split(":").map(Number);
      const amPm = timeParts[1];

      let adjustedHour = hour;
      if (amPm === "PM" && hour !== 12) {
        adjustedHour += 12;
      } else if (amPm === "AM" && hour === 12) {
        adjustedHour = 0;
      }

      const trainingDateTime = new Date(
        year,
        month - 1,
        day,
        adjustedHour,
        minute
      );

      if (isNaN(trainingDateTime.getTime())) {
        console.error("Invalid Date for training:", training.date);
        continue;
      }

      const timeDifference = trainingDateTime - now;

      if (timeDifference > 0 && timeDifference < closestTimeDifference) {
        closestTimeDifference = timeDifference;
        upcomingTraining = training;
      }
    }

    return upcomingTraining;
  };

  const upcomingTraining = findUpcomingTraining(trainingData);

  const totalPerformance = performanceData.reduce(
    (acc, curr) => acc + curr.performance,
    0
  );
  const averagePerformance =
    performanceData.length > 0
      ? (totalPerformance / performanceData.length).toFixed(2)
      : 0;
  const percentageChange =
    performanceData.length >= 2
      ? ((performanceData[performanceData.length - 1].performance -
          performanceData[performanceData.length - 2].performance) /
          performanceData[performanceData.length - 2].performance) *
        100
      : 0;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "transparent", p: 3 }}>
      <CssBaseline />
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              boxShadow: 3,
              backgroundColor: "#ffffff",
              borderRadius: 2,
              "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#4a148c",
                  fontWeight: "bold",
                  mb: 2,
                  justifyContent: "center",
                }}
              >
                Performance Overview
                <Tooltip title="Get more info about performance">
                  <IconButton size="small" color="primary" sx={{ ml: 1 }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Typography>
              <PerformanceChart data={performanceData} />
              <PerformanceMetrics
                total={totalPerformance}
                average={averagePerformance}
                change={percentageChange}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card
            sx={{
              boxShadow: 3,
              backgroundColor: "#ffffff",
              borderRadius: 2,
              "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "#4a148c",
                  fontWeight: "bold",
                  mb: 2,
                  justifyContent: "center",
                }}
              >
                Upcoming Training
                <TrainingIcon sx={{ ml: 1, fontSize: 24, color: "#4a148c" }} />
              </Typography>
              {upcomingTraining ? (
                <TrainingDetails trainingData={upcomingTraining} />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming training sessions found.
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(upcomingTraining?.link, "_blank")}
                disabled={!upcomingTraining}
              >
                Register Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PerformanceTrainingPage;
