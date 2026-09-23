import api from './axiosConfig'

export const getUsers = (params) =>
    api.get('/users', { params })

export const addUser = (userData) =>
    api.post('/users', userData)

export const updateUser = (userId, userData) =>
    api.put(`/users/${userId}`, userData)

export const deleteUser = (userId) =>
    api.delete(`/users/${userId}`)

// Admin-triggered password reset for another user
export const resetUserPassword = (userId) =>
    api.post(`/users/${userId}/reset-password`)
