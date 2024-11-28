import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  TablePagination,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormControl,
  InputLabel,
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import Switch from "@mui/material/Switch";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  fetchEmployees,
  fetchEmployeeById,
  addEmployeeAsync,
  updateEmployeeAsync,
  deleteEmployeeAsync,
  setEditEmpId,
} from "../redux/employeeSlice";

const EmployeeManagementPage = () => {
  const initialEmployeeState = {
    empId: "",
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    address: "",
    manager: "",
    startDate: null,
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    roles: [],
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [employee, setEmployee] = useState(initialEmployeeState);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const editEmpId = useSelector((state) => state.employees.editEmpId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const employees = useSelector((state) => state.employees.employees);
  const status = useSelector((state) => state.employees.status);
  const roles = useSelector((state) => state.auth.roles);
  const isSuperAdmin = roles.includes("superAdmin");

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchEmployees());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (editEmpId) {
      dispatch(fetchEmployeeById(editEmpId)); // Fetch employee data by ID
      console.log("Fetching employee data for ID:", editEmpId);
    }
  }, [editEmpId, dispatch]);

  useEffect(() => {
    if (editEmpId) {
      const employeeToEdit = employees.find((emp) => emp.empId === editEmpId);
      if (employeeToEdit) {
        setEmployee({
          ...employeeToEdit,
          startDate: dayjs(employeeToEdit.startDate), // Parse the date string to Day.js object
        });
        console.log("Employee to Edit:", employeeToEdit);
        setCurrentTab(1); // Switch to Add/Edit Employee tab
      }
    }
  }, [editEmpId, employees]); // Ensure to populate employee data when editing

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 0) {
      resetEmployeeForm();
      setPage(0);
    }
  };

  const resetEmployeeForm = () => {
    setEmployee(initialEmployeeState);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleDateChange = (date) => {
    setEmployee({ ...employee, startDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Employee Data:", employee);
    try {
      if (editEmpId) {
        await dispatch(updateEmployeeAsync(employee));
        setSnackbarMessage("Employee updated successfully!");
      } else {
        const { empId, ...newEmployee } = employee;
        newEmployee.roles = isSuperAdmin
          ? employee.roles.length > 0
            ? employee.roles
            : ["employee"]
          : ["employee"];
        await dispatch(addEmployeeAsync(newEmployee));
        setSnackbarMessage("Employee added successfully!");
      }
      setSnackbarOpen(true);
      setCurrentTab(0); // Navigate back to Employee List tab
      setTimeout(() => {
        navigate("/admin/employees");
      }, 1000);
    } catch (error) {
      console.error("Failed to add/update employee:", error);
      setSnackbarMessage("Failed to add/update employee. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const validatePhoneNumbers = () => {
    const phoneRegex = /^\+\d{1,3}\d{1,14}$/; // Regex for validating phone numbers with country code
    return (
      phoneRegex.test(employee.phone) &&
      phoneRegex.test(employee.emergencyContactPhone)
    );
  };

  const handleEditClick = (employee) => {
    dispatch(setEditEmpId(employee.empId)); // Set the editEmpId in the Redux store
    setEmployee({
      ...employee,
      startDate: dayjs(employee.startDate), // Parse the date string to Day.js object
    });
    setCurrentTab(1);
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteEmployeeAsync(employeeToDelete.empId));
      setSnackbarMessage("Employee deleted successfully!");
      setSnackbarOpen(true);
      setOpenDialog(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);
      setSnackbarMessage("Failed to delete employee. Please try again.");
      setSnackbarOpen(true);
      setOpenDialog(false);
      setEmployeeToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setEmployeeToDelete(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setEmployee({ ...employee, roles: value });
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      <Card
        sx={{
          width: "80%",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          overflow: "visible",
        }}
      >
        <CardContent>
          <Box sx={{ width: "100%" }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              textColor="secondary"
              indicatorColor="secondary"
              aria-label="secondary tabs example"
              sx={{
                display: "flex",
                justifyContent: "center",
                "& .MuiTabs-flexContainer": {
                  justifyContent: "center",
                },
              }}
            >
              <Tab value={0} label="Employee List" sx={{ flexGrow: 1 }} />
              <Tab value={1} label="Add/Edit Employee" sx={{ flexGrow: 1 }} />
            </Tabs>
          </Box>
          {currentTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Search by ID or Name"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              <TableContainer
                component={Paper}
                sx={{ backgroundColor: "white" }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#E0BBE4" }}>
                      <TableCell>Employee ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Position</TableCell>
                      <TableCell>Department</TableCell>
                      {isSuperAdmin && <TableCell>Role</TableCell>}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees
                      .filter((emp) => {
                        if (isSuperAdmin) {
                          return (
                            emp.empId.toString().includes(searchQuery) ||
                            emp.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase())
                          );
                        }
                        return (
                          emp.role === "employee" &&
                          (emp.empId.toString().includes(searchQuery) ||
                            emp.name
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()))
                        );
                      })
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((employee) => (
                        <TableRow
                          key={employee.empId}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            {employee.empId}
                          </TableCell>
                          <TableCell>{employee.name}</TableCell>
                          <TableCell>{employee.position}</TableCell>
                          <TableCell>{employee.department}</TableCell>
                          {isSuperAdmin && (
                            <TableCell>{employee.roles.join(", ")}</TableCell>
                          )}
                          <TableCell>
                            <Button onClick={() => handleEditClick(employee)}>
                              <EditIcon />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClick(employee)}
                              sx={{ color: "red" }}
                            >
                              <DeleteIcon />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={employees.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          )}
          {currentTab === 1 && (
            <Box sx={{ p: 2 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="name"
                      name="name"
                      label="Name"
                      value={employee.name}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="position"
                      name="position"
                      label="Position"
                      value={employee.position}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="department"
                      name="department"
                      label="Department"
                      value={employee.department}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="email"
                      name="email"
                      label="Email"
                      value={employee.email}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="phone"
                      name="phone"
                      label="Phone (include country code)"
                      value={employee.phone}
                      onChange={handleChange}
                      fullWidth
                      placeholder="+91.........."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="address"
                      name="address"
                      label="Address"
                      value={employee.address}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="emergencyContactName"
                      name="emergencyContactName"
                      label="Emergency Contact Name"
                      value={employee.emergencyContactName}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="emergencyContactRelationship"
                      name="emergencyContactRelationship"
                      label="Emergency Contact Relationship"
                      value={employee.emergencyContactRelationship}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="emergencyContactPhone"
                      name="emergencyContactPhone"
                      label="Emergency Contact Phone (include country code)"
                      value={employee.emergencyContactPhone}
                      onChange={handleChange}
                      fullWidth
                      placeholder="+91.........."
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="manager"
                      name="manager"
                      label="Manager"
                      value={employee.manager}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Start Date"
                        value={employee.startDate}
                        onChange={handleDateChange}
                        renderInput={(params) => (
                          <TextField {...params} required fullWidth />
                        )}
                        inputFormat="DD-MM-YYYY" // Set the desired date format
                      />
                    </LocalizationProvider>
                  </Grid>
                  {isSuperAdmin && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel id="roles" shrink={!!employee.roles.length}>
                          Roles
                        </InputLabel>
                        <Select
                          label="Roles"
                          multiple
                          id="roles"
                          name="roles"
                          value={employee.roles}
                          onChange={handleRoleChange}
                          renderValue={(selected) => selected.join(", ")} // Display selected roles
                          displayEmpty
                        >
                          <MenuItem value="employee">Employee</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                          {/* Add more roles as needed */}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                >
                  {editEmpId ? "Update" : "Add"}
                </Button>
              </form>
            </Box>
          )}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
          >
            <Alert onClose={handleSnackbarClose} severity="success">
              {snackbarMessage}
            </Alert>
          </Snackbar>
          <Dialog open={openDialog} onClose={handleCancelDelete}>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogContent>
              Are you sure you want to delete {employeeToDelete?.name}?
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete} color="primary">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="secondary">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeManagementPage;
