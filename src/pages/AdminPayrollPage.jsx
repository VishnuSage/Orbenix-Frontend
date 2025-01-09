import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Tabs,
  Tab,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { useDispatch, useSelector } from "react-redux";
import {
  createPayroll,
  updatePayroll,
  deletePayroll,
  setNotification,
  fetchAllPayrolls,
  addLoanRequest,
  updateLoanRequestStatus,
  selectLoanRequests,
  filterPayrollData,
  searchPayrollData,
  setSelectedPayroll,
} from "../redux/payrollSlice";
import { fetchEmployees } from "../redux/employeeSlice";
import { useNotificationContext } from "../components/NotificationContext"; // Adjust the path as necessary

const AdminPayrollPage = () => {
  const dispatch = useDispatch();
  const payrollData = useSelector(
    (state) => state.payroll.payrollData.allPayrolls
  );
  const employees = useSelector((state) => state.employees.employees);
  const loanRequests = useSelector(selectLoanRequests);
  const filteredPayrollData = useSelector(
    (state) => state.payroll.filteredHistory
  );

  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [salary, setSalary] = useState("");
  const [benefits, setBenefits] = useState("");
  const [tax, setTax] = useState("");
  const [healthInsurance, setHealthInsurance] = useState("");
  const [retirement, setRetirement] = useState("");
  const [loan, setLoan] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loanPage, setLoanPage] = useState(0);
  const [loanRowsPerPage, setLoanRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [selectedMonth, setSelectedMonth] = useState("");

  const { addNotifications } = useNotificationContext(); // Use the context to get the addNotifications function

  useEffect(() => {
    dispatch(fetchAllPayrolls());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEmployees()); // Fetch employees initially
  }, [dispatch]);

  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0"); // Pad with leading zero if needed
    const currentMonthString = `${currentYear}-${currentMonth}`;

    setFromMonth(currentMonthString);
    setToMonth(currentMonthString);

    // Fetch payroll data for the current month
    dispatch(
      filterPayrollData({
        fromMonth: currentMonthString,
        toMonth: currentMonthString,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (activeTab === 1) {
      dispatch(filterPayrollData({ fromMonth, toMonth }));
    }
  }, [dispatch, fromMonth, toMonth, activeTab, payrollData]);

  useEffect(() => {
    dispatch(filterPayrollData({ fromMonth, toMonth })); // Dispatch filter action
  }, [dispatch, fromMonth, toMonth]);

  useEffect(() => {
    dispatch(searchPayrollData(employeeSearchQuery)); // Dispatch search action
  }, [dispatch, employeeSearchQuery]);

  useEffect(() => {
    if (editingId) {
      setActiveTab(0);
    }
  }, [editingId]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddPayroll = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

    const newPayroll = {
      empId,
      name,
      month: `${currentYear}-${currentMonth}`,
      salary,
      benefits,
      netPay: String(Number(salary) + Number(benefits)),
      deductionsBreakdown: {
        tax,
        healthInsurance,
        retirement,
        loan,
      },
    };
    dispatch(createPayroll(newPayroll));
    resetFields(); // Reset fields after adding
    setPage(0);
  };

  const handleEditPayroll = (_id) => {
    console.log("_id parameter:", _id);
    const payrollToEdit = payrollData.find((payroll) => payroll._id === _id);
    console.log("Payroll to edit:", payrollToEdit);
    if (payrollToEdit) {
      console.log("Payroll found, updating state");
      setEmpId(payrollToEdit.empId);
      setName(payrollToEdit.name);
      setSalary(payrollToEdit.salary);
      setBenefits(payrollToEdit.benefits);
      setTax(payrollToEdit.deductionsBreakdown.tax);
      setHealthInsurance(payrollToEdit.deductionsBreakdown.healthInsurance);
      setRetirement(payrollToEdit.deductionsBreakdown.retirement);
      setLoan(payrollToEdit.deductionsBreakdown.loan);
      setEditingId(_id);
      setSelectedMonth(payrollToEdit.month);
      setActiveTab(0);
      dispatch(setSelectedPayroll(payrollToEdit));
    } else {
      console.error("Payroll not found for ID:", _id);
    }
  };

  const handleUpdatePayroll = () => {
    const updatedPayroll = {
      _id: editingId,
      empId,
      name,
      month: selectedMonth,
      salary,
      benefits,
      netPay: String(Number(salary) + Number(benefits)),
      deductionsBreakdown: {
        tax,
        healthInsurance,
        retirement,
        loan,
      },
    };
    dispatch(updatePayroll(updatedPayroll));
    resetFields(); // Reset fields after updating
    setPage(0);
  };

  const handleDeletePayroll = (id) => {
    const payrollToDelete = payrollData.find((payroll) => payroll._id === id);
    if (payrollToDelete) {
      dispatch(
        deletePayroll({
          _id: id,
        })
      );
      setPage(0);
    }
  };

  const resetFields = () => {
    setEmpId("");
    setName("");
    setSalary("");
    setBenefits("");
    setTax("");
    setHealthInsurance("");
    setRetirement("");
    setLoan("");
    setEditingId(null); // Reset editingId to null
  };

  const handleFilterClick = () => {
    dispatch(filterPayrollData({ fromMonth, toMonth })); // Dispatch filter action
  };

  const handleResetFilters = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0"); // Pad with leading zero if needed
    const currentMonthString = `${currentYear}-${currentMonth}`;

    setFromMonth(currentMonthString);
    setToMonth(currentMonthString);
    dispatch(
      filterPayrollData({
        fromMonth: currentMonthString,
        toMonth: currentMonthString,
      })
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleLoanChangePage = (event, newPage) => {
    setLoanPage(newPage);
  };

  const handleLoanChangeRowsPerPage = (event) => {
    setLoanRowsPerPage(parseInt(event.target.value, 10));
    setLoanPage(0);
  };

  const exportToExcel = () => {
    const dataToExport = filteredPayrollData.map((payroll) => {
      const month = new Date(payroll.month);
      const formattedMonth = `${month.getFullYear()}-${String(
        month.getMonth() + 1
      ).padStart(2, "0")}`;

      return {
        EmployeeId: payroll.empId,
        EmployeeName: payroll.name,
        Month: formattedMonth,
        Salary: payroll.salary,
        Benefits: payroll.benefits,
        TotalDeductions:
          payroll.deductionsBreakdown.tax +
          payroll.deductionsBreakdown.healthInsurance +
          payroll.deductionsBreakdown.retirement +
          payroll.deductionsBreakdown.loan,
        NetPay: payroll.netPay,
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Data");
    XLSX.writeFile(wb, "payroll_data.xlsx");
  };

  const handleApproveLoan = (loanNumber) => {
    dispatch(updateLoanRequestStatus({ loanNumber, status: "Approved" }));
    addNotifications([
      {
        type: "success",
        text: `Loan ${loanNumber} has been approved successfully.`,
      },
    ]);
  };

  const handleRejectLoan = (loanNumber) => {
    dispatch(updateLoanRequestStatus({ loanNumber, status: "Rejected" }));
    addNotifications([
      {
        type: "error",
        text: `Loan ${loanNumber} has been rejected.`,
      },
    ]);
  };

  const loanRequestsArray = Array.isArray(loanRequests) ? loanRequests : [];

  const sortedPayrollData = filteredPayrollData
    .filter(
      (payroll) =>
        payroll.empId.toString().includes(employeeSearchQuery) ||
        payroll.name.toLowerCase().includes(employeeSearchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.month) - new Date(a.month)); // Sort by month descending

  const paginatedPayrollData = sortedPayrollData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const sortedLoanRequests = loanRequestsArray
    .filter(
      (loan) =>
        loan.loanNumber.toString().includes(searchQuery) ||
        loan.empId.toString().includes(searchQuery)
    )
    .sort((a, b) => new Date(b.requestedDate) - new Date(a.requestedDate)); // Sort by requestedDate descending

  const paginatedLoanRequests = sortedLoanRequests.slice(
    loanPage * loanRowsPerPage,
    loanPage * loanRowsPerPage + loanRowsPerPage
  );

  const handleEmpIdChange = (e) => {
    const selectedEmpId = e.target.value;
    setEmpId(selectedEmpId);

    // Find the employee name based on the selected employee ID
    const selectedEmployee = employees.find(
      (employee) => employee.empId === selectedEmpId
    );
    if (selectedEmployee) {
      setName(selectedEmployee.name); // Automatically populate the name field
    } else {
      setName(""); // Clear the name field if no employee is found
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        padding: 3,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
      }}
    >
      <Grid item xs={12}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
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
          <Tab label="Add/Edit Payroll" />
          <Tab label="Payroll History" />
          <Tab label="Loan Requests" />
        </Tabs>
        {activeTab === 0 ? (
          <Box
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2 }}>
              Add/Edit Payroll
            </Typography>
            <FormControl sx={{ mb: 2 }}>
              <InputLabel id="empId-label">Employee ID</InputLabel>
              <Select
                labelId="empId-label"
                value={empId}
                onChange={handleEmpIdChange} // Use the new change handler
              >
                {employees.map((employee) => (
                  <MenuItem key={employee.id} value={employee.empId}>
                    {employee.empId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Employee Name"
              value={name} // Use the name state to display the employee name
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                readOnly: true, // Make the field read-only
              }}
            />
            <TextField
              label="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Benefits"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Deductions Breakdown
            </Typography>
            <TextField
              label="Tax"
              value={tax}
              onChange={(e) => setTax(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Health Insurance"
              value={healthInsurance}
              onChange={(e) => setHealthInsurance(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Retirement"
              value={retirement}
              onChange={(e) => setRetirement(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Loan"
              value={loan}
              onChange={(e) => setLoan(e.target.value)}
              sx={{ mb: 2 }}
            />
            {editingId ? (
              <Button variant="contained" onClick={handleUpdatePayroll}>
                Update Payroll
              </Button>
            ) : (
              <Button variant="contained" onClick={handleAddPayroll}>
                Add Payroll
              </Button>
            )}
          </Box>
        ) : activeTab === 1 ? (
          <Box sx={{ p: 2, overflowY: "auto" }}>
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                label="From Month"
                type="month"
                value={fromMonth}
                onChange={(e) => setFromMonth(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                label="To Month"
                type="month"
                value={toMonth}
                onChange={(e) => setToMonth(e.target.value)}
                sx={{ flexGrow: 1 }}
              />
              <Button variant="contained" onClick={handleFilterClick}>
                Filter
              </Button>
              <Button variant="outlined" onClick={handleResetFilters}>
                Reset
              </Button>
            </Box>

            <TextField
              label="Search by Employee ID or Name"
              variant="outlined"
              value={employeeSearchQuery}
              onChange={(e) => setEmployeeSearchQuery(e.target.value)}
              sx={{ mb: 2, width: "100%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Month</TableCell>
                    <TableCell>Salary</TableCell>
                    <TableCell>Benefits</TableCell>
                    <TableCell>Total Deductions</TableCell>
                    <TableCell>Net Pay</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPayrollData.map((payroll) => {
                    const month = new Date(payroll.month);
                    const formattedMonth = `${month.getFullYear()}-${String(
                      month.getMonth() + 1
                    ).padStart(2, "0")}`;

                    return (
                      <TableRow key={payroll._id}>
                        <TableCell>{payroll.empId}</TableCell>
                        <TableCell>{payroll.name}</TableCell>
                        <TableCell>{formattedMonth}</TableCell>
                        <TableCell>{payroll.salary}</TableCell>
                        <TableCell>{payroll.benefits}</TableCell>
                        <TableCell>
                          {payroll.deductionsBreakdown.tax +
                            payroll.deductionsBreakdown.healthInsurance +
                            payroll.deductionsBreakdown.retirement +
                            payroll.deductionsBreakdown.loan}
                        </TableCell>
                        <TableCell>{payroll.netPay}</TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleEditPayroll(payroll._id)}
                            sx={{ color: "blue" }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeletePayroll(payroll._id)}
                            sx={{ color: "red" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
              }}
            >
              <Button variant="contained" onClick={exportToExcel}>
                Export to Excel
              </Button>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredPayrollData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, overflowY: "auto" }}>
            <TextField
              label="Search by Loan Number or Employee ID"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2, width: "100%" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Loan Number
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Employee ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Loan Amount
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Duration (Months)
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loanRequestsArray.length > 0 ? (
                    paginatedLoanRequests.map((loan) => (
                      <TableRow key={loan.loanNumber}>
                        <TableCell>{loan.loanNumber}</TableCell>
                        <TableCell>{loan.empId}</TableCell>
                        <TableCell>₹{loan.amount}</TableCell>
                        <TableCell>{loan.duration}</TableCell>
                        <TableCell
                          sx={{
                            fontWeight: "bold",
                            color:
                              loan.status === "Pending"
                                ? "orange"
                                : loan.status === "Approved"
                                ? "green"
                                : "red",
                          }}
                        >
                          {loan.status}
                        </TableCell>
                        <TableCell>
                          {loan.status === "Pending" && (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() =>
                                  handleApproveLoan(loan.loanNumber)
                                }
                                sx={{ mr: 1 }}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="contained"
                                color="error"
                                onClick={() =>
                                  handleRejectLoan(loan.loanNumber)
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No loan requests available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={
                loanRequestsArray.filter(
                  (loan) =>
                    loan.loanNumber.toString().includes(searchQuery) ||
                    loan.empId.toString().includes(searchQuery)
                ).length
              }
              rowsPerPage={loanRowsPerPage}
              page={loanPage}
              onPageChange={handleLoanChangePage}
              onRowsPerPageChange={handleLoanChangeRowsPerPage}
            />
          </Box>
        )}
      </Grid>
      <Snackbar
        open={notification.message !== ""}
        autoHideDuration={6000}
        onClose={() => setNotification({ message: "", type: "" })}
      >
        <Alert
          severity={notification.type}
          sx={{ width: "100%" }}
          iconMapping={{
            success: <CheckCircleIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
            info: <InfoIcon fontSize="inherit" />,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminPayrollPage;
