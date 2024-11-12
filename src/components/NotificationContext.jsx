import React, { createContext, useState, useContext, useEffect } from 'react';
import { store } from '../redux/store';
import { addNotification, clearNotifications } from '../redux/notificationSlice';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [newNotifications, setNewNotifications] = useState([]);

  const addNotifications = (notifications) => {
    notifications.forEach((notification) => {
      store.dispatch(addNotification(notification));
    });
    setNewNotifications((prev) => [...prev, ...notifications]); // Update local state
  };

  const clearAllNotifications = () => {
    store.dispatch(clearNotifications());
    setNewNotifications([]); // Clear local state
  };

  useEffect(() => {
    // Optional: Automatically clear notifications after a certain duration
    const timer = setTimeout(() => {
      clearAllNotifications();
    }, 6000); // Clear notifications after 6 seconds

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [newNotifications]);

  return (
    <NotificationContext.Provider value={{ newNotifications, addNotifications, clearAllNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  return useContext(NotificationContext);
};