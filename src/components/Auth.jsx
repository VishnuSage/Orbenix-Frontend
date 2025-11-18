import React, { useState, useCallback } from "react";
import Logo from "../assets/orbenix-logo.png"; // Adjust the path to your logo file
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
  registerUser,
  loginEmployeeAsync,
  sendPasswordResetAsync,
  sendVerificationCodeAsync,
  setError,
  toggleRegistering,
  toggleForgotPassword,
  setLoggedIn,
  setSelectedRole,
  setEmpId,
  setToken,
  verifyOtpAsync,
  clearPasswordResetState,
  clearRegistrationState,
  setRoles,
} from "../redux/authSlice";
import { fetchEmployeeByEmailOrPhone } from "../redux/employeeSlice";
import { styled } from "@mui/material/styles";
import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import BackgroundImage from "../assets/login-bg.jpg";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../firebaseConfig";

const StyledCard = styled(Card)({
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  borderRadius: "10px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
});

const Auth = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(""); // State for OTP
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(""); // New password state
  const [confirmNewPassword, setConfirmNewPassword] = useState(""); // Confirm new password state
  const [showNewPassword, setShowNewPassword] = useState(false); // Visibility for new password
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false); // Visibility for confirm new password
  const [roleSelection, setRoleSelection] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [forgotPasswordStage, setForgotPasswordStage] = useState(1); // 1: Email/Phone, 2: OTP, 3: New Password
  const [registrationStage, setRegistrationStage] = useState(1); // 1: Email/Phone, 2: OTP, 3: Password
  const [confirmationResult, setConfirmationResult] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    error,
    loading,
    isRegistering,
    forgotPassword,
  } = useSelector((state) => state.auth);

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

  const handleInputChange = (setter, validator) => (e) => {
    const value = e.target.value;
    setter(value);
    if (validator) {
      const validationError = validator(value);
      setPasswordValidationMessage(validationError);
    }
  };

  const handleToggleVisibility = (field) => {
    switch (field) {
      case "password":
        setShowPassword((prev) => !prev);
        break;
      case "confirmPassword":
        setShowConfirmPassword((prev) => !prev);
        break;
      case "newPassword":
        setShowNewPassword((prev) => !prev);
        break;
      case "confirmNewPassword":
        setShowConfirmNewPassword((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const handleSendVerification = async () => {
    setIsSendingVerification(true);
    const appVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible", // or "normal" if you want it visible
    });

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        emailOrPhone,
        appVerifier
      );

      // Dispatch the action with confirmationResult
      const result = await dispatch(
        sendVerificationCodeAsync({ confirmationResult })
      );

      if (sendVerificationCodeAsync.fulfilled.match(result)) {
        setSnackbarMessage("Verification code sent successfully.");
        setConfirmationResult(confirmationResult); // Store confirmation result
        setRegistrationStage(2); // Move to the OTP verification stage
      } else {
        setSnackbarMessage(result.payload);
      }
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to send verification code.");
    }
    setIsSendingVerification(false);
    setSnackbarOpen(true);
  };

  const handleSendResetVerification = async () => {
    setIsSendingVerification(true);
    const appVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible", // or "normal" if you want it visible
    });

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        emailOrPhone,
        appVerifier
      );

      // Dispatch the action with confirmationResult
      const result = await dispatch(
        sendVerificationCodeAsync({ confirmationResult })
      );

      if (sendVerificationCodeAsync.fulfilled.match(result)) {
        setSnackbarMessage("Verification code sent successfully.");
        setConfirmationResult(confirmationResult); // Store confirmation result
        setForgotPasswordStage(2); // Move to the OTP verification stage
      } else {
        setSnackbarMessage(result.payload);
      }
    } catch (error) {
      setSnackbarMessage(error.message || "Failed to send verification code.");
    }
    setIsSendingVerification(false);
    setSnackbarOpen(true);
  };

  const handleVerifyOtp = async () => {
    setIsVerifyingOTP(true);
    if (!confirmationResult) {
      setSnackbarMessage(
        "No confirmation result available. Please send the OTP again."
      );
      setSnackbarOpen(true);
      return;
    }

    const result = await dispatch(verifyOtpAsync({ otp, confirmationResult }));
    if (verifyOtpAsync.fulfilled.match(result)) {
      setSnackbarMessage("OTP verified successfully.");
      setRegistrationStage(3); // Move to the password setting stage
    } else {
      setSnackbarMessage(result.payload);
    }
    setIsVerifyingOTP(false);
    setSnackbarOpen(true);
  };

  const handleVerifyResetOtp = async () => {
    setIsVerifyingOTP(true);
    if (!confirmationResult) {
      setSnackbarMessage(
        "No confirmation result available. Please send the OTP again."
      );
      setSnackbarOpen(true);
      return;
    }

    const result = await dispatch(verifyOtpAsync({ otp, confirmationResult }));
    if (verifyOtpAsync.fulfilled.match(result)) {
      setSnackbarMessage("OTP verified successfully.");
      setForgotPasswordStage(3); // Move to the OTP verification stage
    } else {
      setSnackbarMessage(result.payload);
    }
    setIsVerifyingOTP(false);
    setSnackbarOpen(true);
  };

  const handleAuthSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (isRegistering && registrationStage === 3) {
        console.log("Registration stage 3");
        if (password && confirmPassword) {
          if (password !== confirmPassword) {
            setSnackbarMessage("Passwords do not match.");
            setSnackbarOpen(true);
            return;
          }

          try {
            await dispatch(registerUser({ emailOrPhone, password }));
            dispatch(clearRegistrationState());
            setSnackbarMessage("Registration successful. Please log in.");
            navigate("/auth");
          } catch (error) {
            setSnackbarMessage(error.message || "Network error");
          }
        }
      } else if (forgotPassword && forgotPasswordStage === 3) {
        if (newPassword && confirmNewPassword) {
          if (newPassword !== confirmNewPassword) {
            setSnackbarMessage("New passwords do not match.");
            setSnackbarOpen(true);
            return;
          }

          try {
            const resultAction = await dispatch(
              sendPasswordResetAsync({ emailOrPhone, newPassword })
            );

            if (sendPasswordResetAsync.fulfilled.match(resultAction)) {
              setSnackbarMessage("Password has been reset successfully.");
              dispatch(clearPasswordResetState()); // Clear password reset state
              navigate("/auth"); // Redirect to login after successful reset
            } else {
              setSnackbarMessage(
                resultAction.payload || "Failed to reset password."
              );
            }
          } catch (error) {
            setSnackbarMessage(error.message || "Network error");
          }
        }
      } else if (isRegistering) {
        const employee = await dispatch(
          fetchEmployeeByEmailOrPhone(emailOrPhone)
        );
        if (employee.error) {
          dispatch(
            setError("You must be added by an admin before registering.")
          );
          setSnackbarMessage(
            "You must be added by an admin before registering."
          );
          setSnackbarOpen(true);
        } else {
          // Handle registration logic
          setRegistrationStage(1); // Reset to email/phone stage
        }
      } else {
        try {
          const result = await dispatch(
            loginEmployeeAsync({ emailOrPhone, password })
          );
          console.log("Login result:", result);
          if (loginEmployeeAsync.fulfilled.match(result)) {
            const { token, empId, roles } = result.payload;
            console.log("Roles retrieved from login:", roles);
            setToken(token);
            setEmpId(empId);
            setRoles(roles);
            setLoggedIn(true);

            if (roles.length > 1) {
              setRoleSelection(true);
            } else if (roles.length === 1) {
              const role = roles[0];

              if (role === "superAdmin" || role === "admin") {
                navigate("/admin/employees");
              } else {
                navigate("/payroll");
              }
            }
          } else {
            const errorMessage = result.payload;
            dispatch(setError(errorMessage));
            setSnackbarMessage(errorMessage);
            setSnackbarOpen(true);
            console.error("Login failed:", result.payload);
          }
        } catch (error) {
          dispatch(setError("Login failed. Please try again."));
          setSnackbarMessage("Login failed. Please try again.");
          setSnackbarOpen(true);
          console.error("Error in handleAuthSubmit:", error);
        }
      }
    },
    [
      isRegistering,
      forgotPassword,
      emailOrPhone,
      password,
      confirmPassword,
      newPassword,
      confirmNewPassword,
      dispatch,
      navigate,
      registrationStage,
      forgotPasswordStage,
    ]
  );

  const handleRoleSelection = (role) => {
    setSelectedRole(role);

    if (role === "admin" || role === "superAdmin") {
      navigate("/admin/employees");
    } else if (role === "employee") {
      navigate("/payroll");
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
        padding: "40px",
      }}
    >
      <StyledCard sx={{ width: "400px", p: 3 }}>
        <form onSubmit={handleAuthSubmit}>
          {forgotPassword ? (
            <>
              {forgotPasswordStage === 1 && (
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
                    onClick={handleSendResetVerification}
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", mt: 2 }}
                    disabled={isSendingVerification}
                  >
                    {isSendingVerification ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Send Verification"
                    )}
                  </Button>
                  <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Remembered your password?
                    <Button
                      onClick={() => {
                        dispatch(toggleForgotPassword());
                      }}
                      sx={{ ml: 1, textDecoration: "underline" }}
                    >
                      Login
                    </Button>
                  </Typography>
                </>
              )}

              {forgotPasswordStage === 2 && (
                <>
                  <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                    Verify OTP
                  </Typography>
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    onClick={handleVerifyResetOtp}
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", mt: 2 }}
                    disabled={isVerifyingOTP}
                  >
                    {isVerifyingOTP ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </>
              )}

              {forgotPasswordStage === 3 && (
                <>
                  <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                    Reset Password
                  </Typography>
                  <TextField
                    label="New Password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handleInputChange(setNewPassword)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <Button
                          onClick={() => handleToggleVisibility('newPassword')}
                          sx={{ p: 0, mr: -2 }}
                        >
                          {showNewPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      ),
                    }}
                  />
                  <TextField
                    label="Confirm New Password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={handleInputChange(setConfirmNewPassword)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <Button
                          onClick={() => handleToggleVisibility('confirmNewPassword')}
                          sx={{ p: 0, mr: -2 }}
                        >
                          {showConfirmNewPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </Button>
                      ),
                    }}
                  />
                  <Button
                    onClick={handleAuthSubmit}
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", mt: 2 }}
                  >
                    Reset Password
                  </Button>
                </>
              )}
            </>
          ) : isRegistering ? (
            <>
              {registrationStage === 1 && (
                <>
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <img
                      src={Logo}
                      alt="Logo"
                      style={{ width: "150px", height: "auto" }}
                    />
                  </Box>
                  <TextField
                    label="Phone Number"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                    }}
                  />
                  <Button
                    onClick={handleSendVerification}
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", mt: 2 }}
                    disabled={isSendingVerification}
                  >
                    {isSendingVerification ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Send Verification"
                    )}
                  </Button>
                  <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Already have an account?
                    <Button
                      onClick={() => dispatch(toggleRegistering())}
                      sx={{ ml: 1, textDecoration: "underline" }}
                    >
                      Login
                    </Button>
                  </Typography>
                </>
              )}

              {registrationStage === 2 && (
                <>
                  <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                    Verify OTP
                  </Typography>
                  <TextField
                    label="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button
                    onClick={handleVerifyOtp}
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", mt: 2 }}
                    disabled={isVerifyingOTP}
                  >
                    {isVerifyingOTP ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>
                </>
              )}

              {registrationStage === 3 && (
                <>
                  <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                    Set Password
                  </Typography>
                  <TextField
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handleInputChange(setPassword, isRegistering ? validatePassword : null)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <Button
                          onClick={() => handleToggleVisibility('password')}
                          sx={{ p: 0, mr: -2 }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      ),
                    }}
                  />
                  {passwordValidationMessage && password && (
                    <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                      {passwordValidationMessage}
                    </Typography>
                  )}
                  <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleInputChange(setConfirmPassword)}
                    fullWidth
                    margin="normal"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <Button
                          onClick={() => handleToggleVisibility('confirmPassword')}
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
                  <Button
                    onClick={handleAuthSubmit}
                    variant="contained"
                    color="primary"
                    sx={{ width: "100%", mt: 2 }}
                  >
                    Register
                  </Button>
                </>
              )}
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
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                  >
                    <img
                      src={Logo}
                      alt="Logo"
                      style={{ width: "150px", height: "auto" }}
                    />
                  </Box>
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
                      onChange={handleInputChange(setPassword, isRegistering ? validatePassword : null)}
                      fullWidth
                      margin="normal"
                      InputProps={{
                        startAdornment: <LockIcon sx={{ mr: 1 }} />,
                        endAdornment: (
                          <Button
                            onClick={() => handleToggleVisibility('password')}
                            sx={{ p: 0, mr: -2 }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </Button>
                        ),
                      }}
                    />
                    {passwordValidationMessage && password && (
                      <Typography color="error" variant="caption" sx={{ ml: 1 }}>
                        {passwordValidationMessage}
                      </Typography>
                    )}
                    <Button
                      onClick={handleAuthSubmit}
                      variant="contained"
                      color="primary"
                      sx={{ width: "100%", mt: 2 }}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : "Login"}
                    </Button>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" align="center">
                      Don&apos;t have an account?
                      <Button
                        onClick={() => {
                          dispatch(toggleRegistering());
                        }}
                        sx={{ ml: 1, textDecoration: "underline" }}
                      >
                        Register
                      </Button>
                    </Typography>
                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                      <Button
                        onClick={() => {
                          dispatch(toggleForgotPassword());
                        }}
                        sx={{ textDecoration: "underline" }}
                      >
                        Forgot your password?
                      </Button>
                    </Typography>
                  </CardContent>
                </>
              )}
            </>
          )}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={() => setSnackbarOpen(false)}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={error ? "error" : "success"}
            >
              {error || snackbarMessage}
            </Alert>
          </Snackbar>
        </form>
      </StyledCard>
      <div id="recaptcha-container"></div>
    </Box>
  );
};

export default Auth;
