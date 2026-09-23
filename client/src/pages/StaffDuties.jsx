import React, { useEffect, useState } from 'react'
import { getMyDuties } from '../axiosRoutes/staffDutyRoutes'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const SCOPES = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This week' },
    { key: 'all', label: 'All duties' },
]

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })
}

const StaffDuties = () => {
    const [scope, setScope] = useState('today')
    const [duties, setDuties] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchDuties = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getMyDuties({ scope })
                setDuties(response.data.data || response.data || [])
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Failed to load duty roster')
            } finally {
                setLoading(false)
            }
        }

        fetchDuties()
    }, [scope])

    return (
        <div className="space-y-6">
            <PageHeader icon="timetable" title="Duty Roster" description="Your assigned invigilation duties." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="inline-flex rounded-lg border border-ink-200 bg-white p-1">
                {SCOPES.map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => setScope(option.key)}
                        className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
                            scope === option.key ? 'bg-ink-900 text-paper' : 'text-ink-600 hover:bg-ink-50'
                        }`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">Date</th>
                                <th className="px-4 py-3 font-medium">Subject</th>
                                <th className="px-4 py-3 font-medium">Time</th>
                                <th className="px-4 py-3 font-medium">Room</th>
                                <th className="px-4 py-3 font-medium">Duty</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-ink-400">Loading…</td></tr>
                            ) : duties.length > 0 ? (
                                duties.map((duty) => (
                                    <tr key={duty.duty_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                        <td className="px-4 py-3 text-ink-500">{formatDate(duty.exam_date)}</td>
                                        <td className="px-4 py-3 font-medium text-ink-800">{duty.subject_name}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-ink-500">
                                            {duty.start_time} – {duty.end_time}
                                        </td>
                                        <td className="px-4 py-3 text-ink-500">
                                            {duty.building ? `${duty.building}, ` : ''}{duty.room_number}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill label={duty.duty_type || 'MAIN'} tone={duty.duty_type === 'STANDBY' ? 'brass' : 'info'} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill label={duty.status || 'Assigned'} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-ink-400">No duties in this range.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default StaffDuties
