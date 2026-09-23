import api from './axiosConfig'

// Get all subjects
export const getSubjects = (params) =>
    api.get('/subjects', { params })

// Add subject
export const addSubject = (subjectData) =>
    api.post('/subjects', subjectData)

// Update subject
export const updateSubject = (subjectId, subjectData) =>
    api.put(`/subjects/${subjectId}`, subjectData)

// Delete subject
export const deleteSubject = (subjectId) =>
    api.delete(`/subjects/${subjectId}`)
