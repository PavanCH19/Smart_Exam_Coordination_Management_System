import React, { useEffect, useState } from 'react'
import { getIssues, updateIssueStatus } from '../axiosRoutes/issueRoutes'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const ISSUE_TYPE_LABELS = {
    STUDENT_PROBLEM: 'Student problem',
    QUESTION_PAPER: 'Question paper issue',
    INFRASTRUCTURE: 'Infrastructure',
    INVIGILATOR: 'Invigilator issue',
    OTHER: 'Other',
}

const AdminIssues = () => {
    const [issues, setIssues] = useState([])
    const [statusFilter, setStatusFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [updatingId, setUpdatingId] = useState(null)

    const fetchIssues = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getIssues({ status: statusFilter || undefined })
            setIssues(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load issues')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchIssues()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter])

    const handleStatusChange = async (issue, status) => {
        try {
            setUpdatingId(issue.issue_id)
            await updateIssueStatus(issue.issue_id, status)
            setIssues((current) =>
                current.map((item) => (item.issue_id === issue.issue_id ? { ...item, status } : item))
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to update issue status')
        } finally {
            setUpdatingId(null)
        }
    }

    const openCount = issues.filter((i) => i.status === 'OPEN').length
    const inProgressCount = issues.filter((i) => i.status === 'IN PROGRESS').length
    const resolvedCount = issues.filter((i) => i.status === 'RESOLVED').length

    return (
        <div className="space-y-6">
            <PageHeader
                icon="issue"
                title="Issue Monitoring"
                description="Track and resolve problems reported during examinations."
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Open" value={loading ? '—' : openCount} tone="paper" icon="🟡" />
                <StatCard label="In progress" value={loading ? '—' : inProgressCount} tone="paper" icon="🔧" />
                <StatCard label="Resolved" value={loading ? '—' : resolvedCount} tone="brass" icon="✅" />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
                    <option value="">All statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN PROGRESS">In progress</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Reported by</th>
                                <th className="px-4 py-3 font-medium">Room</th>
                                <th className="px-4 py-3 font-medium">Reported</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-ink-400">Loading…</td></tr>
                            ) : issues.length > 0 ? (
                                issues.map((issue) => (
                                    <tr key={issue.issue_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                        <td className="px-4 py-3 font-medium text-ink-800">
                                            {ISSUE_TYPE_LABELS[issue.issue_type] || issue.issue_type}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate text-ink-500">{issue.description}</td>
                                        <td className="px-4 py-3 text-ink-500">{issue.reported_by_name || issue.reported_by}</td>
                                        <td className="px-4 py-3 text-ink-500">{issue.room_number || '—'}</td>
                                        <td className="px-4 py-3 text-ink-500">{formatDateTime(issue.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <StatusPill label={issue.status || 'OPEN'} />
                                                <select
                                                    value={issue.status || 'OPEN'}
                                                    disabled={updatingId === issue.issue_id}
                                                    onChange={(e) => handleStatusChange(issue, e.target.value)}
                                                    className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs text-ink-600"
                                                >
                                                    <option value="OPEN">Open</option>
                                                    <option value="IN PROGRESS">In progress</option>
                                                    <option value="RESOLVED">Resolved</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-ink-400">No issues reported.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdminIssues
