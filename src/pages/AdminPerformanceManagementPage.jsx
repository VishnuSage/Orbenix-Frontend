import { useEffect, useState } from "react";
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
  fetchPerformanceData,
  fetchTrainingData,
  fetchEmployees,
  addPerformanceData,
  updatePerformanceData,
  deletePerformanceData,
  addTrainingDetails,
  updateTrainingDetails,
  deleteTrainingDetails,
  setSnackbar,
  closeSnackbar,
} from "../redux/performanceSlice";
import { useNotificationContext } from "../components/NotificationContext";

const AdminPerformanceManagementPage = () => {
  const [selectedTrainingId, setSelectedTrainingId] = useState("");
  const dispatch = useDispatch();
  const { performanceData, trainingData, snackbar, employees } = useSelector(
    (state) => state.performance
  );

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [month, setMonth] = useState("");
  const [performance, setPerformance] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [trainingCurrentPage, setTrainingCurrentPage] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  // Training state variables
  const [trainingDate, setTrainingDate] = useState("");
  const [trainingTime, setTrainingTime] = useState("");
  const [trainingDuration, setTrainingDuration] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [trainingDescription, setTrainingDescription] = useState("");
  const [trainingInstructor, setTrainingInstructor] = useState("");
  const [trainingLink, setTrainingLink] = useState("");
  const [trainingEditMode, setTrainingEditMode] = useState(false);

  const { addNotifications } = useNotificationContext();

  useEffect(() => {
    dispatch(fetchPerformanceData());
    dispatch(fetchTrainingData());
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (Array.isArray(employees)) {
      setFilteredEmployees(
        employees.filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (employee.empId && employee.empId.toString().includes(searchTerm))
        )
      );
    }
  }, [searchTerm, employees]);

  const handleSnackbarClose = () => {
    dispatch(closeSnackbar());
  };

  const formatMonth = (month) => {
    const date = new Date(month);
    return date.toLocaleString("default", { month: "long", year: "numeric" });
  };

  const handleAddPerformance = async () => {
    if (!selectedEmployee || !month || !performance) {
      dispatch(
        setSnackbar({ message: "All fields are required.", severity: "error" })
      );
      return;
    }

    const newPerformanceData = {
      empId: selectedEmployee,
      month: formatMonth(month),
      performance: Number(performance),
      target: 100,
    };

    try {
      await dispatch(addPerformanceData(newPerformanceData));
      resetForm();
      dispatch(
        setSnackbar({
          message: "Performance data added successfully.",
          severity: "success",
        })
      );
    } catch (error) {
      dispatch(
        setSnackbar({
          message: "Failed to add performance data.",
          severity: "error",
        })
      );
    }
  };

  const handleUpdatePerformance = async () => {
    if (!selectedEmployee || !month || !performance) {
      dispatch(
        setSnackbar({ message: "All fields are required.", severity: "error" })
      );
      return;
    }

    const updatedData = {
      empId: selectedEmployee,
      month: formatMonth(month),
      performance: Number(performance),
      target: 100,
    };

    try {
      await dispatch(updatePerformanceData(updatedData));
      resetForm();
      dispatch(
        setSnackbar({
          message: "Performance data updated successfully.",
          severity: "success",
        })
      );
    } catch (error) {
      dispatch(
        setSnackbar({
          message: "Failed to update performance data.",
          severity: "error",
        })
      );
    }
  };

  const handleEditPerformance = (data) => {
    setSelectedEmployee(data.empId);
    setMonth(data.month);
    setPerformance(data.performance);
    setEditMode(true);
    setSearchTerm(
      `${data.empId} - ${
        employees.find((emp) => emp.empId === data.empId)?.name
      }`
    );
    setDropdownOpen(false);
  };

  const handleDeletePerformance = async (empId, month) => {
    try {
      await dispatch(deletePerformanceData({ empId, month }));
      dispatch(
        setSnackbar({
          message: "Performance data deleted successfully.",
          severity: "success",
        })
      );
    } catch (error) {
      dispatch(
        setSnackbar({
          message: "Failed to delete performance data.",
          severity: "error",
        })
      );
    }
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
        setSelectedEmployee(employee.empId);
        setSearchTerm(`${employee.empId} - ${employee.name}`);
        setDropdownOpen(false);
      }}
    >
      <ListItemText
        primary={`${filteredEmployees[index].empId} - ${filteredEmployees[index].name}`}
      />
    </ListItem>
  );

  const paginatedData = performanceData.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const handleAddTraining = async () => {
    if (
      !trainingDate ||
      !trainingTime ||
      !trainingDuration ||
      !trainingLocation ||
      !trainingDescription ||
      !trainingInstructor
    ) {
      dispatch(
        setSnackbar({ message: "All fields are required.", severity: "error" })
      );
      return;
    }

    const newTrainingData = {
      date: trainingDate,
      time: trainingTime,
      duration: trainingDuration,
      location: trainingLocation,
      description: trainingDescription,
      instructor: trainingInstructor,
      link: trainingLink,
    };

    console.log("New Training Data:", newTrainingData);
    try {
      if (trainingEditMode) {
        const response = await dispatch(
          updateTrainingDetails({
            ...newTrainingData,
            trainingId: selectedTrainingId,
          })
        );
        if (response.error) {
          throw new Error(
            response.error.message || "Failed to update training details."
          );
        }
        dispatch(
          setSnackbar({
            message: "Training details updated successfully.",
            severity: "success",
          })
        );
      } else {
        const response = await dispatch(addTrainingDetails(newTrainingData));
        if (response.error) {
          throw new Error(
            response.error.message || "Failed to add training details."
          );
        }
        addNotifications([
          {
            type: "info",
            text: `A new training session has been added: ${trainingDescription} on ${trainingDate} at ${trainingTime}`,
          },
        ]);
        dispatch(
          setSnackbar({
            message: "Training details added successfully.",
            severity: "success",
          })
        );
      }
      // Fetch updated training data after adding
      dispatch(fetchTrainingData());
    } catch (error) {
      dispatch(
        setSnackbar({
          message: error.message, // Ensure this is a string
          severity: "error",
        })
      );
    } finally {
      resetTrainingForm();
    }
  };

  const handleEditTraining = (data) => {
    console.log("Editing training data:", data); // Add this line
    if (!data) {
      console.error("No training data found to edit.");
      return;
    }
    setTrainingDate(data.date);
    setTrainingTime(data.time);
    setTrainingDuration(data.duration);
    setTrainingLocation(data.location);
    setTrainingDescription(data.description);
    setTrainingInstructor(data.instructor);
    setTrainingLink(data.link);
    setTrainingEditMode(true);
    setSelectedTrainingId(data.trainingId); // Update to use trainingId
  };

  const handleDeleteTraining = async (trainingId) => {
    try {
      await dispatch(deleteTrainingDetails(trainingId)); // Update to use trainingId
      dispatch(
        setSnackbar({
          message: "Training details deleted successfully.",
          severity: "success",
        })
      );
    } catch (error) {
      dispatch(
        setSnackbar({
          message: "Failed to delete training details.",
          severity: "error",
        })
      );
    }
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
    setSelectedTrainingId(""); // Reset selectedTrainingId
  };

  const formatTime = (timeString) => {
    if (!timeString) return "Invalid time"; // Handle invalid time

    // Split the time string into hour and minute
    const [hour, minute] = timeString.split(":").map(Number);

    if (isNaN(hour) || isNaN(minute)) {
      console.error("Invalid time format:", timeString);
      return "Invalid time"; // Handle invalid format
    }

    // Determine AM or PM
    const ampm = hour >= 12 ? "PM" : "AM";

    // Convert hour from 24-hour to 12-hour format
    const formattedHour = hour % 12 || 12; // Convert hour to 12-hour format, treating 0 as 12

    // Return the formatted time
    return `${formattedHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
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
            color: "#800080",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#800080",
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
                    key={`${data.empId}-${data.month}`}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f0f0f0",
                      },
                    }}
                  >
                    <TableCell>
                      {`${data.empId} - ${
                        employees.find((emp) => emp.empId === data.empId)?.name
                      }`}
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
                          handleDeletePerformance(data.empId, data.month)
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
                label="Google Form Link"
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
                    <TableRow key={data.trainingId}>
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
                          onClick={() => handleDeleteTraining(data.trainingId)}
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
              rowsPerPage={rowsPerPage}
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
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPerformanceManagementPage;
