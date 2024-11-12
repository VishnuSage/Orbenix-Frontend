import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  TextField,
  Button,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Divider,
  TablePagination,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Chip from "@mui/material/Chip"; // Import Chip component
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import DownloadIcon from "@mui/icons-material/Download";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedPayroll,
  setFilteredHistory,
  setFromMonth,
  setToMonth,
  addLoanRequest,
  setNotification,
  selectPayroll,
  fetchAllPayrolls,
  fetchLoanRequests,
} from "../redux/payrollSlice";

const PayrollPage = () => {
  const dispatch = useDispatch();
  const {
    selectedPayroll,
    filteredHistory,
    loanRequests,
    fromMonth,
    toMonth,
    notification,
    payrollData,
    empId, // Change to empId
    name, // Change to name
  } = useSelector(selectPayroll);
  const [loanAmount, setLoanAmount] = useState("");
  const [repaymentDuration, setRepaymentDuration] = useState("");
  const [loanAmountError, setLoanAmountError] = useState("");
  const [repaymentDurationError, setRepaymentDurationError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state for the entire page

  // Pagination state variables
  const [payrollHistoryPage, setPayrollHistoryPage] = useState(0);
  const [payrollHistoryRowsPerPage, setPayrollHistoryRowsPerPage] = useState(5);
  const [loanHistoryPage, setLoanHistoryPage] = useState(0);
  const [loanHistoryRowsPerPage, setLoanHistoryRowsPerPage] = useState(5);

  const resetFilters = () => {
    dispatch(setFromMonth(""));
    dispatch(setToMonth(""));
    dispatch(setFilteredHistory([]));
  };

  useEffect(() => {
    dispatch(fetchAllPayrolls());
    dispatch(fetchLoanRequests()); // Fetch loan requests on component mount
  }, [dispatch]);

  useEffect(() => {
    setIsLoading(true);
    console.log("Payroll Data:", payrollData); // Log the payroll data
    if (
      payrollData &&
      payrollData.allPayrolls &&
      payrollData.allPayrolls.length > 0
    ) {
      dispatch(setSelectedPayroll(payrollData.allPayrolls[0])); // Adjust this line if necessary
    }
    setIsLoading(false);
  }, [dispatch, payrollData]);

  const filterPayrollHistory = () => {
    if (!fromMonth || !toMonth) {
      dispatch(
        setNotification(
          `Please select both From Month and To Month for ${name}.`
        )
      );
      return;
    }

    const fromDate = new Date(fromMonth);
    const toDate = new Date(toMonth);

    if (fromDate > toDate) {
      dispatch(setNotification("From Month should be before To Month."));
      return;
    }

    setIsLoading(true);
    // Filter 'allPayrolls' instead of the non-existent 'payrollHistory'
    const filtered = payrollData?.allPayrolls?.filter((payroll) => {
      const recordDate = new Date(payroll.month);
      return recordDate >= fromDate && recordDate <= toDate;
    });

    dispatch(setFilteredHistory(filtered));
    setIsLoading(false);
  };

  const handleDownloadPayslip = (payrollDetails) => {
    if (!payrollDetails) {
      console.error("No payroll details provided.");
      return;
    }

    const {
      salary = 0,
      benefits = 0,
      deductionsBreakdown = {},
      netPay = 0,
      month = "Unknown",
    } = payrollDetails;

    // Use empId and name from props (or state)

    const totalDeductions = calculateTotalDeductions(deductionsBreakdown);

    try {
      setIsGeneratingPDF(true);
      const doc = new jsPDF();

      // Add Title
      doc.setFontSize(22);
      doc.setTextColor("#3f51b5");
      doc.text("Payslip", 20, 20);

      // Add Employee Information
      doc.setFontSize(12);
      doc.setTextColor("#000");
      doc.text(`Employee ID: ${empId}`, 20, 40);
      doc.text(` Employee Name: ${name}`, 20, 50);
      doc.text(`Month: ${month}`, 20, 60);

      // Add a line separator
      doc.setDrawColor(0, 0, 0);
      doc.line(20, 65, 190, 65); // Draw a line

      // Add Payroll Details Header
      doc.setFontSize(16);
      doc.text("Payroll Details", 20, 75);

      // Add Payroll Details Table
      const tableData = [
        ["Description", "Amount"],
        ["Salary", `₹${salary}`],
        ["Benefits", `₹${benefits}`],
        ["Deductions", `₹${totalDeductions}`],
        ["Net Pay", `₹${netPay}`],
      ];

      doc.autoTable({
        head: tableData.slice(0, 1),
        body: tableData.slice(1),
        startY: 80,
        theme: "grid",
        styles: { fontSize: 12, cellPadding: 3 },
        headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [240, 240, 240] },
      });

      // Save the PDF
      doc.save(`Payslip-${month}.pdf`);
    } catch (error) {
      console.error("Error generating payslip PDF:", error);
      dispatch(
        setNotification(
          "An error occurred while generating the payslip. Please try again."
        )
      );
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const calculateTotalDeductions = (deductionsBreakdown = {}) => {
    if (typeof deductionsBreakdown !== "object") {
      console.warn("Deductions breakdown is not an object. Returning 0.");
      return 0;
    }

    const totalDeductions = Object.values(deductionsBreakdown).reduce(
      (acc, curr) => {
        const num = parseFloat(curr.replace(/,/g, ""));
        return acc + (isNaN(num) ? 0 : num);
      },
      0
    );

    return totalDeductions;
  };

  const handleLoanRequest = () => {
    const loanAmountValue = parseFloat(loanAmount.replace(/,/g, ""));
    const repaymentDurationValue = parseInt(repaymentDuration, 10);

    setLoanAmountError("");
    setRepaymentDurationError("");

    let hasError = false;

    if (isNaN(loanAmountValue) || loanAmountValue <= 0) {
      setLoanAmountError("Loan amount must be greater than zero.");
      hasError = true;
    }

    if (isNaN(repaymentDurationValue) || repaymentDurationValue <= 0) {
      setRepaymentDurationError(
        "Repayment duration must be greater than zero."
      );
      hasError = true;
    }

    if (hasError) {
      return;
    }

    dispatch(
      addLoanRequest({
        amount: loanAmountValue,
        duration: repaymentDurationValue,
        employeeId: empId, // Change to empId
        requestedDate: new Date().toISOString(),
      })
    );

    const successMessage = "Loan request submitted successfully.";
    dispatch(setNotification({ message: successMessage, type: "success" }));
    setLoanAmount("");
    setRepaymentDuration("");
  };

  const handleCloseSnackbar = () => {
    dispatch(setNotification({ message: "", type: "" }));
  };

  // Handle pagination changes for each table
  const handleChangePayrollHistoryPage = (event, newPage) => {
    setPayrollHistoryPage(newPage);
  };

  const handleChangePayrollHistoryRowsPerPage = (event) => {
    setPayrollHistoryRowsPerPage(parseInt(event.target.value, 10));
    setPayrollHistoryPage(0); // Reset page to 0 when changing rows per page
  };

  const handleChangeLoanHistoryPage = (event, newPage) => {
    setLoanHistoryPage(newPage);
  };

  const handleChangeLoanHistoryRowsPerPage = (event) => {
    setLoanHistoryRowsPerPage(parseInt(event.target.value, 10));
    setLoanHistoryPage(0);
  };

  const employeeLoans = loanRequests
    .filter((loan) => loan.employeeId === empId) // Use empId
    .sort((a, b) => new Date(b.requestedDate) - new Date(a.requestedDate));

  // Pagination for employee loans
  const displayedLoans = employeeLoans.slice(
    loanHistoryPage * loanHistoryRowsPerPage,
    loanHistoryPage * loanHistoryRowsPerPage + loanHistoryRowsPerPage
  );

  // For Payroll History
  const displayedPayrollHistory = filteredHistory.slice(
    payrollHistoryPage * payrollHistoryRowsPerPage,
    payrollHistoryPage * payrollHistoryRowsPerPage + payrollHistoryRowsPerPage
  );

  const formatDate = (dateString) => {
    const [day, month, year] = dateString.split("-"); // Split the string
    const date = new Date(`${year}-${month}-${day}`); // Reorder for Date constructor
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return date.toLocaleDateString("en-GB", options).replace(/\//g, "-");
  };

  return (
    <Box
      sx={{
        padding: 3,
        borderRadius: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        minHeight: "100vh",
      }}
    >
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
          }}
        >
          <LinearProgress sx={{ width: "100%", maxWidth: "600px" }} />
        </Box>
      ) : (
        <Grid item xs={12}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
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
            <Tab label="Current Payroll" />
            <Tab label="Payroll History" />
            <Tab label="Request Loan" />
          </Tabs>

          {activeTab === 0 && (
            <Box
              sx={{ padding: 2, backgroundColor: "#f9f9f9", borderRadius: 2 }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ boxShadow: 1, borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "purple", mb: 2 }}>
                        Payroll Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Employee ID"
                            secondary={empId}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Employee Name"
                            secondary={name}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Salary"
                            secondary={`₹${
                              selectedPayroll
                                ? selectedPayroll.salary
                                : payrollData.salary
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Benefits"
                            secondary={`₹${
                              selectedPayroll
                                ? selectedPayroll.benefits
                                : payrollData.benefits
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Deductions"
                            secondary={`₹${
                              calculateTotalDeductions(
                                selectedPayroll?.deductionsBreakdown
                              ) || "N/A"
                            }`}
                          />
                        </ListItem>
                      </List>
                      <Divider sx={{ my: 2 }} />
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", textAlign: "right" }}
                      >
                        Net Pay: ₹
                        {selectedPayroll
                          ? selectedPayroll.netPay
                          : payrollData.netPay}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        sx={{
                          backgroundColor: "purple",
                          color: "white",
                          "&:hover": {
                            backgroundColor: "darkviolet",
                          },
                          width: "100%",
                          padding: 1.5,
                        }}
                        onClick={() =>
                          handleDownloadPayslip(selectedPayroll || payrollData)
                        }
                        disabled={isGeneratingPDF}
                      >
                        {isGeneratingPDF && (
                          <LinearProgress
                            size={20}
                            sx={{ mr: 1, color: "white" }}
                          />
                        )}
                        Download Payslip
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card
                    variant="outlined"
                    sx={{ boxShadow: 1, borderRadius: 2 }}
                  >
                    <CardContent>
                      <Typography variant="h6" sx={{ color: "purple", mb: 2 }}>
                        Deductions Breakdown
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText
                            primary="Tax"
                            secondary={`₹${
                              selectedPayroll?.deductionsBreakdown?.tax || "0"
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Health Insurance"
                            secondary={`₹${
                              selectedPayroll?.deductionsBreakdown
                                ?.healthInsurance || "0"
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Retirement"
                            secondary={`₹${
                              selectedPayroll?.deductionsBreakdown
                                ?.retirement || "0"
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Loan"
                            secondary={`₹${
                              selectedPayroll?.deductionsBreakdown?.loan || "0"
                            }`}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <>
              <Box
                sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}
              >
                <TextField
                  label="From Month"
                  type="month"
                  value={fromMonth}
                  onChange={(e) => dispatch(setFromMonth(e.target.value))}
                  sx={{ flexGrow: 1 }}
                />
                <TextField
                  label="To Month"
                  type="month"
                  value={toMonth}
                  onChange={(e) => dispatch(setToMonth(e.target.value))}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  onClick={filterPayrollHistory}
                  sx={{
                    backgroundColor: "#4B0082",
                    color: "white",
                  }}
                >
                  Filter
                </Button>
                <Button variant="outlined" onClick={resetFilters}>
                  Reset
                </Button>
              </Box>

              {Array.isArray(filteredHistory) && filteredHistory.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Month
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Salary
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Benefits
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Deductions
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Net Pay
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedPayrollHistory.map((history) => (
                        <TableRow key={history.id}>
                          <TableCell component="th" scope="row">
                            {history.month}
                          </TableCell>
                          <TableCell align="right">
                            ₹{history?.salary || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            ₹{history?.benefits || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            ₹
                            {calculateTotalDeductions(
                              history?.deductionsBreakdown
                            ) || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            ₹{history?.netPay || "N/A"}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              startIcon={<DownloadIcon />}
                              sx={{
                                mt: 2,
                                backgroundColor: "#4B0082",
                                color: "white",
                              }}
                              onClick={() =>
                                handleDownloadPayslip(history.month)
                              }
                              disabled={isGeneratingPDF}
                            >
                              {isGeneratingPDF && (
                                <LinearProgress
                                  size={20}
                                  sx={{ mr: 1, color: "white" }}
                                />
                              )}
                              Download Payslip
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination // Add TablePagination for Payroll History
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredHistory.length}
                    rowsPerPage={payrollHistoryRowsPerPage}
                    page={payrollHistoryPage}
                    onPageChange={handleChangePayrollHistoryPage}
                    onRowsPerPageChange={handleChangePayrollHistoryRowsPerPage}
                  />
                </TableContainer>
              ) : (
                <Typography>
                  No records found for the selected date range.
                </Typography>
              )}
            </>
          )}

          {activeTab === 2 && (
            <>
              <TextField
                label="Loan Amount"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                type="number"
                sx={{ mb: 2, width: "100%" }}
                error={!!loanAmountError}
                helperText={loanAmountError}
              />
              <TextField
                label="Repayment Duration (Months)"
                value={repaymentDuration}
                onChange={(e) => setRepaymentDuration(e.target.value)}
                type="number"
                sx={{ mb: 2, width: "100%" }}
                error={!!repaymentDurationError}
                helperText={repaymentDurationError}
              />
              <Button
                variant="contained"
                onClick={handleLoanRequest}
                sx={{
                  mb: 2,
                  backgroundColor: "#4B0082",
                  color: "white",
                }}
              >
                Request Loan
              </Button>

              {Array.isArray(employeeLoans) && employeeLoans.length > 0 ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Loan Number
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Loan Amount
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Repayment Duration
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Status
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontWeight: "bold", bgcolor: "lightblue" }}
                        >
                          Requested Date
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedLoans.map((loan) => (
                        <TableRow key={loan.loanNumber}>
                          <TableCell component="th" scope="row">
                            {loan.loanNumber}
                          </TableCell>
                          <TableCell align="right">
                            ₹{loan.amount || "N/A"}
                          </TableCell>
                          <TableCell align="right">
                            {loan.duration || "N/A"} months
                          </TableCell>
                          <TableCell align="center">
                            {loan.status === "Approved" ? (
                              <Chip label="Approved " color="success" />
                            ) : loan.status === "Rejected" ? (
                              <Chip label="Rejected" color="error" />
                            ) : (
                              <Chip label="Pending" color="primary" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {formatDate(loan.requestedDate)}{" "}
                            {/* Format the date */}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={employeeLoans.length}
                    rowsPerPage={loanHistoryRowsPerPage}
                    page={loanHistoryPage}
                    onPageChange={handleChangeLoanHistoryPage}
                    onRowsPerPageChange={handleChangeLoanHistoryRowsPerPage}
                  />
                </TableContainer>
              ) : (
                <Typography>No loan requests found.</Typography>
              )}
            </>
          )}
        </Grid>
      )}

      <Snackbar
        open={notification.message !== ""}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={notification.type}
          sx={{ width: "100%" }}
          icon={
            notification.type === "success" ? (
              <CheckCircleIcon fontSize="inherit" />
            ) : notification.type === "error" ? (
              <ErrorIcon fontSize="inherit" />
            ) : (
              <InfoIcon fontSize="inherit" />
            )
          }
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PayrollPage;
