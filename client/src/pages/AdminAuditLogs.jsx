import React, { useEffect, useState } from 'react'
import { getAuditLogs } from '../axiosRoutes/auditLogRoutes'
import PageHeader from '../components/ui/PageHeader'

const inputClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
}

const AdminAuditLogs = () => {
    const [logs, setLogs] = useState([])
    const [filters, setFilters] = useState({ action: '', startDate: '', endDate: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 })

    const fetchLogs = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getAuditLogs({ ...filters, page, limit: 20 })
            setLogs(response.data.data || response.data || [])
            setPagination(response.data.pagination || { page, totalPages: 1 })
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load audit logs')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filters.action, filters.startDate, filters.endDate])

    const handleFilterChange = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
        setPage(1)
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon="audit"
                title="Audit Logs"
                description="A record of administrative changes across the system."
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <input
                    name="action"
                    value={filters.action}
                    onChange={handleFilterChange}
                    placeholder="Filter by action (e.g. ROOM_CHANGE)"
                    className={`min-w-[220px] flex-1 ${inputClass}`}
                />
                <input name="startDate" type="date" value={filters.startDate} onChange={handleFilterChange} className={inputClass} />
                <span className="text-xs text-ink-400">to</span>
                <input name="endDate" type="date" value={filters.endDate} onChange={handleFilterChange} className={inputClass} />
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">Timestamp</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                                <th className="px-4 py-3 font-medium">Performed by</th>
                                <th className="px-4 py-3 font-medium">Target</th>
                                <th className="px-4 py-3 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">Loading…</td></tr>
                            ) : logs.length > 0 ? (
                                logs.map((log) => (
                                    <tr key={log.log_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                        <td className="px-4 py-3 font-mono text-xs text-ink-500">{formatDateTime(log.timestamp || log.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-ink-100 px-2 py-0.5 font-mono text-xs font-semibold text-ink-700">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-ink-600">{log.performed_by_name || log.performed_by}</td>
                                        <td className="px-4 py-3 text-ink-500">{log.target || '—'}</td>
                                        <td className="px-4 py-3 max-w-sm truncate text-ink-500">{log.details}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">No audit log entries found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-center gap-4">
                <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>
                <span className="text-sm text-ink-500">
                    Page {pagination.page || page} of {pagination.totalPages || 1}
                </span>
                <button
                    type="button"
                    disabled={page >= (pagination.totalPages || 1) || loading}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    )
}

export default AdminAuditLogs
