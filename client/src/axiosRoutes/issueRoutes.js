import api from './axiosConfig'

// --- Admin: monitor and resolve issues ---

export const getIssues = (params) =>
    api.get('/issues', { params })

export const updateIssueStatus = (issueId, status) =>
    api.patch(`/issues/${issueId}`, { status })

// --- Staff: report and view their own issues ---

export const createIssue = (data) =>
    api.post('/issues', data)

export const getMyIssues = (params) =>
    api.get('/issues/me', { params })
