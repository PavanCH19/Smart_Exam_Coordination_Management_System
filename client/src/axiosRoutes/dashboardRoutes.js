import api from './axiosConfig'

// NOTE: these endpoint paths follow the same '/api/v1' convention as the
// rest of the app (see axiosConfig.js baseURL). If the real backend exposes
// dashboard summary data under different routes, update the paths below —
// the rest of each dashboard page only depends on the response shape
// described in the comments, not on these exact URLs.

// Admin dashboard summary
// Expected response: { data: {
//   totalStudents, totalStaff, totalDepartments, totalRooms,
//   upcomingExams, activeIssues,
//   studentsByDepartment: [{ department, count }],
//   hallUtilization: [{ room, capacity, allocated }],
//   staffWorkload: [{ name, duties }],
//   recentExams: [{ exam_id, subject_name, exam_date, start_time, department, status }],
// } }
export const getAdminDashboard = () => api.get('/admin/dashboard')

// Staff dashboard summary
// Expected response: { data: {
//   todayDuty: { subject_name, exam_date, start_time, end_time, room_number, building, student_count, duty_type } | null,
//   upcomingDuties: [{ duty_id, subject_name, exam_date, start_time, room_number, duty_type }],
//   totalDuties, completedDuties,
// } }
export const getStaffDashboard = () => api.get('/staff/dashboard')

// Student dashboard summary
// Expected response: { data: {
//   upcomingExam: { subject_name, subject_code, exam_date, start_time, end_time, building, room_number, seat_number } | null,
//   examsCount, admitCardAvailable, unreadNotifications,
// } }
export const getStudentDashboard = () => api.get('/student/dashboard')
