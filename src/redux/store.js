import { configureStore } from "@reduxjs/toolkit"; // No need to import thunk!
import { persistStore, persistReducer } from "redux-persist";
import logger from "redux-logger";
import storage from "redux-persist/lib/storage";
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

// Configuration for redux-persist
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "profile"], // Only persist these slices
};

// Combine all reducers
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

// Create a persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(logger), // No need to include thunk
});

// Create a persistor for redux-persist
export const persistor = persistStore(store);
