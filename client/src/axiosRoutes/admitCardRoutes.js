import api from './axiosConfig'

// Get admit card status for students, optionally filtered by department/semester
// Expected response: { data: [{ student_id, usn, name, department, semester, admit_card_status, generated_at }] }
export const getAdmitCards = (params) =>
    api.get('/admit-cards', { params })

// Bulk-generate admit cards for a department/semester (or all pending)
export const generateAdmitCards = (payload) =>
    api.post('/admit-cards/generate', payload)

// Download a single student's admit card as a PDF blob
export const downloadAdmitCard = (studentId) =>
    api.get(`/admit-cards/${studentId}/download`, { responseType: 'blob' })

// --- Student-facing endpoints (the logged-in student's own admit card) ---

export const getMyAdmitCard = () =>
    api.get('/student/admit-card')

export const downloadMyAdmitCard = () =>
    api.get('/student/admit-card/download', { responseType: 'blob' })
