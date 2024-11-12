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
  "&.active": {
    backgroundColor: "#666666", // Highlight active link
  },
  "&:hover": {
    backgroundColor: "#555555", // Change background on hover
  },
}));

const AdminSidebar = () => {
  return (
    <SidebarContainer>
      {/* App Name */}
      <Typography
        variant="h6"
        sx={{ color: "#ffffff", textAlign: "center", mb: 2, mt: 1 }}
      >
        Admin Dashboard
      </Typography>
      <Divider sx={{ backgroundColor: "#666666", mb: 1 }} />{" "}
      {/* Divider added here */}
      <List>
        <ListItem
          button
          component={StyledLink}
          to="/admin/employees"
          aria-label="Employee Management"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <PeopleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Employee Management" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/admin/admin-payroll"
          aria-label="Payroll Management"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AccountBalanceIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Payroll Management" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/admin/attendance"
          aria-label="Attendance Management"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <EventNoteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Attendance Management" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/admin/performance"
          aria-label="Performance Reviews"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <EmojiEventsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Performance Reviews" />
        </ListItem>
        <ListItem
          button
          component={StyledLink}
          to="/admin/time-management"
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
          to="/admin/announcements"
          aria-label="Announcements"
        >
          <ListItemIcon sx={{ color: "#ffffff" }}>
            <AnnouncementIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Announcements" />
        </ListItem>
      </List>
      <Divider sx={{ backgroundColor: "#666666" }} />
    </SidebarContainer>
  );
};

export default AdminSidebar;
