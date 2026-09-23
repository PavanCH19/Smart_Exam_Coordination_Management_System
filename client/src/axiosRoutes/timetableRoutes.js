import api from './axiosConfig'

// Get the scheduled timetable (exams), optionally filtered by department/semester/date range
export const getTimetable = (params) =>
    api.get('/timetable', { params })

// Trigger server-side automatic timetable generation for a department/semester/date range.
// Expected response: { data: { created: [...exams], conflicts: [...] } }
export const generateTimetable = (payload) =>
    api.post('/timetable/generate', payload)
