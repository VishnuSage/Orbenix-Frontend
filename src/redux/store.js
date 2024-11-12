// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web
import authReducer from "./authSlice";
import payrollReducer from "./payrollSlice";
import attendanceLeaveReducer from "./attendanceLeaveSlice";
import performanceReducer from "./performanceSlice";
import profileReducer from "./profileSlice";
import timeTrackingReducer from "./timeTrackingSlice";
import notificationReducer from "./notificationSlice";
import announcementsReducer from "./announcementsSlice";
import employeeReducer from "./employeeSlice";
import { combineReducers } from "redux";

const persistConfig = {
  key: "root",
  storage,
};

const rootReducer = combineReducers({
  auth: authReducer,
  payroll: payrollReducer,
  attendanceLeave: attendanceLeaveReducer,
  performance: performanceReducer,
  profile: profileReducer,
  timeTracking: timeTrackingReducer,
  announcements: announcementsReducer,
  employees: employeeReducer,
  notifications: notificationReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);
