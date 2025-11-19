import React, { useState, useEffect, Suspense } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useLocation, Link, Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "./NotificationContext.jsx";
import ChangePassword from "./ChangePassword"; // Import ChangePassword component
import userPlaceholder from "../assets/user.png";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  InputBase,
  LinearProgress,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  Avatar,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp"; // Import Logout Icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import Trash Icon
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import Sidebar from "./Sidebar";
import backgroundImage from "../assets/login-bg.jpg";
import { useSelector, useDispatch } from "react-redux";
import { logoutEmployee } from "../redux/authSlice"; // Import logout action

const sidebarWidth = 240;

const DashboardLayout = () => {
  const dispatch = useDispatch(); // Initialize the dispatch function
  const profileData = useSelector((state) => state.profile); // Get user profile data from Redux store
  const {
    newNotifications = [],
    setNewNotifications,
    clearAllNotifications,
  } = useNotificationContext(); // Get notifications context
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileMenuAnchorEl, setProfileMenuAnchorEl] = useState(null);
  const scrollThreshold = 200;

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    setCurrentPage(path.charAt(0).toUpperCase() + path.slice(1));
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const newOpacity = Math.max(0.8, 1 - scrollY / scrollThreshold);
      setBgOpacity(newOpacity);
    };

    const handleScrollThrottled = () => {
      requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", handleScrollThrottled);
    return () => {
      window.removeEventListener("scroll", handleScrollThrottled);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulated loading time
    return () => clearTimeout(timer);
  }, []);

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: "#9575CD",
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    [theme.breakpoints.up("sm")]: {
      width: "auto",
    },
    "&:hover": {
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
    },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      width: "100%",
      [theme.breakpoints.up("md")]: {
        width: "20ch",
      },
      "&::placeholder": {
        color: "white",
      },
    },
  }));

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationItemClick = (link, notificationId) => {
    navigate(link);
    setNewNotifications((prevNotifications) =>
      prevNotifications.filter((n) => n.id !== notificationId)
    );
    handleMenuClose();
  };

  const handleChangePasswordClick = () => {
    setOpenChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setOpenChangePassword(false);
  };

  const handleLogout = () => {
    dispatch(logoutEmployee()); // Dispatch the logout action
    navigate("/auth"); // Navigate to the login page after logout
  };

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        width: "100vw",
        height: "100vh",
      }}
    >
      {/* Fixed Background Image */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
        }}
      />

      <CssBaseline />

      {/* Sidebar */}
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          height: "calc(100vh - 20px)",
          position: "fixed",
          top: "10px",
          left: "10px",
          zIndex: 1,
          borderRadius: "16px 0 0 16px",
          overflowY: "scroll",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          "&::-moz-scrollbar": {
            display: "none",
          },
        }}
      >
        <Sidebar />
      </Box>

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "transparent",
          p: 3,
          marginLeft: `${sidebarWidth}px`,
          transition: "margin-left 0.3s ease",
          position: "relative",
          marginTop: "10px",
          height: "calc(100vh - 20px)",
          overflowY: "auto",
        }}
      >
        {/* AppBar */}
        <AppBar
          position="fixed"
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            width: `calc(100% - ${sidebarWidth}px - 30px)`,
            left: `${sidebarWidth + 20}px `,
            borderRadius: "16px",
            background: `rgba(128, 0, 128, ${bgOpacity})`,
            transition: "background 0.5s ease",
            padding: "0 5px",
            marginTop: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Toolbar sx={{ display: "flex", alignItems: "center" }}>
            {/* Home Icon on the left */}
            <Link
              to="/payroll"
              color="inherit"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <IconButton sx={{ color: "white" }}>
                <HomeIcon />
              </IconButton>
            </Link>
            {/* Add slash and current page name */}
            <Typography variant="h6" color="inherit" sx={{ marginLeft: 1 }}>
              / {currentPage}
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                inputProps={{ "aria-label": "Search through site content" }}
                sx={{
                  "&:focus": {
                    boxShadow: "0 0 5px rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  },
                }}
              />
            </Search>

            {/* Notification and Settings Icons on the right */}
            <IconButton color="inherit" onClick={handleNotificationClick}>
              <Badge badgeContent={newNotifications.length} color="error">
                <NotificationsIcon sx={{ color: "white" }} />
              </Badge>
            </IconButton>

            {/* Notifications Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              {newNotifications.length === 0 ? (
                <MenuItem disabled>No new notifications</MenuItem>
              ) : (
                newNotifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() =>
                      handleNotificationItemClick(
                        notification.link,
                        notification.id
                      )
                    }
                  >
                    <Typography variant="body2">{notification.text}</Typography>
                  </MenuItem>
                ))
              )}
              {/* Trash Icon Button to Clear All Notifications */}
              {newNotifications.length > 0 && (
                <MenuItem
                  onClick={clearAllNotifications}
                  sx={{ justifyContent: "center" }}
                >
                  <IconButton color="error">
                    <DeleteIcon />
                  </IconButton>
                </MenuItem>
              )}
            </Menu>

            <IconButton
              color="inherit"
              sx={{ display: "flex", alignItems: "center", marginTop: "6px" }}
            >
              <Link to="/settings" color="inherit">
                <SettingsIcon sx={{ color: "white" }} />
              </Link>
            </IconButton>

            <IconButton
              color="inherit"
              onClick={(event) => setProfileMenuAnchorEl(event.currentTarget)}
            >
              <Avatar
                src={profileData.profileImage || userPlaceholder}
                alt="Profile"
              />
            </IconButton>

            <Menu
              anchorEl={profileMenuAnchorEl}
              open={Boolean(profileMenuAnchorEl)}
              onClose={() => setProfileMenuAnchorEl(null)}
            >
              <MenuItem onClick={handleChangePasswordClick}>
                Change Password
              </MenuItem>
              <MenuItem onClick={() => navigate("/profile-settings")}>
                View Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToAppIcon sx={{ marginRight: 1 }} /> Logout{" "}
                {/* Logout option with icon */}
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* Adds spacing below AppBar */}
        {isLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
            }}
          >
            <LinearProgress sx={{ width: "100%", maxWidth: "600px" }} />
          </Box>
        ) : (
          <Outlet />
        )}
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={openChangePassword}
        onClose={handleCloseChangePassword}
        aria-labelledby="change-password-dialog-title"
      >
        <ChangePassword
          onClose={handleCloseChangePassword}
          user={profileData} // Pass the user data to ChangePassword
        />
      </Dialog>
    </Box>
  );
};

export default DashboardLayout;
