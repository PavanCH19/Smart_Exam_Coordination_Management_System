import api from './axiosConfig'

// Get all departments
export const getDepartments = (params) =>
    api.get('/departments', { params })

// Add department
export const addDepartment = (departmentData) =>
    api.post('/departments', departmentData)

// Update department
export const updateDepartment = (
    departmentId,
    departmentData,
) =>
    api.put(
        `/departments/${departmentId}`,
        departmentData,
    )

// Delete department
export const deleteDepartment = (departmentId) =>
    api.delete(`/departments/${departmentId}`)