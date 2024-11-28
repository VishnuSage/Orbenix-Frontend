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
  Card,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useDispatch, useSelector } from "react-redux";
import { updateUserPassword } from "../redux/authSlice"; // Import your action to update the user password

const ChangePassword = ({ onClose }) => {
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

  const empId = useSelector((state) => state.auth.empId); // Access empId from the Redux state

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
    if (newPassword && passwordValidationMessage) {
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
          empId: empId,
          currentPassword,
          newPassword,
        })
      ); // Use unwrap to catch errors directly

      setSuccess(true); // Show success Snackbar
      setOpenDialog(false); // Close the confirmation dialog
      // Do not close the main dialog here; wait for the success Snackbar to close
    } catch (error) {
      setError("Failed to change password. Please try again.");
    }
  };

  const handleSnackbarClose = () => {
    setSuccess(false);
    onClose(); // Close the main dialog after Snackbar is closed
  };

  const passwordStrength = () => {
    if (newPassword.length < 6) return { strength: "Weak", color: "red" };
    if (newPassword.length < 10)
      return { strength: "Moderate", color: "orange" };
    return { strength: "Strong", color: "green" };
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <Card sx={{ padding: 3, borderRadius: 2 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: " column",
            gap: 3, // Increased gap for better spacing
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
          <DialogTitle align="center">Change Password</DialogTitle>
          <DialogContent>
            <DialogContentText>
              To change your password, please enter your current password and
              the new password.
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
              sx={{ marginBottom: 2 }} // Added margin for spacing
            />
            <TextField
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              fullWidth
              error={!!passwordValidationMessage && newPassword.length > 0}
              helperText={
                newPassword.length > 0 ? passwordValidationMessage : ""
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ marginBottom: 2 }} // Added margin for spacing
            />
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              error={
                newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword
              }
              helperText={
                newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword
                  ? "New passwords don't match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
              sx={{ marginBottom: 2 }} // Added margin for spacing
            />
            {newPassword && (
              <Typography color={passwordStrength().color}>
                Password Strength: {passwordStrength().strength}
              </Typography>
            )}
            {error && <Typography color="red">{error}</Typography>}
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              Change Password
            </Button>
          </DialogActions>
        </Box>
      </Card>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={() => {
          handleSnackbarClose();
        }}
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
  empId: PropTypes.string.isRequired, // Ensure empId is required
};

export default ChangePassword;
