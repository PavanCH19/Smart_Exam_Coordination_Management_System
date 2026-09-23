import api from './axiosConfig'

// Get room allocations for a given exam
// Expected response: { data: [{ allocation_id, exam_id, room_id, room_number, building, capacity, student_count }] }
export const getRoomAllocations = (examId) =>
    api.get(`/exams/${examId}/room-allocations`)

// Add a room allocation for an exam
export const addRoomAllocation = (examId, data) =>
    api.post(`/exams/${examId}/room-allocations`, data)

// Update a room allocation (e.g. change student_count or room)
export const updateRoomAllocation = (allocationId, data) =>
    api.put(`/room-allocations/${allocationId}`, data)

// Remove a room allocation
export const deleteRoomAllocation = (allocationId) =>
    api.delete(`/room-allocations/${allocationId}`)
