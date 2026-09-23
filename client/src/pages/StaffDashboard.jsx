import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getStaffDashboard } from '../axiosRoutes/dashboardRoutes'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const EMPTY_SUMMARY = {
    todayDuty: null,
    upcomingDuties: [],
    totalDuties: 0,
    completedDuties: 0,
}

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
    })
}

const StaffDashboard = () => {
    const { user } = useSelector((state) => state.auth || {})
    const [summary, setSummary] = useState(EMPTY_SUMMARY)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        const fetchSummary = async () => {
            try {
                setLoading(true)
                setError(null)

                const response = await getStaffDashboard()
                const data = response.data?.data || response.data || {}

                if (isMounted) {
                    setSummary({ ...EMPTY_SUMMARY, ...data })
                }
            } catch (requestError) {
                if (isMounted) {
                    setError(
                        requestError.response?.data?.message ||
                            'Failed to load dashboard data'
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
    }, [])

    const { todayDuty } = summary

    return (
        <div className="space-y-8">
            <PageHeader
                icon="dashboard"
                title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
                description="Your duty overview for the examination cell."
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label="Total duties" value={loading ? '—' : summary.totalDuties} tone="ink" icon="🗂" />
                <StatCard label="Completed" value={loading ? '—' : summary.completedDuties} tone="paper" icon="✅" />
                <StatCard
                    label="Remaining"
                    value={loading ? '—' : Math.max(0, summary.totalDuties - summary.completedDuties)}
                    tone="brass"
                    icon="⏳"
                />
            </div>

            {/* Today's duty */}
            <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-semibold text-ink-900">
                        Today&apos;s duty
                    </h2>
                    {!loading && todayDuty && (
                        <StatusPill label={todayDuty.duty_type || 'Invigilation'} tone="brass" />
                    )}
                </div>

                {loading ? (
                    <p className="mt-4 text-sm text-ink-400">Loading…</p>
                ) : todayDuty ? (
                    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-ink-400">Subject</p>
                            <p className="mt-1 font-display text-lg font-semibold text-ink-900">
                                {todayDuty.subject_name}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-ink-400">Time</p>
                            <p className="mt-1 text-sm font-medium text-ink-700">
                                {todayDuty.start_time} – {todayDuty.end_time}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-ink-400">Room</p>
                            <p className="mt-1 text-sm font-medium text-ink-700">
                                {todayDuty.building ? `${todayDuty.building}, ` : ''}
                                {todayDuty.room_number}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-ink-400">Students</p>
                            <p className="mt-1 text-sm font-medium text-ink-700">
                                {todayDuty.student_count ?? '—'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-ink-400">
                        No duty assigned for today.
                    </p>
                )}

                <div className="mt-6 flex flex-wrap gap-2.5 border-t border-ink-100 pt-5">
                    <Link
                        to="/staff/duties"
                        className="rounded-lg bg-ink-900 px-3.5 py-1.5 text-sm font-medium text-paper transition hover:bg-ink-800"
                    >
                        View duty roster
                    </Link>
                    <Link
                        to="/staff/attendance"
                        className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 hover:text-brass-700"
                    >
                        Mark attendance
                    </Link>
                    <Link
                        to="/staff/issues"
                        className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 hover:text-brass-700"
                    >
                        Report an issue
                    </Link>
                </div>
            </div>

            {/* Upcoming duties */}
            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <h2 className="font-display text-lg font-semibold text-ink-900">
                    Upcoming duties
                </h2>
                <div className="mt-4 overflow-x-auto">
                    {loading ? (
                        <p className="text-sm text-ink-400">Loading…</p>
                    ) : summary.upcomingDuties.length ? (
                        <table className="w-full min-w-[420px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                                    <th className="py-2 pr-3 font-medium">Date</th>
                                    <th className="py-2 pr-3 font-medium">Subject</th>
                                    <th className="py-2 pr-3 font-medium">Room</th>
                                    <th className="py-2 font-medium">Duty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.upcomingDuties.map((duty) => (
                                    <tr key={duty.duty_id} className="border-b border-ink-50 last:border-0">
                                        <td className="py-2.5 pr-3 text-ink-500">{formatDate(duty.exam_date)}</td>
                                        <td className="py-2.5 pr-3 font-medium text-ink-700">{duty.subject_name}</td>
                                        <td className="py-2.5 pr-3 text-ink-500">{duty.room_number}</td>
                                        <td className="py-2.5">
                                            <StatusPill label={duty.duty_type || 'Invigilation'} tone="neutral" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-sm text-ink-400">No upcoming duties scheduled.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default StaffDashboard
