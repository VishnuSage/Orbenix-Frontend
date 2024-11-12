import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  List,
  ListItem,
  ListItemText,
  TablePagination,
  Tabs,
  Tab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { FixedSizeList as ListContainer } from "react-window";
import {
  addPerformanceData,
  updatePerformanceData,
  deletePerformanceData,
  addTrainingDetails,
  updateTrainingDetails,
  deleteTrainingDetails,
  setLoading,
} from "../redux/performanceSlice";

const AdminPerformanceManagementPage = () => {
  const dispatch = useDispatch();
  const { performanceData, trainingData } = useSelector(
    (state) => state.performance
  );

  // Sample employee list
  const employees = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
    { id: 3, name: "Charlie" },
    { id: 4, name: "David" },
    { id: 5, name: "Eve" },
    { id: 6, name: "Frank" },
    { id: 7, name: "Grace" },
    { id: 8, name: "Heidi" },
    { id: 9, name: "Ivan" },
    { id: 10, name: "Judy" },
  ];

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState("");
  const [performance, setPerformance] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [trainingCurrentPage, setTrainingCurrentPage] = useState(0);
  const [tabIndex, setTabIndex] = useState(0); // 0 for Performance, 1 for Training

  // Training state variables
  const [trainingDate, setTrainingDate] = useState("");
  const [trainingTime, setTrainingTime] = useState("");
  const [trainingDuration, setTrainingDuration] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [trainingDescription, setTrainingDescription] = useState("");
  const [trainingInstructor, setTrainingInstructor] = useState("");
  const [trainingLink, setTrainingLink] = useState(""); // New state for Google Form link
  const [trainingEditMode, setTrainingEditMode] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState("");

  useEffect(() => {
    console.log("Training data updated:", trainingData);
  }, [trainingData]);

  useEffect(() => {
    setFilteredEmployees(
      employees.filter(
        (employee) =>
          employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          employee.id.toString().includes(searchTerm)
      )
    );
  }, [searchTerm]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const formatMonth = (month) => {
    const date = new Date(month);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleAddPerformance = () => {
    if (!selectedEmployee || !month || !performance) {
      setSnackbarMessage("All fields are required.");
      setSnackbarOpen(true);
      return;
    }

    const newPerformanceData = {
      employeeId: selectedEmployee,
      month: formatMonth(month),
      performance: Number(performance),
      target: 100,
    };
    dispatch(addPerformanceData(newPerformanceData));
    resetForm();
    setSnackbarMessage("Performance data added successfully.");
    setSnackbarOpen(true);
  };

  const handleUpdatePerformance = () => {
    if (!selectedEmployee || !month || !performance) {
      setSnackbarMessage("All fields are required.");
      setSnackbarOpen(true);
      return;
    }

    const updatedData = {
      employeeId: selectedEmployee,
      month: formatMonth(month),
      performance: Number(performance),
      target: 100,
    };
    dispatch(updatePerformanceData(updatedData));
    resetForm();
    setSnackbarMessage("Performance data updated successfully.");
    setSnackbarOpen(true);
    setEditMode(false);
  };

  const handleEditPerformance = (data) => {
    setSelectedEmployee(data.employeeId);
    setMonth(data.month);
    setPerformance(data.performance);
    setEditMode(true);
    setSearchTerm(
      `${data.employeeId} - ${employees.find((emp) => emp.id === data.employeeId)?.name}`
    );
    setDropdownOpen(false);
  };

  const handleDeletePerformance = (employeeId, month) => {
    const dataToDelete = {
      employeeId,
      month,
    };
    dispatch(deletePerformanceData(dataToDelete));
    setSnackbarMessage("Performance data deleted successfully.");
    setSnackbarOpen(true);
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setMonth("");
    setPerformance("");
    setEditMode(false);
    setSearchTerm("");
    setFilteredEmployees(employees);
    setDropdownOpen(false);
  };

  useEffect(() => {
    dispatch(setLoading(false));
  }, [dispatch]);

  const Row = ({ index, style }) => (
    <ListItem
      button
      style={{
        ...style,
        backgroundColor: "white",
        opacity: 1,
        pointerEvents: "auto",
      }}
      onClick={() => {
        const employee = filteredEmployees[index];
        setSelectedEmployee(employee.id);
        setSearchTerm(`${employee.id} - ${employee.name}`);
        setDropdownOpen(false);
      }}
    >
      <ListItemText
        primary={`${filteredEmployees[index].id} - ${filteredEmployees[index].name}`}
      />
    </ListItem>
  );

  const paginatedData = performanceData.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const handleAddTraining = () => {
    if (
      !trainingDate ||
      !trainingTime ||
      !trainingDuration ||
      !trainingLocation ||
      !trainingDescription ||
      !trainingInstructor ||
      !trainingLink
    ) {
      setSnackbarMessage("All fields are required.");
      setSnackbarOpen(true);
      return;
    }
  
    // Ensure trainingTime includes AM/PM
    const formattedTime = convertTo12HourFormat(trainingTime); // Make sure trainingTime is a string like "10:00 AM"
  
    const newTrainingData = {
      id: selectedTrainingId || Date.now(), // Use a unique ID for new training
      date: trainingDate,
      time: formattedTime, // Store the formatted time
      duration: trainingDuration,
      location: trainingLocation,
      description: trainingDescription,
      instructor: trainingInstructor,
      link: trainingLink,
    };
  
    if (trainingEditMode) {
      dispatch(updateTrainingDetails(newTrainingData));
      setSnackbarMessage("Training details updated successfully.");
    } else {
      dispatch(addTrainingDetails(newTrainingData));
      setSnackbarMessage("Training details added successfully.");
    }
  
    resetTrainingForm();
    setSnackbarOpen(true);
  };

  const handleEditTraining = (data) => {
    setTrainingDate(data.date);
    setTrainingTime(data.time);
    setTrainingDuration(data.duration);
    setTrainingLocation(data.location);
    setTrainingDescription(data.description);
    setTrainingInstructor(data.instructor);
    setTrainingLink(data.link);
    setTrainingEditMode(true);
    setSelectedTrainingId(data.id);
  };

  const handleDeleteTraining = (id) => {
    dispatch(deleteTrainingDetails(id));
    setSnackbarMessage("Training details deleted successfully.");
    setSnackbarOpen(true);
  };

  const resetTrainingForm = () => {
    setTrainingDate("");
    setTrainingTime("");
    setTrainingDuration("");
    setTrainingLocation("");
    setTrainingDescription("");
    setTrainingInstructor("");
    setTrainingLink("");
    setTrainingEditMode(false);
    setSelectedTrainingId("");
  };

  const convertTo12HourFormat = (timeString) => {
    const [hour, minute] = timeString.split(":").map(Number);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    const formattedMinute = minute.toString().padStart(2, '0'); // Ensure two-digit minute
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  };

  const formatTime = (timeString) => {
    // Ensure timeString is in a valid format
    if (!timeString) return "Invalid time";
  
    // Split the time string into hour, minute, and AM/PM
    const [time, ampm] = timeString.split(" ");
    const [hour, minute] = time.split(":").map(Number);
  
    // Validate hour and minute
    if (isNaN(hour) || isNaN(minute)) {
      console.error("Invalid time format:", timeString);
      return "Invalid time";
    }
  
    let formattedHour = hour % 12 || 12; // Convert 0 to 12 for midnight
    const formattedMinute = minute.toString().padStart(2, '0'); // Ensure two-digit minute
  
    return `${formattedHour}:${formattedMinute} ${ampm}`;
  };

  return (
    <Box
      sx={{
        padding: 3,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 2,
        minHeight: "100vh",
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={(e, newValue) => setTabIndex(newValue)}
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
        <Tab label="Performance Management" />
        <Tab label="Training Management" />
      </Tabs>
      {tabIndex === 0 && (
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6">
                {editMode ? "Edit Performance Data" : "Add Performance Data"}
              </Typography>
              <FormControl fullWidth margin="normal">
                <TextField
                  label="Search Employee by ID or Name"
                  value={searchTerm}
                  onFocus={() => setDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedEmployee("");
                  }}
                  fullWidth
                />
              </FormControl>
              {dropdownOpen && filteredEmployees.length > 0 && (
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      zIndex: 1000,
                      width: "100%",
                      backgroundColor: "white",
                      opacity: 1,
                    }}
                  >
                    <ListContainer
                      height={200}
                      itemCount={filteredEmployees.length}
                      itemSize={46}
                      width="100%"
                      style={{ backgroundColor: "white", opacity: 1 }}
                    >
                      {Row}
                    </ListContainer>
                  </Box>
                </Box>
              )}
              <TextField
                label="Month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Performance"
                type="number"
                value={performance}
                onChange={(e) => setPerformance(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={
                  editMode ? handleUpdatePerformance : handleAddPerformance
                }
              >
                {editMode ? "Update" : "Add"}
              </Button>
              {editMode && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={resetForm}
                  sx={{ marginLeft: 2 }}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>

          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Employee
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Month
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Performance
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Target
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedData.map((data) => (
                  <TableRow
                    key={`${data.employeeId}-${data.month}`}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f0f0f0", // Change background on hover
                      },
                    }}
                  >
                    <TableCell>
                      {`${data.employeeId} - ${employees.find((emp) => emp.id === data.employeeId)?.name}`}
                    </TableCell>
                    <TableCell>{formatMonth(data.month)}</TableCell>
                    <TableCell>{data.performance}</TableCell>
                    <TableCell>{100}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditPerformance(data)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleDeletePerformance(data.employeeId, data.month)
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={performanceData.length}
              rowsPerPage={rowsPerPage}
              page={currentPage}
              onPageChange={(event, newPage) => setCurrentPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setCurrentPage(0);
              }}
            />
          </TableContainer>
        </Box>
      )}

      {tabIndex === 1 && (
        <Box>
          <Card sx={{ marginTop: 2 }}>
            <CardContent>
              <Typography variant="h6">Manage Training Details</Typography>
              <TextField
                label="Training Date"
                type="date"
                value={trainingDate}
                onChange={(e) => setTrainingDate(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Training Time"
                type="time"
                value={trainingTime}
                onChange={(e) => setTrainingTime(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Duration"
                value={trainingDuration}
                onChange={(e) => setTrainingDuration(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Location"
                value={trainingLocation}
                onChange={(e) => setTrainingLocation(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Description"
                value={trainingDescription}
                onChange={(e) => setTrainingDescription(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Instructor"
                value={trainingInstructor}
                onChange={(e) => setTrainingInstructor(e.target.value)}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Google Form Link" // New field for Google Form link
                value={trainingLink}
                onChange={(e) => setTrainingLink(e.target.value)}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddTraining}
              >
                {trainingEditMode ? "Update Training" : "Add Training"}
              </Button>
              {trainingEditMode && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={resetTrainingForm}
                  sx={{ marginLeft: 2 }}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Separate Table Container below the form */}
          <TableContainer component={Paper} sx={{ marginTop: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Time
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Duration
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Location
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Description
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Instructor
                  </TableCell>
                  <TableCell
                    sx={{ fontWeight: "bold", backgroundColor: "#f5f5f5" }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(trainingData) &&
                  trainingData.map((data) => (
                    <TableRow key={data.id}>
                      <TableCell>{data.date}</TableCell>
                      <TableCell>{formatTime(data.time)}</TableCell>
                      <TableCell>{data.duration}</TableCell>
                      <TableCell>{data.location}</TableCell>
                      <TableCell>{data.description}</TableCell>
                      <TableCell>{data.instructor}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditTraining(data)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteTraining(data.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={trainingData.length}
              rowsPerPage={rowsPerPage} // Use the existing rowsPerPage state
              page={trainingCurrentPage}
              onPageChange={(event, newPage) => setTrainingCurrentPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setTrainingCurrentPage(0);
              }}
            />
          </TableContainer>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPerformanceManagementPage;
