import api from './axiosConfig'

// Get all staff
export const getStaff = (params) => api.get('/staff', { params })

// Search staff
export const searchStaff = (params) => api.get('/staff/search', { params })

// Add staff
export const addStaff = (staffData) => api.post('/staff', staffData)

// Update staff
export const updateStaff = (employeeId, staffData) => api.put(`/staff/${employeeId}`, staffData)

// Update staff availability
export const updateStaffAvailability = ( employeeId, availabilityData ) => api.put( `/staff/${employeeId}/availability`, availabilityData )

// Delete staff
export const deleteStaff = (employeeId) => api.delete(`/staff/${employeeId}`)