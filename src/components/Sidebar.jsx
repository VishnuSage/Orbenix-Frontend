import React from "react";
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EventNoteIcon from "@mui/icons-material/EventNote";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import { styled } from "@mui/system";

// Custom styled sidebar
const SidebarContainer = styled("div")(({ theme }) => ({
  height: "100vh",
  width: "240px", // Fixed width
  backgroundColor: "#36454F", // Dark gray sidebar color
  color: "#ffffff", // Default text color
  transition: "width 0.3s",
  padding: theme.spacing(2), // Padding around the sidebar
}));

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1),
  // borderRadius: '4px',
  "&.active": {
    backgroundColor: "#666666", // Highlight active link
  },
  "&:hover": {
    backgroundColor: "#555555", // Change background on hover
  },
}));

const Sidebar = () => {
  return (
    <SidebarContainer>
      {/* App Name */}
      <Typography
        variant="h6"
        sx={{ color: "#ffffff", textAlign: "center", mb: 2, mt: 1 }}
      >
        Orbenix
      </Typography>
      <Divider sx={{ backgroundColor: "#666666", mb: 2 }} />{" "}
      {/* Divider added here */}
      <List>
        <ListItem
          button
          component={StyledLink}
          to="/payroll"
          aria-label="Payroll"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AccountBalanceIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Payroll" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/attendance-leave"
          aria-label="Attendance & Leave"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <EventNoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Attendance & Leave" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/performance-training"
          aria-label="Performance & Training"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <EmojiEventsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Performance & Training" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/profile-settings"
          aria-label="Profile & Settings"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile & Settings" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/time-tracking"
          aria-label="Time Tracking"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Time Tracking" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/announcements-help"
          aria-label="Announcements & Help"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AnnouncementIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Announcements & Help" />
        </ListItem>
      </List>
      <Divider sx={{ backgroundColor: "#666666" }} />
    </SidebarContainer>
  );
};

export default Sidebar;
