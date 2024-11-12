import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Select,
  MenuItem,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit"; // Import Edit icon
import {
  addAnnouncement,
  removeAnnouncement,
  updateAnnouncement,
  selectAnnouncements,
  setContactEmail,
} from "../redux/announcementsSlice"; // Adjust the path as necessary

const AdminAnnouncementsPage = () => {
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementCategory, setAnnouncementCategory] =
    useState("Policy Updates");
  const [editingId, setEditingId] = useState(null); // State to track which announcement is being edited
  const dispatch = useDispatch();
  const announcements = useSelector(selectAnnouncements);
  const [email, setEmail] = useState("");

  const categories = ["Policy Updates", "Events", "Important Dates"];

  const handleAddAnnouncement = () => {
    if (announcementText.trim()) {
      const newAnnouncement = {
        id: Date.now().toString(), // Generate a unique ID
        text: announcementText,
        category: announcementCategory,
        date: new Date(),
        link: `/announcements/${Date.now()}`, // Example link
      };
      dispatch(addAnnouncement(newAnnouncement));
      resetForm();
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setAnnouncementText(announcement.text);
    setAnnouncementCategory(announcement.category);
    setEditingId(announcement.id); // Set the ID of the announcement being edited
  };

  const handleUpdateAnnouncement = () => {
    if (editingId && announcementText.trim()) {
      const updatedAnnouncement = {
        id: editingId,
        text: announcementText,
        category: announcementCategory,
        date: new Date(), // Update the date if needed
        link: `/announcements/${editingId}`, // Maintain the same link
      };
      dispatch(updateAnnouncement(updatedAnnouncement));
      resetForm();
    }
  };

  const resetForm = () => {
    setAnnouncementText("");
    setAnnouncementCategory("Policy Updates");
    setEditingId(null); // Reset editing ID
  };

  const handleRemoveAnnouncement = (id) => {
    dispatch(removeAnnouncement(id));
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSetEmail = () => {
    if (email.trim()) {
      dispatch(setContactEmail(email)); // Dispatch the action to update email
    }
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#f5f5f5",
        borderRadius: 2,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ marginBottom: 2 }}>
        <TextField
          variant="outlined"
          label="Announcement Text"
          value={announcementText}
          onChange={(e) => setAnnouncementText(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
        />

        <Select
          variant="outlined"
          label="Category"
          value={announcementCategory}
          onChange={(e) => setAnnouncementCategory(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </Select>

        {editingId ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateAnnouncement}
          >
            Update Announcement
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddAnnouncement}
          >
            Add Announcement
          </Button>
        )}
      </Box>

      <Divider sx={{ margin: "16px 0" }} />

      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        <TextField
          variant="outlined"
          label="Email for Questions"
          value={email}
          onChange={handleEmailChange}
          fullWidth
          sx={{ flexGrow: 1, marginRight: 1 }} // Allow TextField to grow and add margin to the right
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSetEmail}
          sx={{ flexShrink: 0 }} // Prevent the button from shrinking
        >
          Set Email
        </Button>
      </Box>

      <Divider sx={{ margin: "16px 0" }} />

      <Typography variant="h6" gutterBottom>
        Current Announcements
      </Typography>

      <List>
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <ListItem key={announcement.id} sx={{ padding: 1 }}>
              <ListItemText
                primary={announcement.text}
                secondary={`Category: ${announcement.category}`}
              />
              <IconButton
                edge="end"
                aria-label="edit"
                onClick={() => handleEditAnnouncement(announcement)}
              >
                <EditIcon color="primary" />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveAnnouncement(announcement.id)}
              >
                <DeleteIcon color="error" />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No announcements available.</Typography>
        )}
      </List>
    </Box>
  );
};

export default AdminAnnouncementsPage;
