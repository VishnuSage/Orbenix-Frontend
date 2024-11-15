import React, { useState, useRef, useEffect } from "react";
import userPlaceholder from "../assets/user.png";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Modal,
  Snackbar,
  Grid,
  IconButton,
  Divider,
  LinearProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit"; // Importing the Edit icon
import CloseIcon from "@mui/icons-material/Close";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchEmployeeProfile,
  updateEmployeeProfile,
  setProfileImage,
} from "../redux/profileSlice"; // Import actions

const ProfileImage = ({ imageSrc, onImageChange, editable }) => {
  const fileInputRef = useRef(null);

  const handleIconClick = () => {
    if (editable) {
      fileInputRef.current.click(); // Trigger the file input click
    }
  };

  return (
    <Box sx={{ position: "relative", display: "inline-block" }}>
      <Box
        component="img"
        src={imageSrc || userPlaceholder}
        alt="Profile"
        sx={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "2px solid #3f51b5",
          boxShadow: 2,
        }}
      />
      {editable && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageChange}
            style={{ display: "none" }} // Hide the file input
          />
          <IconButton
            aria-label="edit"
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              padding: 1,
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              borderRadius: "50%",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
            onClick={handleIconClick}
          >
            <EditIcon sx={{ fontSize: 20, color: "#3f51b5" }} />
          </IconButton>
        </>
      )}
    </Box>
  );
};

const ProfileSettingsPage = ({ empId }) => {
  // Accept empId as a prop
  const dispatch = useDispatch();
  const profileData = useSelector((state) => state.profile);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state

  // Fetch employee profile data when the component mounts
  useEffect(() => {
    dispatch(fetchEmployeeProfile(empId)); // Fetch profile data by employee ID
  }, [dispatch, empId]);

  // Update formData when profileData changes
  useEffect(() => {
    setFormData(profileData);
  }, [profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(setProfileImage(reader.result)); // Dispatch action to set image
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCloseModal = () => {
    setEditMode(false);
  };

  const handleSave = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address
    ) {
      setError("All fields are required.");
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true); // Start loading
    dispatch(updateEmployeeProfile(formData)) // Dispatch action to update profile
      .then(() => {
        setEditMode(false);
        setError("");
        setSnackbarOpen(true);
      })
      .catch(() => {
        setError("Failed to update profile.");
        setSnackbarOpen(true);
      })
      .finally(() => {
        setIsLoading(false); // End loading
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{ padding: 4, backgroundColor: "transparent", minHeight: "100vh" }}
    >
      {isLoading && <LinearProgress />}
      <Grid container spacing={2}>
        {/* Profile Information Card */}
        <Grid item xs={12} md={4}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            <CardContent sx={{ padding: 4 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ProfileImage
                    imageSrc={profileData.profileImage}
                    onImageChange={() => {}}
                    editable={false}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>{profileData.name}</Typography>
                  <Typography>Employee ID: {profileData.empId}</Typography>
                  <Typography>{profileData.jobTitle}</Typography>
                  <Typography>Department: {profileData.department}</Typography>
                  <Typography>Manager: {profileData.manager}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information Card */}
        <Grid item xs={12} md={8}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              boxShadow: 2,
              position: "relative",
              height: "320px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <IconButton
              aria-label="edit"
              onClick={handleEditClick}
              sx={{
                position: "absolute",
                top: 5,
                right: 5,
                color: "grey.500",
                "&:hover": {
                  color: "grey.700",
                },
              }}
            >
              <EditIcon />
            </IconButton>
            <CardContent
              sx={{
                padding: 4,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                <Grid item xs={12} sx={{ flexGrow: 1 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="left">Email</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="left" sx={{ marginLeft: 2 }}>
                        {profileData.email}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ marginY: 1 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="left">Phone</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="left" sx={{ marginLeft: 2 }}>
                        {profileData.phone}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ marginY: 1 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="left">Address</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="left" sx={{ marginLeft: 2 }}>
                        {profileData.address}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ marginY: 1 }} />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="left">
                        Emergency Contact Name
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="left" sx={{ marginLeft: 2 }}>
                        {profileData.emergencyContactName}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ marginY: 1 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="left">
                        Emergency Contact Relationship
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="left" sx={{ marginLeft: 2 }}>
                        {profileData.emergencyContactRelationship}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ marginY: 1 }} />

                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography align="left">
                        Emergency Contact Phone
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography align="left" sx={{ marginLeft: 2 }}>
                        {profileData.emergencyContactPhone}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Modal
        open={editMode}
        onClose={handleCloseModal}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            padding: 4,
            borderRadius: 2,
            overflowY: "auto",
            maxHeight: "80vh",
            position: "relative",
            boxShadow: 2,
          }}
        >
          <IconButton
            aria-label="close"
            onClick={handleCloseModal}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              color: "grey.500",
              "&:hover": {
                color: "grey.700",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <CardContent sx={{ padding: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Edit Profile
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <ProfileImage
                  imageSrc={formData.profileImage}
                  onImageChange={handleFileChange}
                  editable={true}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Emergency Contact Name"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Emergency Contact Relationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Emergency Contact Phone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  fullWidth
                  margin="normal"
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              sx={{
                marginTop: 2,
                boxShadow: 2,
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </Modal>

      <Snackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message={error ? error : "Changes saved successfully"}
        autoHideDuration={3000}
      />
    </Box>
  );
};

export default ProfileSettingsPage;
