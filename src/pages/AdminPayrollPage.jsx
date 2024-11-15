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
  filterPayrollData,
  searchPayrollData,
} from "../redux/payrollSlice";
import { useNotificationContext } from "../components/NotificationContext"; // Adjust the path as necessary

const AdminPayrollPage = () => {
  const dispatch = useDispatch();
  const payrollData = useSelector(
    (state) => state.payroll.payrollData.allPayrolls
  );
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

  const { addNotifications } = useNotificationContext(); // Use the context to get the addNotifications function

  useEffect(() => {
    dispatch(fetchAllPayrolls(empId));
  }, [dispatch, empId]);

  useEffect(() => {
    dispatch(filterPayrollData({ fromMonth, toMonth })); // Dispatch filter action
  }, [dispatch, fromMonth, toMonth]);

  useEffect(() => {
    dispatch(searchPayrollData(employeeSearchQuery)); // Dispatch search action
  }, [dispatch, employeeSearchQuery]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAddPayroll = () => {
    const newPayroll = {
      empId,
      name,
      month: "2023-09",
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
      setEmpId(payrollToEdit.empId);
      setName(payrollToEdit.name);
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
      empId,
      name,
      month: "2023-09",
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
    dispatch(filterPayrollData({ fromMonth, toMonth })); // Dispatch filter action
  };

  const handleResetFilters = () => {
    setFromMonth("");
    setToMonth("");
    dispatch(filterPayrollData({ fromMonth: "", toMonth: "" })); // Reset filter action
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
        EmployeeId: payroll.empId,
        EmployeeName: payroll.name,
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
                  {paginatedPayrollData.map((payroll) => (
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
