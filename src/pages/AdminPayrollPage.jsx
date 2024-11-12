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
  addPayrollData,
  updatePayrollData,
  deletePayrollData,
  setNotification,
  fetchAllPayrolls,
  addLoanRequest,
  updateLoanRequestStatus,
  selectLoanRequests,
} from "../redux/payrollSlice";
import { addNotification } from "../redux/notificationSlice";

const AdminPayrollPage = () => {
  const dispatch = useDispatch();
  const payrollData = useSelector(
    (state) => state.payroll.payrollData.allPayrolls
  );
  const loanRequests = useSelector(selectLoanRequests);
  const [empId, setEmpId] = useState(""); // Changed to empId
  const [name, setName] = useState(""); // Changed to name
  const [salary, setSalary] = useState("");
  const [benefits, setBenefits] = useState("");
  const [tax, setTax] = useState("");
  const [healthInsurance, setHealthInsurance] = useState("");
  const [retirement, setRetirement] = useState("");
  const [loan, setLoan] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [activeTab, setActiveTab] = useState(0);
  const [fromMonth, setFromMonth] = useState("");
  const [toMonth, setToMonth] = useState("");
  const [filteredPayrollData, setFilteredPayrollData] = useState(payrollData);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loanPage, setLoanPage] = useState(0); // State for loan requests page
  const [loanRowsPerPage, setLoanRowsPerPage] = useState(5); // State for loan requests rows per page
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState(""); // New state for employee search

  useEffect(() => {
    dispatch(fetchAllPayrolls(empId)); // Pass empId to fetch only relevant payrolls
  }, [dispatch, empId]);

  useEffect(() => {
    setFilteredPayrollData(payrollData);
  }, [payrollData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddPayroll = () => {
    const newPayroll = {
      empId, // Use empId
      name, // Use name
      month: "2023-09", // Default month for demo
      salary,
      benefits,
      netPay: String(
        Number(salary.replace(/,/g, "")) + Number(benefits.replace(/,/g, ""))
      ),
      deductionsBreakdown: {
        tax,
        healthInsurance,
        retirement,
        loan,
      },
    };
    dispatch(addPayrollData(newPayroll));
    resetFields();
  };

  const handleEditPayroll = (id) => {
    const payrollToEdit = payrollData.find((payroll) => payroll.id === id);
    if (payrollToEdit) {
      setEmpId(payrollToEdit.empId); // Use empId
      setName(payrollToEdit.name); // Use name
      setSalary(payrollToEdit.salary);
      setBenefits(payrollToEdit.benefits);
      setTax(payrollToEdit.deductionsBreakdown.tax);
      setHealthInsurance(payrollToEdit.deductionsBreakdown.healthInsurance);
      setRetirement(payrollToEdit.deductionsBreakdown.retirement);
      setLoan(payrollToEdit.deductionsBreakdown.loan);
      setEditingId(id);
      setActiveTab(0);
    } else {
      console.error("Payroll not found for ID:", id);
    }
  };

  const handleUpdatePayroll = () => {
    const updatedPayroll = {
      id: editingId,
      empId, // Use empId
      name, // Use name
      month: "2023-09", // Default month for demo
      salary,
      benefits,
      netPay: String(
        Number(salary.replace(/,/g, "")) + Number(benefits.replace(/,/g, ""))
      ),
      deductionsBreakdown: {
        tax,
        healthInsurance,
        retirement,
        loan,
      },
    };
    dispatch(updatePayrollData(updatedPayroll));
    resetFields();
  };

  const handleDeletePayroll = (id) => {
    dispatch(deletePayrollData(id));
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
    setEditingId(null);
  };

  const handleFilterClick = () => {
    const filteredData = filterPayrollHistory();
    setFilteredPayrollData(filteredData);
  };

  const filterPayrollHistory = () => {
    if (!fromMonth || !toMonth) {
      setNotification({
        message: "Please select both From Month and To Month.",
        type: "error",
      });
      return payrollData;
    }

    const fromDate = new Date(fromMonth);
    const toDate = new Date(toMonth);

    if (fromDate > toDate) {
      setNotification({
        message: "From Month should be before To Month.",
        type: "error",
      });
      return payrollData;
    }

    return payrollData.filter((payroll) => {
      const payrollDate = new Date(payroll.month);
      return payrollDate >= fromDate && payrollDate <= toDate;
    });
  };

  const handleResetFilters = () => {
    setFromMonth("");
    setToMonth("");
    setFilteredPayrollData(payrollData);
    setNotification({
      message: "Filters have been reset.",
      type: "info",
    });
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
      const tax = Number(
        payroll.deductionsBreakdown.tax.replace(/,/g, "") || 0
      );
      const healthInsurance = Number(
        payroll.deductionsBreakdown.healthInsurance.replace(/,/g, "") || 0
      );
      const retirement = Number(
        payroll.deductionsBreakdown.retirement.replace(/,/g, "") || 0
      );
      const loan = Number(
        payroll.deductionsBreakdown.loan.replace(/,/g, "") || 0
      );

      const totalDeductions = tax + healthInsurance + retirement + loan;

      return {
        EmployeeID: payroll.empId, // Use empId
        EmployeeName: payroll.name, // Use name
        Month: payroll.month,
        Salary: payroll.salary,
        Benefits: payroll.benefits,
        TotalDeductions: totalDeductions,
        NetPay: payroll.netPay,
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Data");
    XLSX.writeFile(wb, "payroll_data.xlsx");
  };

  const handleApproveLoan = (loanNumber) => {
    // Dispatch the action to update loan request status to "Approved"
    dispatch(updateLoanRequestStatus({ loanNumber, status: "Approved" }));

    // Create a notification object for the employee
    const notification = {
      id: new Date().getTime(), // Unique ID for the notification
      text: `Loan ${loanNumber} has been approved successfully.`,
      type: "success",
      link: "/employee-loan-requests", // Link to navigate when notification is clicked
    };

    // Dispatch an action to add the notification to the global state
    dispatch(addNotification(notification));

    // Set the local notification for the admin side
    setNotification({
      message: "Loan approved successfully.",
      type: "success",
    });
  };

  const handleRejectLoan = (loanNumber) => {
    // Dispatch the action to update loan request status to "Rejected"
    dispatch(updateLoanRequestStatus({ loanNumber, status: "Rejected" }));

    // Create a notification object for the employee
    const notification = {
      id: new Date().getTime(), // Unique ID for the notification
      text: `Loan ${loanNumber} has been rejected.`,
      type: "error",
      link: "/employee-loan-requests", // Link to navigate when notification is clicked
    };

    // Dispatch an action to add the notification to the global state
    dispatch(addNotification(notification));

    // Set the local notification for the admin side
    setNotification({
      message: "Loan rejected successfully.",
      type: "error",
    });
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
              color: "#800080", // Set tab text color to purple
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#800080", // Set underline color to purple
            },
          }}
          variant="scrollable"
        >
          <Tab label="Add/Edit Payroll" />
          <Tab label="Payroll History" />
          <Tab label="Loan Requests" />
        </Tabs>
        {activeTab === 0 ? (
          // Add/Edit Payroll Tab
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
            <TextField
              label="Employee ID"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Employee Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 2 }}
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
          // Payroll History Tab
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
              sx={{ mb: 2, width: "100%" }} // Full width
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
                  {(rowsPerPage > 0
                    ? filteredPayrollData
                        .filter(
                          (payroll) =>
                            payroll.employeeId
                              .toString()
                              .includes(employeeSearchQuery) ||
                            payroll.employeeName
                              .toLowerCase()
                              .includes(employeeSearchQuery.toLowerCase())
                        )
                        .slice(
                          page * rowsPerPage,
                          page * rowsPerPage + rowsPerPage
                        )
                    : filteredPayrollData
                  ).map((payroll) => (
                    <TableRow key={payroll.id}>
                      <TableCell>{payroll.empId}</TableCell>
                      <TableCell>{payroll.name}</TableCell>
                      <TableCell>{payroll.month}</TableCell>
                      <TableCell>{payroll.salary}</TableCell>
                      <TableCell>{payroll.benefits}</TableCell>
                      <TableCell>
                        {Number(
                          payroll.deductionsBreakdown.tax.replace(/,/g, "") || 0
                        ) +
                          Number(
                            payroll.deductionsBreakdown.healthInsurance.replace(
                              /,/g,
                              ""
                            ) || 0
                          ) +
                          Number(
                            payroll.deductionsBreakdown.retirement.replace(
                              /,/g,
                              ""
                            ) || 0
                          ) +
                          Number(
                            payroll.deductionsBreakdown.loan.replace(
                              /,/g,
                              ""
                            ) || 0
                          )}
                      </TableCell>
                      <TableCell>{payroll.netPay}</TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEditPayroll(payroll.id)}
                          sx={{ color: "blue" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeletePayroll(payroll.id)}
                          sx={{ color: "red" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
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
          // Loan Requests Tab
          <Box sx={{ p: 2, overflowY: "auto" }}>
            <TextField
              label="Search by Loan Number or Employee ID"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 2, width: "100%" }} // Full width
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
                  {Array.isArray(loanRequests) && loanRequests.length > 0 ? (
                    loanRequests
                      .filter(
                        (loan) =>
                          loan.loanNumber.toString().includes(searchQuery) ||
                          loan.employeeId.toString().includes(searchQuery)
                      )
                      .slice(
                        loanPage * loanRowsPerPage,
                        loanPage * loanRowsPerPage + loanRowsPerPage
                      )
                      .map((loan, index) => (
                        <TableRow
                          key={loan.loanNumber}
                          sx={{
                            backgroundColor:
                              index % 2 === 0 ? "#ffffff" : "#f9f9f9",
                            "&:hover": {
                              backgroundColor: "#e0e0e0",
                            },
                          }}
                        >
                          <TableCell>{loan.loanNumber}</TableCell>
                          <TableCell>{loan.employeeId}</TableCell>
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
                loanRequests.filter(
                  (loan) =>
                    loan.loanNumber.toString().includes(searchQuery) ||
                    loan.employeeId.toString().includes(searchQuery)
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
