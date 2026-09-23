import api from './axiosConfig'

// type: 'exams' | 'staff-duty' | 'hall-utilization' | 'attendance' | 'issues' | 'admit-cards'
export const getReport = (type, params) =>
    api.get(`/reports/${type}`, { params })

// format: 'pdf' | 'csv'
export const exportReport = (type, format, params) =>
    api.get(`/reports/${type}/export`, {
        params: { ...params, format },
        responseType: 'blob',
    })
