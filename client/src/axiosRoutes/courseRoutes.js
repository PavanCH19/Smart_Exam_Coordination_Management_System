import api from './axiosConfig'

// Get all courses
export const getCourses = (params) =>
    api.get('/courses', { params })

// Add course
export const addCourse = (courseData) =>
    api.post('/courses', courseData)

// Update course
export const updateCourse = (courseId, courseData) =>
    api.put(`/courses/${courseId}`, courseData)

// Delete course
export const deleteCourse = (courseId) =>
    api.delete(`/courses/${courseId}`)
