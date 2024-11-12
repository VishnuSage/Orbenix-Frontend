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
} from "@mui/material";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch"; // Add this import
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux"; // Import Redux hooks
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  fetchEmployees,
  addEmployeeAsync,
  updateEmployeeAsync,
  deleteEmployeeAsync,
} from "../redux/employeeSlice"; // Import actions from the slice

const EmployeeManagementPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [employee, setEmployee] = useState({
    empId: "",
    name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    roles: [], // Change to an array for multiple roles
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [adminOptions, setAdminOptions] = useState({}); // State for admin options
  const [openAccessModal, setOpenAccessModal] = useState(false); // State for access modal
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const navigate = useNavigate();
  const { empId } = useParams(); // Changed id to empId
  const dispatch = useDispatch();

  // Select employees from Redux
  const employees = useSelector((state) => state.employees.employees);
  const status = useSelector((state) => state.employees.status);
  const currentUserRole = useSelector((state) => state.auth.userRole); // Assuming you have this in your Redux store

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchEmployees());
    }
  }, [status, dispatch]);

  useEffect(() => {
    if (empId) {
      const employeeToEdit = employees.find((emp) => emp.empId === empId); // Changed id to empId
      if (employeeToEdit) {
        setEmployee(employeeToEdit);
        setCurrentTab(1);
      }
    }
  }, [empId, employees]);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (newValue === 0) {
      setEmployee({
        empId: "", // Reset empId when switching back to Employee List
        name: "",
        position: "",
        department: "",
        email: "",
        phone: "",
        address: "",
        emergencyContactName: "",
        emergencyContactRelationship: "",
        emergencyContactPhone: "",
        roles: [], // Reset roles to an empty array
      });
      setPage(0); // Reset to the first page when switching back to Employee List
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee({ ...employee, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (empId) {
        await dispatch(updateEmployeeAsync(employee)); // Corrected dispatch
        setSnackbarMessage("Employee updated successfully!");
      } else {
        const { empId, ...newEmployee } = employee;
        newEmployee.roles = employee.roles;
        if (currentUserRole === "super admin") {
          await dispatch(addEmployeeAsync(newEmployee));
        } else {
          newEmployee.role = "employee";
          await dispatch(addEmployeeAsync(newEmployee));
        }
        setSnackbarMessage("Employee added successfully!");
      }
      setSnackbarOpen(true);
      setTimeout(() => {
        navigate("/admin/employees");
      }, 1000);
    } catch (error) {
      console.error("Failed to add/update employee:", error);
      setSnackbarMessage("Failed to add/update employee. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = (employee) => {
    setEmployee(employee);
    setCurrentTab(1); // Switch to edit tab
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await dispatch(deleteEmployeeAsync(employeeToDelete.empId)); // Use the async thunk for deletion
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
    setSearchQuery(e.target.value); // Update search query state
  };

  const handleRoleChange = (e) => {
    const { value } = e.target;
    setEmployee({ ...employee, roles: value }); // Update roles state with selected values
  };

  const handleAccessClick = () => {
    setOpenAccessModal(true);
  };

  const handleAccessModalClose = () => {
    setOpenAccessModal(false);
  };

  const handleToggleOption = (option) => {
    setAdminOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
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
                  justifyContent: "center", // Center the tab items
                },
              }}
            >
              <Tab value={0} label="Employee List" sx={{ flexGrow: 1 }} />
              <Tab value={1} label="Add/Edit Employee" sx={{ flexGrow: 1 }} />
              {currentUserRole === "super admin" && (
                <Tab value={2} label="Admin Access" sx={{ flexGrow: 1 }} />
              )}
            </Tabs>
          </Box>
          {currentTab === 0 && (
            <Box sx={{ p: 2 }}>
              {/* Search Bar */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  label="Search by ID or Name"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={handleSearchChange} // Add this handler
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
                      {currentUserRole === "super admin" && (
                        <TableCell>Role</TableCell>
                      )}{" "}
                      {/* Show Role column only for super admin */}
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees
                      .filter((emp) => {
                        // Show all employees for super admin, otherwise only show employees with role "employee"
                        if (currentUserRole === "super admin") {
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
                          {currentUserRole === "super admin" && (
                            <TableCell>{employee.roles.join(", ")}</TableCell> // Join roles for display
                          )}
                          {/* Show Role only for super admin */}
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
              <Typography variant="h5">
                {empId ? "Edit Employee" : "Add Employee"}
              </Typography>
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
                      id="position" // Ensure the id matches
                      name="position" // Ensure the name matches
                      label="Position" // Label for the input
                      value={employee.position} // Bind the value to the employee state
                      onChange={handleChange} // Handle changes
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="department" // Ensure the id matches
                      name="department" // Ensure the name matches
                      label="Department" // Label for the input
                      value={employee.department} // Bind the value to the employee state
                      onChange={handleChange} // Handle changes
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      id="manager"
                      name="manager"
                      label="Manager"
                      value={employee.manager} // Bind the value to the employee state
                      onChange={handleChange} // Handle changes
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
                      label="Phone"
                      value={employee.phone}
                      onChange={handleChange}
                      fullWidth
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
                      label="Emergency Contact Phone"
                      value={employee.emergencyContactPhone}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  {currentUserRole === "super admin" && (
                    <Grid item xs={12} sm={6}>
                      <Select
                        multiple
                        required
                        id="roles"
                        name="roles"
                        label="Roles"
                        value={employee.roles}
                        onChange={handleRoleChange}
                        fullWidth
                      >
                        <MenuItem value="employee">Employee</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="manager">Manager</MenuItem>{" "}
                        {/* Add other roles as needed */}
                      </Select>
                    </Grid>
                  )}
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ marginTop: 2 }}
                >
                  {empId ? "Update" : "Add"}
                </Button>
              </form>
            </Box>
          )}
          {currentTab === 2 && currentUserRole === "super admin" && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h5">Admin Access Management</Typography>
              <TableContainer
                component={Paper}
                sx={{ backgroundColor: "white" }}
              >
                <Table sx={{ minWidth: 650 }} aria-label="admin access table">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#E0BBE4" }}>
                      <TableCell>Admin ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Access</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees
                      .filter((emp) => emp.roles.includes("admin"))
                      .map((admin) => (
                        <TableRow key={admin.empId}>
                          <TableCell>{admin.empId}</TableCell>
                          <TableCell>{admin.name}</TableCell>
                          <TableCell>
                            <Button onClick={handleAccessClick}>Access</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
          <Dialog open={openAccessModal} onClose={handleAccessModalClose}>
            <DialogTitle>Admin Access Options</DialogTitle>
            <DialogContent>
              <Box>
                {["Option 1", "Option 2", "Option 3"].map((option) => (
                  <Box
                    key={option}
                    sx={{ display: "flex", alignItems: "center", mb: 1 }}
                  >
                    <Typography variant="body1">{option}</Typography>
                    <Switch
                      checked={adminOptions[option] || false}
                      onChange={() => handleToggleOption(option)}
                      color="primary"
                    />
                  </Box>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleAccessModalClose} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeManagementPage;
