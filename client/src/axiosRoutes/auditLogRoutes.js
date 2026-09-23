import api from './axiosConfig'

// Get audit log entries. params can include action, performedBy, startDate, endDate, page, limit
export const getAuditLogs = (params) =>
    api.get('/audit-logs', { params })
