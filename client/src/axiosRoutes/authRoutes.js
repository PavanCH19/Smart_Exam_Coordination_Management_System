import api from './axiosConfig'

export const login = (credentials) => api.post('/auth/login', credentials)

// Change password for the currently logged-in user (any role)
export const changePassword = (data) => api.post('/auth/change-password', data)

export const dashboardByRole = {
	ADMIN: '/admin/dashboard',
	STAFF: '/staff/dashboard',
	STUDENT: '/student/dashboard',
}
