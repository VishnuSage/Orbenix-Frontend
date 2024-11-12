import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
} from "@mui/material";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import HelpIcon from "@mui/icons-material/Help";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useNotificationContext } from "../components/NotificationContext.jsx"; // Import the context
import {
  selectAnnouncements,
  selectContactEmail,
} from "../redux/announcementsSlice.js"; // Adjust the path as necessary

const AnnouncementsHelpPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSort, setSelectedSort] = useState("newest"); // New state for sorting
  const [loading, setLoading] = useState(true); // New loading state

  const announcements = useSelector(selectAnnouncements); // Get announcements from Redux
  const adminEmail = useSelector(selectContactEmail);
  const dispatch = useDispatch();

  const categories = ["All", "Policy Updates", "Events", "Important Dates"];

  // Filtering and Sorting
  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const matchesSearch = announcement.text
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        announcement.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (selectedSort === "newest") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const { addNotifications } = useNotificationContext();

  useEffect(() => {
    setLoading(true); // Set loading to true when fetching starts
    const newAnnouncements = announcements.map((announcement) => ({
      id: announcement.id,
      text: announcement.text,
      link: announcement.link,
    }));

    addNotifications(newAnnouncements);
    setLoading(false); // Set loading to false after fetching
  }, [announcements, addNotifications]);

  const handleSubmitQuestion = () => {
    if (adminEmail) {
      const mailtoLink = `mailto:${adminEmail}?subject=Question&body=Please enter your question here.`;
      window.open(mailtoLink, "_blank"); // Open in a new tab
    } else {
      alert("Admin email not set. Please contact your administrator.");
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
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      {loading && <LinearProgress sx={{ marginBottom: 2 }} />}
      <Typography variant="h5" gutterBottom sx={{ color: "#1976d2" }}>
        Company Announcements
      </Typography>

      <Box sx={{ marginBottom: 2, display: "flex", alignItems: "center" }}>
        {/* Category Dropdown */}
        <FormControl variant="outlined" sx={{ minWidth: 150, mr: 2 }}>
          <InputLabel htmlFor="category-select">Category</InputLabel>
          <Select
            label="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            id="category-select"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort Dropdown */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel htmlFor="sort-select">Sort</InputLabel>
          <Select
            label="Sort"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            id="sort-select"
          >
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Enhanced Search Input */}
      <TextField
        variant="outlined"
        placeholder="Search announcements..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          marginBottom: 2,
          width: "100%",
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#1976d2",
            },
            "&:hover fieldset": {
              borderColor: "#1565c0",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0d47a1",
            },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton onClick={handleClearSearch} size="smAll">
                <ClearIcon color="action" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <List>
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement, index) => (
            <ListItem key={index} sx={{ padding: 1 }}>
              <ListItemIcon>
                <AnnouncementIcon color="primary" />
              </ListItemIcon>{" "}
              <Typography variant="body1">{announcement.text}</Typography>
            </ListItem>
          ))
        ) : (
          <Typography variant="body1">No announcements found.</Typography>
        )}
      </List>

      <Divider sx={{ margin: "16px 0" }} />

      <Typography variant="h5" gutterBottom sx={{ color: "#1976d 2" }}>
        Help Section
      </Typography>
      <ListItem sx={{ padding: 1 }}>
        <ListItemIcon>
          <HelpIcon color="primary" />
        </ListItemIcon>
        <Typography variant="body1">
          If you have any questions or issues, please reach out to HR.
        </Typography>
      </ListItem>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmitQuestion}
      >
        Submit a Question
      </Button>
    </Box>
  );
};

export default AnnouncementsHelpPage;
