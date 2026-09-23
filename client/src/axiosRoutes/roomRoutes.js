import api from './axiosConfig'

// Get all rooms
export const getRooms = (params) =>
    api.get('/rooms', { params })

// Add room
export const addRoom = (roomData) =>
    api.post('/rooms', roomData)

// Update room
export const updateRoom = (roomId, roomData) =>
    api.put(`/rooms/${roomId}`, roomData)

// Update room status only (e.g. AVAILABLE / UNAVAILABLE / MAINTENANCE)
export const updateRoomStatus = (roomId, statusData) =>
    api.patch(`/rooms/${roomId}/status`, statusData)

// Delete room
export const deleteRoom = (roomId) =>
    api.delete(`/rooms/${roomId}`)
