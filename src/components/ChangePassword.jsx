import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Typography,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch } from "react-redux";
import { updateUserPassword } from "../redux/authSlice"; // Import your action to update the user password

const ChangePassword = ({ onClose, user }) => {
  const dispatch = useDispatch();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] =
    useState("");

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

  const handleNewPasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    const validationError = validatePassword(password);
    setPasswordValidationMessage(validationError);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Check if the new password meets validation
    if (passwordValidationMessage) {
      setError(passwordValidationMessage);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    // Open confirmation dialog
    setOpenDialog(true);
  };

  const handleConfirmChangePassword = async () => {
    try {
      // Dispatch the action to update the password in the Redux store
      await dispatch(
        updateUserPassword({
          empId: user.empId, // Pass empId for identification
          emailOrPhone: user.emailOrPhone, // Use email or phone for authentication
          currentPassword,
          newPassword,
        })
      );
      setSuccess(true);
      setOpenDialog(false);
      onClose(); // Close the dialog
    } catch (error) {
      setError("Failed to change password. Please try again.");
    }
  };

  const handleSnackbarClose = () => {
    setSuccess(false);
  };

  const passwordStrength = () => {
    if (newPassword.length < 6) return { strength: "Weak", color: "red" };
    if (newPassword.length < 10)
      return { strength: "Moderate", color: "orange" };
    return { strength: "Strong", color: "green" };
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          padding: 3,
        }}
      >
        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To change your password, please enter your current password and the
            new password.
          </DialogContentText>
          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={handleNewPasswordChange}
            fullWidth
            error={!!passwordValidationMessage}
            helperText={passwordValidationMessage}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
          />
          <Typography color={passwordStrength().color}>
            Password Strength: {passwordStrength().strength}
          </Typography>
          {error && <Typography color="red">{error}</Typography>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Box>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Password changed successfully!"
      />
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change your password?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmChangePassword} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

ChangePassword.propTypes = {
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    empId: PropTypes.string.isRequired,
    emailOrPhone: PropTypes.string.isRequired,
  }).isRequired,
};

export default ChangePassword;
