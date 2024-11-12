import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  loginEmployee,
  sendOtp,
  verifyOtp,
  setError,
  clearOtpState,
} from "../redux/authSlice";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BackgroundImage from "../assets/login-bg.jpg";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const StyledCard = styled(Card)({
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: "10px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
});

const Auth = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleSelection, setRoleSelection] = useState(false); // New state for role selection
  const [selectedRole, setSelectedRole] = useState(""); // State to hold the selected role

  const dispatch = useDispatch();
  const navigate = useNavigate(); // Initialize useNavigate
  const { otpSent, error, loading } = useSelector((state) => state.auth);
  const employees = useSelector((state) => state.employees.employees);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [otpTimer]);

  // Define the generateOtp function
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const validatePassword = (password) => {
    const conditions = [
      {
        satisfied: password.length >= 6,
        message: "At least 6 characters long",
      },
      {
        satisfied: /[0-9]/.test(password),
        message: "Contains at least one number",
      },
      {
        satisfied: /[a-zA-Z]/.test(password),
        message: "Contains at least one letter",
      },
      {
        satisfied: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        message: "Contains at least one special character",
      },
    ];

    const unsatisfiedConditions = conditions
      .filter((condition) => !condition.satisfied)
      .map((condition) => condition.message);

    return unsatisfiedConditions.length > 0
      ? unsatisfiedConditions.join(", ")
      : "";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Only validate password if registering
    if (isRegistering) {
      const validationError = validatePassword(newPassword);
      setPasswordValidationMessage(validationError);
    } else {
      // Reset validation message if in login mode
      setPasswordValidationMessage("");
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleAuthSubmit = useCallback(() => {
    if (isRegistering) {
      const employeeExists = employees.some(
        (emp) => emp.email === emailOrPhone || emp.phone === emailOrPhone
      );
      if (!employeeExists) {
        dispatch(setError("You must be added by an admin before registering."));
        setSnackbarOpen(true);
      } else if (password !== confirmPassword) {
        dispatch(setError("Passwords do not match."));
        setSnackbarOpen(true);
      } else if (passwordValidationMessage) {
        dispatch(setError(passwordValidationMessage));
        setSnackbarOpen(true);
      } else if (!otpSent) {
        const otp = generateOtp();
        dispatch(sendOtp(otp));
        setOtpTimer(30);
        setIsResendDisabled(true);
      } else {
        if (otp === "") {
          dispatch(setError("Please enter the OTP."));
          setSnackbarOpen(true);
        } else {
          dispatch(verifyOtp(otp)); // Pass the OTP here
        }
      }
    } else {
      const employee = employees.find((emp) => emp.email === emailOrPhone);
      if (employee && employee.password === password) {
        dispatch(loginEmployee(employee));
        if (employee.roles.length > 1) {
          setRoleSelection(true); // Show role selection if multiple roles
        } else {
          navigate(
            employee.roles[0] === "admin" ? "/admin/employees" : "/payroll"
          );
        }
      } else {
        dispatch(
          setError(
            "No employee found with this email or phone number or incorrect password."
          )
        );
        setSnackbarOpen(true);
      }
    }
  }, [
    isRegistering,
    emailOrPhone,
    password,
    confirmPassword,
    otp,
    otpSent,
    employees,
    dispatch,
    passwordValidationMessage,
    navigate,
  ]);

  const handleVerifyOtp = useCallback(() => {
    if (otp && otpSent) {
      dispatch(verifyOtp(otp));
    } else if (!otp) {
      dispatch(setError("Please enter the OTP."));
      setSnackbarOpen(true);
    } else if (!otpSent) {
      dispatch(setError("OTP has not been sent."));
      setSnackbarOpen(true);
    }
  }, [otp, otpSent, dispatch]);

  const handleResendOtp = useCallback(() => {
    const otp = generateOtp();
    dispatch(sendOtp(otp));
    setOtpTimer(30);
    setIsResendDisabled(true);
  }, [dispatch]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
    dispatch(setError(null));
    dispatch(clearOtpState());
  }, [dispatch]);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    navigate(role === "admin" ? "/admin/employees" : "/payroll");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StyledCard sx={{ width: "400px", p: 3 }}>
        {roleSelection ? (
          <>
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
              Select Your Role
            </Typography>
            <Button
              onClick={() => handleRoleSelection("admin")}
              variant="contained"
              color="primary"
              sx={{ width: "100%", mb: 1 }}
            >
              Continue as Admin
            </Button>
            <Button
              onClick={() => handleRoleSelection("employee")}
              variant="contained"
              color="secondary"
              sx={{ width: "100%" }}
            >
              Continue as Employee
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" align="center" sx={{ mb: 2 }}>
              {isRegistering ? "Register" : "Login"}
            </Typography>
            <CardContent>
              <TextField
                label="Email or Phone Number"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                fullWidth
                margin="normal"
                InputProps={{
                  startAdornment: <LockIcon sx={{ mr: 1 }} />,
                  endAdornment: (
                    <Button
                      onClick={handleTogglePasswordVisibility}
                      sx={{ p: 0, mr: -2 }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  ),
                }}
              />
              {isRegistering && password && (
                <Typography
                  variant="caption"
                  color={passwordValidationMessage ? "error" : "green"}
                >
                  Password Strength:{" "}
                  {passwordValidationMessage ? "Weak" : "Strong"}
                </Typography>
              )}
              {isRegistering && (
                <>
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <Button
                          onClick={handleToggleConfirmPasswordVisibility}
                          sx={{ p: 0, mr: -2 }}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </Button>
                      ),
                    }}
                  />
                  {otpSent && (
                    <>
                      <TextField
                        label="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                      <Button
                        onClick={handleResendOtp}
                        disabled={isResendDisabled}
                        sx={{ mt: 1, width: "100%" }}
                      >
                        Resend OTP {otpTimer > 0 && `(${otpTimer}s)`}
                      </Button>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          onClick={handleVerifyOtp}
                          variant="contained"
                          color="primary"
                          sx={{ width: "100%" }}
                          disabled={!otp || !otpSent || loading}
                        >
                          {loading ? (
                            <CircularProgress size={24} />
                          ) : (
                            "Verify OTP"
                          )}
                        </Button>
                      </Box>
                    </>
                  )}
                </>
              )}
              {error && <Typography color="error">{error}</Typography>}
              <Button
                onClick={handleAuthSubmit}
                variant="contained"
                color="primary"
                sx={{
                  width: "100%",
                  mt: 2,
                  "&:hover": { backgroundColor: "#1976d2" },
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : isRegistering ? (
                  otpSent ? (
                    "Verify OTP"
                  ) : (
                    "Register"
                  )
                ) : (
                  "Login"
                )}
              </Button>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" align="center">
                {isRegistering
                  ? "Already have an account?"
                  : "Don't have an account?"}
                <Button
                  onClick={() => setIsRegistering(!isRegistering)}
                  sx={{ ml: 1, textDecoration: "underline" }}
                >
                  {isRegistering ? "Login" : "Register"}
                </Button>
              </Typography>
            </CardContent>
          </>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert onClose={handleSnackbarClose} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </StyledCard>
    </Box>
  );
};

export default Auth;
