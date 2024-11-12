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
import {
  setPerformanceData,
  setTrainingDetails,
  setLoading,
} from "../redux/performanceSlice"; // Import actions

// RadarChart Component
const PerformanceChart = ({ data }) => (
  <Box display="flex" justifyContent="center">
    <RadarChart outerRadius={120} width={800} height={400} data={data}>
      <PolarGrid stroke="#e0e0e0" />
      <PolarAngleAxis dataKey="month" /> {/* Changed from subject to month */}
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
      month: PropTypes.string.isRequired, // Changed from subject to month
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
  const { performanceData, isLoading } = useSelector(
    (state) => state.performance
  );
  const trainingData =
    useSelector((state) => state.performance.trainingData) || [];

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const { addNotifications } = useNotificationContext();

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        // Simulate API calls (replace with actual API calls later)
        const performanceResponse = await new Promise((resolve) =>
          setTimeout(
            () =>
              resolve([
                { month: "October 2023", performance: 80, target: 100 },
                { month: "November 2023", performance: 70, target: 100 },
                { month: "December 2023", performance: 60, target: 100 },
                { month: "January 2024", performance: 75, target: 100 },
                { month: "February 2024", performance: 90, target: 100 },
              ]), // Dummy performance data
            1000 // Simulate delay
          )
        );
        const trainingResponse = await new Promise((resolve) =>
          setTimeout(
            () =>
              resolve([
                {
                  id: 1,
                  date: "09-11-2024",
                  time: "10:00 AM",
                  duration: "2 hours",
                  location: "Online (Zoom)",
                  description:
                    "This training session will cover the fundamentals of React.js, including components, state management, and hooks.",
                  instructor: "John Doe - Senior React Developer",
                  link: "some-link",
                },
                {
                  id: 2,
                  date: "15-11-2024",
                  time: "02:00 PM",
                  duration: "1 hour",
                  location: "Room 101",
                  description: "Advanced React patterns and best practices.",
                  instructor: "Jane Smith - Lead React Developer",
                  link: "some-link",
                },
              ]),
            1000 // Simulate delay
          )
        );

        dispatch(setPerformanceData(performanceResponse));
        dispatch(setTrainingDetails(trainingResponse));
        dispatch(setLoading(false)); // Set loading to false after data is fetched

        // --- Add Notification Logic ---
        for (const training of trainingResponse) {
          if (training.id) {
            const newTrainingNotification = {
              id: training.id,
              text: `New training session scheduled: ${training.description}`,
              link: `/training-details/${training.id}`,
            };
            addNotifications([newTrainingNotification]);
          }
        }
      } catch (error) {
        setSnackbarMessage("Failed to load data.");
        setSnackbarOpen(true); // Open snackbar on error
        dispatch(setLoading(false)); // Set loading to false on error
      }
    };

    fetchData();
  }, [dispatch, addNotifications]);

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
    console.log("Current Date:", now);
    let upcomingTraining = null;
    let closestTimeDifference = Infinity;
  
    for (const training of trainingData) {
      // Split the date string into components
      const [day, month, year] = training.date.split("-").map(Number);
      
      // Extract time and AM/PM
      const timeParts = training.time.split(" ");
      const [hour, minute] = timeParts[0].split(":").map(Number);
      const amPm = timeParts[1];
  
      // Convert hour to 24-hour format
      let adjustedHour = hour;
      if (amPm === "PM" && hour !== 12) {
        adjustedHour += 12; // Convert PM hour to 24-hour format
      } else if (amPm === "AM" && hour === 12) {
        adjustedHour = 0; // Midnight case
      }
  
      // Create a Date object, adjusting for month being 0-indexed in JavaScript
      const trainingDateTime = new Date(year, month - 1, day, adjustedHour, minute);
      console.log("Training DateTime:", trainingDateTime);
  
      // Check if the trainingDateTime is valid
      if (isNaN(trainingDateTime.getTime())) {
        console.error("Invalid Date for training:", training.date);
        continue; // Skip this training if the date is invalid
      }
  
      const timeDifference = trainingDateTime - now;
  
      // Only consider future training sessions
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
  const averagePerformance = (
    totalPerformance / performanceData.length
  ).toFixed(2);
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
