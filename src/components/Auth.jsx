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
  loginEmployeeAsync,
  sendOtpAsync,
  verifyOtpAsync,
  sendPasswordResetAsync,
  setError,
  clearOtpState,
  toggleRegistering,
  setOtpTimer,
} from "../redux/authSlice";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BackgroundImage from "../assets/login-bg.jpg";
import { useNavigate } from "react-router-dom";

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
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roleSelection, setRoleSelection] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    otpSent,
    error,
    loading,
    isRegistering,
    loadingOtpVerification,
    otpTimer,
    roles, // Assuming you have roles in your auth state
  } = useSelector((state) => state.auth);
  const employees = useSelector((state) => state.employees.employees);

  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      setIsResendDisabled(true);
      timer = setInterval(() => {
        dispatch(setOtpTimer(otpTimer - 1));
      }, 1000);
    } else {
      setIsResendDisabled(false);
      dispatch(setOtpTimer(0));
    }
    return () => clearInterval(timer);
  }, [otpTimer, dispatch]);

  const validateEmailOrPhone = (input) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern
    const phonePattern = /^[0-9]{10}$/; // Assumes a 10-digit phone number
    return emailPattern.test(input) || phonePattern.test(input);
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

    if (isRegistering) {
      const validationError = validatePassword(newPassword);
      setPasswordValidationMessage(validationError);
    } else {
      setPasswordValidationMessage("");
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleAuthSubmit = useCallback(async () => {
    if (!validateEmailOrPhone(emailOrPhone)) {
      const errorMessage = "Please enter a valid email or phone number.";
      dispatch(setError(errorMessage));
      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
      return;
    }

    if (forgotPassword) {
      try {
        const employeeExistsInList = (emailOrPhone) => {
          return employees.some(
            (emp) => emp.email === emailOrPhone || emp.phone === emailOrPhone
          );
        };
        if (!employeeExistsInList) {
          const errorMessage = "This email or phone number does not exist.";
          dispatch(setError(errorMessage));
          setSnackbarMessage(errorMessage);
          setSnackbarOpen(true);
          return;
        }
        await dispatch(sendOtpAsync(emailOrPhone)).unwrap();

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
        setSnackbarMessage(
          isEmail
            ? "A link has been sent to your email."
            : "An OTP has been sent to your phone number."
        );
        setSnackbarOpen(true);

        dispatch(setOtpTimer(30));
        setIsResendDisabled(true);
      } catch (error) {
        dispatch(setError(error.message || "Network error"));
        setSnackbarMessage(error.message || "Network error");
        setSnackbarOpen(true);
      }
    } else if (isRegistering) {
      const employeeExists = employees.some(
        (emp) => emp.email === emailOrPhone || emp.phone === emailOrPhone
      );
      if (!employeeExists) {
        dispatch(setError("You must be added by an admin before registering."));
        setSnackbarMessage("You must be added by an admin before registering.");
        setSnackbarOpen(true);
      } else if (password !== confirmPassword) {
        dispatch(setError("Passwords do not match."));
        setSnackbarMessage("Passwords do not match.");
        setSnackbarOpen(true);
      } else if (passwordValidationMessage) {
        dispatch(setError(passwordValidationMessage));
        setSnackbarMessage(passwordValidationMessage);
        setSnackbarOpen(true);
      } else if (!otpSent) {
        try {
          await dispatch(sendOtpAsync(emailOrPhone)).unwrap();
          dispatch(setOtpTimer(30));
          setIsResendDisabled(true);
        } catch (error) {
          dispatch(setError(error.message || "Network error"));
          setSnackbarMessage(error.message || "Network error");
          setSnackbarOpen(true);
        }
      } else {
        if (otp === "") {
          dispatch(setError("Please enter the OTP."));
          setSnackbarMessage("Please enter the OTP.");
          setSnackbarOpen(true);
        } else {
          try {
            await dispatch(verifyOtpAsync({ emailOrPhone, otp })).unwrap();
            // Handle successful OTP verification
          } catch (error) {
            dispatch(setError("Invalid OTP"));
            setSnackbarMessage("Invalid OTP");
            setSnackbarOpen(true);
          }
        }
      }
    } else {
      try {
        const result = await dispatch(
          loginEmployeeAsync({ emailOrPhone, password })
        ).unwrap();
        // Check if the user is a super admin
        if (result.roles && result.roles.length > 0) {
          const role = result.roles[0]; // Assuming the first role is the primary one
          setUserRole(role); // Set the user role
          // Check if the user is a super admin
          if (role === "super admin") {
            navigate("/admin/employees"); // Redirect to the admin dashboard
          } else {
            navigate("/payroll"); // Redirect to the regular dashboard
          }
        }
      } catch (error) {
        dispatch(
          setError(
            "No employee found with this email or phone number or incorrect password."
          )
        );
        setSnackbarMessage("No employee found or incorrect password.");
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
    forgotPassword,
  ]);

  const handleResendOtp = useCallback(async () => {
    try {
      await dispatch(sendOtpAsync(emailOrPhone)).unwrap();
      dispatch(setOtpTimer(30));
      setIsResendDisabled(true);
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+ $/.test(emailOrPhone);
      setSnackbarMessage(
        isEmail
          ? "A link has been sent to your email."
          : "An OTP has been sent to your phone number."
      );
      setSnackbarOpen(true);
    } catch (error) {
      dispatch(setError(error.message || "Network error"));
      setSnackbarMessage(error.message || "Network error");
      setSnackbarOpen(true);
    }
  }, [dispatch, emailOrPhone]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
    dispatch(setError(null));
    dispatch(clearOtpState());
  }, [dispatch]);

  const handleRoleSelection = (role) => {
    setUserRole(role);
    navigate(role === "admin" ? "/admin/employees" : "/payroll");
  };

  const handleForgotPassword = () => {
    setForgotPassword(true);
    setEmailOrPhone(""); // Clear the input field
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      dispatch(setError("Passwords do not match."));
      setSnackbarMessage("Passwords do not match.");
      setSnackbarOpen(true);
      return;
    }

    try {
      await dispatch(
        sendPasswordResetAsync({ emailOrPhone, newPassword })
      ).unwrap();
      setSnackbarMessage("Password has been reset successfully.");
      setSnackbarOpen(true);
      setForgotPassword(false); // Close the reset password form
    } catch (error) {
      dispatch(setError(error.message || "Network error"));
      setSnackbarMessage(error.message || "Network error");
      setSnackbarOpen(true);
    }
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
        {forgotPassword ? (
          <>
            <Typography variant="h5" align="center" sx={{ mb: 2 }}>
              Forgot Password
            </Typography>
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
            <Button
              onClick={handleAuthSubmit}
              variant="contained"
              color="primary"
              sx={{ width: "100%", mt: 2 }}
            >
              Send OTP/Link
            </Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body2" align="center">
              Remembered your password?
              <Button
                onClick={() => setForgotPassword(false)}
                sx={{ ml: 1, textDecoration: "underline" }}
              >
                Login
              </Button>
            </Typography>
          </>
        ) : (
          <>
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
                          {showPassword ? <Visibility Off /> : <Visibility />}
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
                      {passwordValidationMessage
                        ? `Weak - ${passwordValidationMessage}`
                        : "Strong"}
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
                              onClick={handleAuthSubmit}
                              variant="contained"
                              color="primary"
                              sx={{ width: "100%" }}
                              disabled={
                                !otp || !otpSent || loadingOtpVerification
                              }
                            >
                              {loadingOtpVerification ? (
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
                    disabled={loading || (isRegistering && otpSent && !otp)} // Disable if loading or OTP not entered
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
                      onClick={() => {
                        dispatch(toggleRegistering());
                      }}
                      sx={{ ml: 1, textDecoration: "underline" }}
                    >
                      {isRegistering ? "Login" : "Register"}
                    </Button>
                  </Typography>
                  {!isRegistering && (
                    <Button
                      onClick={handleForgotPassword}
                      sx={{ mt: 2, textDecoration: "underline", color: "blue" }}
                    >
                      Forgot Password?
                    </Button>
                  )}
                </CardContent>
              </>
            )}
          </>
        )}
        {forgotPassword && (
          <>
            <TextField
              label="Enter New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              onClick={handleResetPassword}
              variant="contained"
              color="primary"
              sx={{ width: "100%", mt: 2 }}
            >
              Change Password
            </Button>
          </>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={error ? "error" : "success"}
          >
            {error || snackbarMessage}
          </Alert>
        </Snackbar>
      </StyledCard>
    </Box>
  );
};

export default Auth;
