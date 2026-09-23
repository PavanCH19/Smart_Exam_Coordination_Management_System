import api from './axiosConfig'

// Get the seating arrangement for a room allocation
// Expected response: { data: [{ seat_number, student_id, usn, name }] }
export const getSeatingArrangement = (allocationId) =>
    api.get(`/room-allocations/${allocationId}/seating`)

// Ask the server to (re)generate seating for a room allocation.
// `mixed: true` requests an intelligent/interleaved arrangement rather than
// simple sequential seating.
export const generateSeating = (allocationId, options) =>
    api.post(`/room-allocations/${allocationId}/seating/generate`, options)

// Save a manually built or client-computed seating list (used as a fallback
// when the server-side generator endpoint above isn't available yet).
export const saveSeatingArrangement = (allocationId, seats) =>
    api.post(`/room-allocations/${allocationId}/seating`, { seats })
