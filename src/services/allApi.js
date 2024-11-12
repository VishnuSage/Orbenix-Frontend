import { commonApi } from './commonApi';

// Admin APIs
export const fetchAdmins = async () => {
    return await commonApi('GET', '/admin');
};

// Announcement APIs
export const fetchAnnouncements = async () => {
    return await commonApi('GET', '/announcements');
};

export const createAnnouncement = async (announcementData) => {
    return await commonApi('POST', '/announcements', announcementData);
};

// Attendance APIs
export const fetchAttendance = async () => {
    return await commonApi('GET', '/attendance');
};

// Payroll APIs
export const fetchPayroll = async () => {
    return await commonApi('GET', '/payroll');
};

// Performance APIs
export const fetchPerformance = async () => {
    return await commonApi('GET', '/performance');
};

// User APIs
export const fetchUsers = async () => {
    return await commonApi('GET', '/users');
};

// Employee APIs
export const fetchEmployees = async () => {
    return await commonApi('GET', '/api/employees');
};

export const addEmployee = async (employee) => {
    return await commonApi('POST', '/api/employees', employee);
};

export const updateEmployee = async (employee) => {
    return await commonApi('PUT', `/api/employees/${employee.empId}`, employee);
};

export const deleteEmployee = async (empId) => {
    return await commonApi('DELETE', `/api/employees/${empId}`);
};

// Export all API functions
const allApi = {
    fetchAdmins,
    fetchAnnouncements,
    createAnnouncement,
    fetchAttendance,
    fetchPayroll,
    fetchPerformance,
    fetchUsers,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
};

export default allApi;