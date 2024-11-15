import React, { useState, useEffect } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import {
  fetchAnnouncements,
  addAnnouncementAsync,
  removeAnnouncementAsync,
  updateAnnouncementAsync,
  setContactEmail,
  selectAnnouncements,
} from "../redux/announcementsSlice";
import { useNotificationContext } from "../components/NotificationContext";

const AdminAnnouncementsPage = () => {
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementCategory, setAnnouncementCategory] =
    useState("Policy Updates");
  const [editingId, setEditingId] = useState(null);
  const dispatch = useDispatch();
  const announcements = useSelector(selectAnnouncements);
  const [email, setEmail] = useState("");
  const { addNotifications } = useNotificationContext(); // Use the notification context

  const categories = ["Policy Updates", "Events", "Important Dates"];

  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  const handleAddAnnouncement = () => {
    if (announcementText.trim()) {
      const newAnnouncement = {
        text: announcementText,
        category: announcementCategory,
        date: new Date(),
      };
      dispatch(addAnnouncementAsync(newAnnouncement)).then(() => {
        // Notify employees when a new announcement is added
        addNotifications([
          {
            text: `New announcement added in category: "${announcementCategory}"`,
            type: "info",
          },
        ]);
      });
      resetForm();
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setAnnouncementText(announcement.text);
    setAnnouncementCategory(announcement.category);
    setEditingId(announcement.id);
  };

  const handleUpdateAnnouncement = () => {
    if (editingId && announcementText.trim()) {
      const updatedAnnouncement = {
        id: editingId,
        text: announcementText,
        category: announcementCategory,
        date: new Date(),
      };
      dispatch(updateAnnouncementAsync(updatedAnnouncement)).then(() => {
        // Notify employees when an announcement is updated
        addNotifications([
          {
            text: `Announcement updated in category: "${announcementCategory}"`,
            type: "info",
          },
        ]);
      });
      resetForm();
    }
  };

  const resetForm = () => {
    setAnnouncementText("");
    setAnnouncementCategory("Policy Updates");
    setEditingId(null);
  };

  const handleRemoveAnnouncement = (id) => {
    const announcementToRemove = announcements.find(
      (announcement) => announcement.id === id
    );
    if (announcementToRemove) {
      dispatch(removeAnnouncementAsync(id)).then(() => {
        // Notify employees when an announcement is removed
        addNotifications([
          {
            text: `Announcement removed from category: "${announcementToRemove.category}"`,
            type: "warning",
          },
        ]);
      });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSetEmail = () => {
    if (email.trim()) {
      dispatch(setContactEmail(email));
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
          sx={{ flexGrow: 1, marginRight: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSetEmail}
          sx={{ flexShrink: 0 }}
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
