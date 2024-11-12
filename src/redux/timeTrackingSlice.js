import { createSlice } from '@reduxjs/toolkit';
import moment from 'moment';

const initialState = {
  isClockedIn: false,
  startTime: null,
  elapsedTime: 0,
  events: [
    {
      title: "5:30:00",
      start: new Date(new Date().setDate(new Date().getDate() - 3)),
      end: new Date(new Date().setDate(new Date().getDate() - 3)),
    },
    {
      title: "3:15:00",
      start: new Date(new Date().setDate(new Date().getDate() - 2)),
      end: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
    {
      title: "4:45:00",
      start: new Date(new Date().setDate(new Date().getDate() - 1)),
      end: new Date(new Date().setDate(new Date().getDate() - 1)),
    },
  ],
};

const timeTrackingSlice = createSlice({
  name: 'timeTracking',
  initialState,
  reducers: {
    clockIn: (state) => {
      state.isClockedIn = true;
      state.startTime = Date.now();
    },
    clockOut: (state) => {
      const endTime = Date.now();
      const elapsedSeconds = Math.floor((endTime - state.startTime) / 1000);
      const hoursWorked = Math.floor(elapsedSeconds / 3600);
      
      // Format time for display
      const formattedTime = `${hoursWorked}:${Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, "0")}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

      state.events.push({
        title: formattedTime,
        start: new Date(),
        end: new Date(),
      });

      state.isClockedIn = false;
      state.elapsedTime = 0;
    },
    updateElapsedTime: (state) => {
      if (state.isClockedIn) {
        state.elapsedTime = Math.floor((Date.now() - state.startTime) / 1000);
      }
    },
    setEvents: (state, action) => {
      state.events = action.payload;
    },
  },
});

export const { clockIn, clockOut, updateElapsedTime, setEvents } = timeTrackingSlice.actions;
export default timeTrackingSlice.reducer;