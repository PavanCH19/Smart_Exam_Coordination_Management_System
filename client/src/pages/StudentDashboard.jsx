import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getStudentDashboard } from '../axiosRoutes/dashboardRoutes'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const EMPTY_SUMMARY = {
    upcomingExam: null,
    examsCount: 0,
    admitCardAvailable: false,
    unreadNotifications: 0,
}

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

const daysUntil = (value) => {
    if (!value) return null
    const target = new Date(value)
    if (Number.isNaN(target.getTime())) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    target.setHours(0, 0, 0, 0)
    return Math.round((target - today) / (1000 * 60 * 60 * 24))
}

const StudentDashboard = () => {
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

                const response = await getStudentDashboard()
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

    const { upcomingExam } = summary
    const remainingDays = upcomingExam ? daysUntil(upcomingExam.exam_date) : null

    return (
        <div className="space-y-8">
            <PageHeader
                icon="dashboard"
                title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
                description="Your exams, admit card, and venue details at a glance."
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatCard label="Total exams" value={loading ? '—' : summary.examsCount} tone="ink" icon="📚" />
                <StatCard
                    label="Admit card"
                    value={loading ? '—' : summary.admitCardAvailable ? 'Ready' : 'Pending'}
                    tone={summary.admitCardAvailable ? 'brass' : 'paper'}
                    icon="🪪"
                />
                <StatCard label="Notifications" value={loading ? '—' : summary.unreadNotifications} tone="paper" icon="🔔" />
            </div>

            {/* Next exam highlight */}
            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-950 p-6 text-paper shadow-card sm:p-8">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-300">
                    Next examination
                </p>

                {loading ? (
                    <p className="mt-4 text-sm text-ink-300">Loading…</p>
                ) : upcomingExam ? (
                    <>
                        <h2 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">
                            {upcomingExam.subject_name}
                            {upcomingExam.subject_code && (
                                <span className="ml-2 text-base font-normal text-ink-400">
                                    ({upcomingExam.subject_code})
                                </span>
                            )}
                        </h2>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-ink-400">Date</p>
                                <p className="mt-1 text-sm font-medium text-paper">
                                    {formatDate(upcomingExam.exam_date)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-ink-400">Time</p>
                                <p className="mt-1 text-sm font-medium text-paper">
                                    {upcomingExam.start_time} – {upcomingExam.end_time}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-ink-400">Venue</p>
                                <p className="mt-1 text-sm font-medium text-paper">
                                    {upcomingExam.building ? `${upcomingExam.building}, ` : ''}
                                    {upcomingExam.room_number}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-ink-400">Seat</p>
                                <p className="mt-1 text-sm font-medium text-paper">
                                    {upcomingExam.seat_number || 'Not assigned yet'}
                                </p>
                            </div>
                        </div>

                        {remainingDays !== null && (
                            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-brass-500/15 px-3.5 py-1.5 text-sm font-medium text-brass-200">
                                {remainingDays > 0
                                    ? `${remainingDays} day${remainingDays === 1 ? '' : 's'} to go`
                                    : remainingDays === 0
                                      ? 'Today'
                                      : 'This exam has passed'}
                            </div>
                        )}
                    </>
                ) : (
                    <p className="mt-4 text-sm text-ink-300">
                        No upcoming examination scheduled right now.
                    </p>
                )}

                <div className="mt-7 flex flex-wrap gap-2.5 border-t border-ink-800 pt-5">
                    <Link
                        to="/student/timetable"
                        className="rounded-lg bg-brass-500 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        View timetable
                    </Link>
                    <Link
                        to="/student/admit-card"
                        className="rounded-lg border border-ink-700 px-3.5 py-1.5 text-sm font-medium text-ink-200 transition hover:border-ink-500 hover:text-paper"
                    >
                        Download admit card
                    </Link>
                    <Link
                        to="/student/venue-seat"
                        className="rounded-lg border border-ink-700 px-3.5 py-1.5 text-sm font-medium text-ink-200 transition hover:border-ink-500 hover:text-paper"
                    >
                        Venue &amp; seat
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default StudentDashboard
