import api from './axiosConfig'

// Get all students
export const getStudents = (params) => api.get('/students', { params })

// Search / Filter students
export const searchStudents = (params) => api.get('/students/search', { params })

// Get student by ID
// export const getStudentById = (studentId) => api.get(`/students/${studentId}`)

// Add student
export const addStudent = (studentData) => api.post('/students', studentData)

// Update student
export const updateStudent = (studentId, studentData) => api.put(`/students/${studentId}`, studentData)

// Delete student
export const deleteStudent = (studentUsn) => api.delete(`/students/${studentUsn}`)

// Bulk upload students
export const bulkUploadStudents = (formData) => api.post('/students/bulk-upload', formData)

// Get student exams
export const getStudentExams = (studentId) => api.get(`/students/${studentId}/exams`)

// Get student attendance
export const getStudentAttendance = (studentId) => api.get(`/students/${studentId}/attendance`)