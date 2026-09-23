import React, { useEffect, useState } from 'react'
import { getReport, exportReport } from '../axiosRoutes/reportRoutes'
import PageHeader from '../components/ui/PageHeader'

const REPORT_TYPES = [
    { key: 'exams', title: 'Examination report', description: 'Total, completed and upcoming exams.', icon: '📝' },
    { key: 'staff-duty', title: 'Staff duty report', description: 'Duty counts and workload per staff member.', icon: '🧑‍🏫' },
    { key: 'hall-utilization', title: 'Hall utilization report', description: 'Room capacity usage across exams.', icon: '🏫' },
    { key: 'attendance', title: 'Student attendance report', description: 'Attendance totals and percentages.', icon: '✅' },
    { key: 'issues', title: 'Issue report', description: 'Reported issues by type and status.', icon: '⚑' },
    { key: 'admit-cards', title: 'Admit card report', description: 'Generation and download status.', icon: '🪪' },
]

const ReportCard = ({ type }) => {
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [exportingFormat, setExportingFormat] = useState(null)

    useEffect(() => {
        let isMounted = true

        const fetchSummary = async () => {
            try {
                setLoading(true)
                const response = await getReport(type.key)
                if (isMounted) setSummary(response.data.data || response.data || {})
            } catch (requestError) {
                if (isMounted) {
                    setError(
                        requestError.response?.data?.message ||
                            'Report data unavailable — the backend endpoint may not be implemented yet.'
                    )
                }
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchSummary()
        return () => {
            isMounted = false
        }
    }, [type.key])

    const handleExport = async (format) => {
        try {
            setExportingFormat(format)
            const response = await exportReport(type.key, format)

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `${type.key}-report.${format}`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (requestError) {
            setError(requestError.response?.data?.message || `Failed to export ${format.toUpperCase()}`)
        } finally {
            setExportingFormat(null)
        }
    }

    const entries = summary ? Object.entries(summary).filter(([, value]) => typeof value !== 'object') : []

    return (
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <span className="text-xl" aria-hidden="true">{type.icon}</span>
                    <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{type.title}</h3>
                    <p className="mt-0.5 text-xs text-ink-500">{type.description}</p>
                </div>
            </div>

            <div className="mt-4 min-h-[3rem]">
                {loading ? (
                    <p className="text-sm text-ink-400">Loading…</p>
                ) : error ? (
                    <p className="text-xs text-amber-700">{error}</p>
                ) : entries.length > 0 ? (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {entries.slice(0, 4).map(([key, value]) => (
                            <div key={key}>
                                <dt className="text-xs uppercase tracking-wide text-ink-400">
                                    {key.replace(/_/g, ' ')}
                                </dt>
                                <dd className="font-display text-lg font-semibold text-ink-900">{String(value)}</dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <p className="text-sm text-ink-400">No data yet.</p>
                )}
            </div>

            <div className="mt-4 flex gap-2 border-t border-ink-100 pt-4">
                <button
                    type="button"
                    onClick={() => handleExport('pdf')}
                    disabled={exportingFormat !== null}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-brass-300 hover:text-brass-700 disabled:opacity-50"
                >
                    {exportingFormat === 'pdf' ? 'Exporting…' : 'Export PDF'}
                </button>
                <button
                    type="button"
                    onClick={() => handleExport('csv')}
                    disabled={exportingFormat !== null}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 transition hover:border-brass-300 hover:text-brass-700 disabled:opacity-50"
                >
                    {exportingFormat === 'csv' ? 'Exporting…' : 'Export CSV'}
                </button>
            </div>
        </div>
    )
}

const AdminReports = () => (
    <div className="space-y-6">
        <PageHeader
            icon="report"
            title="Reports & Analytics"
            description="Summaries across exams, staff, halls, attendance, issues and admit cards."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {REPORT_TYPES.map((type) => (
                <ReportCard key={type.key} type={type} />
            ))}
        </div>
    </div>
)

export default AdminReports
