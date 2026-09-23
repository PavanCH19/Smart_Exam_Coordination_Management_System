import api from './axiosConfig'

// Get the student attendance roster for a given exam
// Expected response: { data: [{ student_id, usn, name, room_number, seat_number, status }] }
export const getExamAttendance = (examId) =>
    api.get(`/exams/${examId}/attendance`)

// Mark/update a single student's attendance for an exam (status: PRESENT | ABSENT)
export const markAttendance = (examId, studentId, status) =>
    api.patch(`/exams/${examId}/attendance/${studentId}`, { status })

// Mark attendance for many students at once, e.g. { updates: [{ student_id, status }] }
export const bulkMarkAttendance = (examId, payload) =>
    api.post(`/exams/${examId}/attendance/bulk`, payload)
