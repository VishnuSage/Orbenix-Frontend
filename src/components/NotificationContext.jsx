import React, { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  clearNotifications,
  fetchNotifications,
} from "../redux/notificationSlice";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const notifications = useSelector(
    (state) => state.notifications.notifications
  ); // Get notifications from state

  const addNotifications = (notifications) => {
    notifications.forEach((notification) => {
      const { type, text } = notification; // Use 'text' instead of 'message' for consistency
      try {
        dispatch(addNotification({ type, text })); // Dispatch with correct structure
      } catch (error) {
        console.error("Failed to add notification:", error);
      }
    });
  };

  const clearAllNotifications = () => {
    try {
      dispatch(clearNotifications());
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  useEffect(() => {
    // Fetch notifications from Redux thunk
    const fetchAndAddNotifications = async () => {
      try {
        const notifications = await dispatch(fetchNotifications()).unwrap();
        addNotifications(notifications);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchAndAddNotifications();

    // Automatically clear notifications after a certain duration
    const timer = setTimeout(() => {
      clearAllNotifications();
    }, 6000); // Clear notifications after 6 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [dispatch]); // Run only once on mount

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotifications, clearAllNotifications }}
    >
      {children} {/* Ensure children is rendered */}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};
