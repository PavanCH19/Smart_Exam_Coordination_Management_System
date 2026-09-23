import api from './axiosConfig'

// Get staff duties for a given exam
// Expected response: { data: [{ duty_id, exam_id, staff_id, staff_name, room_id, room_number, duty_type, status }] }
export const getStaffDuties = (examId) =>
    api.get(`/exams/${examId}/staff-duties`)

// Assign a staff member to a duty for an exam (duty_type: MAIN | STANDBY)
export const addStaffDuty = (examId, data) =>
    api.post(`/exams/${examId}/staff-duties`, data)

// Update a duty (e.g. reassign room, change duty_type, or replace with standby)
export const updateStaffDuty = (dutyId, data) =>
    api.put(`/staff-duties/${dutyId}`, data)

// Remove a staff duty assignment
export const deleteStaffDuty = (dutyId) =>
    api.delete(`/staff-duties/${dutyId}`)

// --- Staff-facing endpoints (the logged-in staff member's own duties) ---

// Get the current staff member's duties (params can include scope: 'today' | 'week' | 'all')
export const getMyDuties = (params) =>
    api.get('/staff/duties', { params })

// Confirm/record whether the staff member actually reported for a duty
export const markDutyAttendance = (dutyId, status) =>
    api.patch(`/staff-duties/${dutyId}/attendance`, { status })
