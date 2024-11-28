import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
} from "react";
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

  const addNotifications = useCallback(
    (notifications) => {
      notifications.forEach((notification) => {
        const { type, text } = notification; // Use 'text' instead of 'message' for consistency
        try {
          dispatch(addNotification({ type, text })); // Dispatch with correct structure
        } catch (error) {
          console.error("Failed to add notification:", error);
        }
      });
    },
    [dispatch]
  ); // Add dispatch as a dependency

  const clearAllNotifications = useCallback(() => {
    try {
      dispatch(clearNotifications());
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, [dispatch]); // Add dispatch as a dependency

  useEffect(() => {
    // Fetch notifications from Redux thunk
    const fetchAndAddNotifications = async () => {
      try {
        const fetchedNotifications = await dispatch(
          fetchNotifications()
        ).unwrap();
        addNotifications(fetchedNotifications);
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
  }, [dispatch, addNotifications, clearAllNotifications]); // Add memoized functions as dependencies

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
