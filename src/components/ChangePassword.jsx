import React, { useState } from "react";
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

const ChangePassword = ({ onClose, user, setUser  }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidationMessage, setPasswordValidationMessage] = useState("");

  const validatePassword = (password) => {
    const conditions = [
      { satisfied: password.length >= 6, message: "At least 6 characters long" },
      { satisfied: /[0-9]/.test(password), message: "Contains at least one number" },
      { satisfied: /[a-zA-Z]/.test(password), message: "Contains at least one letter" },
      { satisfied: /[!@#$%^&*(),.?":{}|<>]/.test(password), message: "Contains at least one special character" },
    ];

    const unsatisfiedConditions = conditions
      .filter(condition => !condition.satisfied)
      .map(condition => condition.message);

    return unsatisfiedConditions.length > 0 ? unsatisfiedConditions.join(', ') : '';
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

    // Check if the current password is correct
    if (currentPassword !== user.password) {
      setError("Current password is incorrect");
      return;
    }

    // Prevent reusing the old password
    if (newPassword === currentPassword) {
      setError("New password cannot be the same as the current password");
      return;
    }

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

  const handleConfirmChangePassword = () => {
    // Simulate changing the password
    setUser ((prevUser ) => ({ ...prevUser , password: newPassword }));
    setSuccess(true);
    setOpenDialog(false);
    onClose(); // Close the dialog
  };

  const handleSnackbarClose = () => {
    setSuccess(false);
  };

  const passwordStrength = () => {
    if (newPassword.length < 6) return { strength: "Weak", color: "red" }; // Red for weak
    if (newPassword.length < 10) return { strength: "Moderate", color: "yellow" }; // Yellow for moderate
    return { strength: "Strong", color: "green" }; // Green for strong
  };

  return (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="sm" // Adjust max width of the dialog
      fullWidth // Make the dialog full width
    >
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
        <Typography variant="h6" sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <TextField
          label="Current Password"
          type={showCurrentPassword ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          variant="outlined"
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
          required
          variant="outlined"
          fullWidth
          InputProps={{
            endAdornment: (
              <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />
        {newPassword && (
          <Typography variant="caption" color={passwordStrength().color}>
            Password Strength: {passwordStrength().strength}
          </Typography>
        )}
        {passwordValidationMessage && (
          <Typography variant="caption" color="error">
            {passwordValidationMessage}
          </Typography>
        )}
        <TextField
          label="Confirm New Password"
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          variant="outlined"
          fullWidth
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            ),
          }}
        />
        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Change Password
        </Button>
      </Box>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Password Change
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to change your password?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmChangePassword} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="Password changed successfully!"
      />
    </Dialog>
  );
};

export default ChangePassword;