import api from './axiosConfig'

// --- Admin: send and manage notifications ---

// Get all notifications that have been sent
export const getNotifications = (params) =>
    api.get('/notifications', { params })

// Send a new notification. audience: 'ALL' | 'STUDENTS' | 'STAFF' | department/semester scoped
export const sendNotification = (data) =>
    api.post('/notifications', data)

// Delete/retract a notification
export const deleteNotification = (notificationId) =>
    api.delete(`/notifications/${notificationId}`)

// --- Staff / Student: the logged-in user's own notification inbox ---

export const getMyNotifications = (params) =>
    api.get('/notifications/me', { params })

export const markNotificationRead = (notificationId) =>
    api.patch(`/notifications/${notificationId}/read`)
