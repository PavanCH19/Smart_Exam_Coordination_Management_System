import api from './axiosConfig'

// Get all exams
export const getExams = (params) =>
    api.get('/exams', { params })

// Add exam (create examination session)
export const addExam = (examData) =>
    api.post('/exams', examData)

// Update exam
export const updateExam = (examId, examData) =>
    api.put(`/exams/${examId}`, examData)

// Delete exam
export const deleteExam = (examId) =>
    api.delete(`/exams/${examId}`)

// Optional server-side conflict check (student/room/staff clashes) for a
// candidate exam slot before saving. If the backend doesn't expose this yet,
// ExamManagement.jsx also runs a lightweight client-side check as a fallback.
export const checkExamConflicts = (examData) =>
    api.post('/exams/check-conflicts', examData)
