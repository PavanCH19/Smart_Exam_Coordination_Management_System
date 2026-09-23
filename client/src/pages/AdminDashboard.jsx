import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getAdminDashboard } from '../axiosRoutes/dashboardRoutes'
import StatCard from '../components/ui/StatCard'
import ProgressBar from '../components/ui/ProgressBar'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const EMPTY_SUMMARY = {
    totalStudents: 0,
    totalStaff: 0,
    totalDepartments: 0,
    totalRooms: 0,
    upcomingExams: 0,
    activeIssues: 0,
    studentsByDepartment: [],
    hallUtilization: [],
    staffWorkload: [],
    recentExams: [],
}

const QUICK_LINKS = [
    { to: '/admin/students', label: 'Students' },
    { to: '/admin/staff', label: 'Staff' },
    { to: '/admin/departments', label: 'Departments' },
    { to: '/admin/courses', label: 'Courses' },
    { to: '/admin/subjects', label: 'Subjects' },
    { to: '/admin/rooms', label: 'Rooms' },
    { to: '/admin/exams', label: 'Exams' },
    { to: '/admin/timetable', label: 'Timetable' },
    { to: '/admin/allocations', label: 'Allocations' },
    { to: '/admin/seating', label: 'Seating' },
    { to: '/admin/admit-cards', label: 'Admit Cards' },
    { to: '/admin/attendance', label: 'Attendance' },
]

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const AdminDashboard = () => {
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

                const response = await getAdminDashboard()
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

    const maxDeptCount = Math.max(
        1,
        ...summary.studentsByDepartment.map((item) => item.count || 0)
    )

    const maxWorkload = Math.max(
        1,
        ...summary.staffWorkload.map((item) => item.duties || 0)
    )

    return (
        <div className="space-y-8">
            <PageHeader
                icon="dashboard"
                title={`Welcome back${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
                description="Here's what's happening across the examination cell today."
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <StatCard label="Students" value={loading ? '—' : summary.totalStudents} tone="ink" icon="🎓" />
                <StatCard label="Staff" value={loading ? '—' : summary.totalStaff} tone="ink" icon="🧑‍🏫" />
                <StatCard label="Departments" value={loading ? '—' : summary.totalDepartments} tone="paper" icon="🏛" />
                <StatCard label="Rooms" value={loading ? '—' : summary.totalRooms} tone="paper" icon="🏫" />
                <StatCard label="Upcoming exams" value={loading ? '—' : summary.upcomingExams} tone="brass" icon="📝" />
                <StatCard label="Active issues" value={loading ? '—' : summary.activeIssues} tone="paper" icon="⚑" />
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2.5">
                {QUICK_LINKS.map((link) => (
                    <Link
                        key={link.to}
                        to={link.to}
                        className="rounded-lg border border-ink-200 bg-white px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 hover:text-brass-700"
                    >
                        Manage {link.label} →
                    </Link>
                ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Students by department */}
                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                    <h2 className="font-display text-lg font-semibold text-ink-900">
                        Students by department
                    </h2>
                    <div className="mt-4 space-y-3.5">
                        {loading ? (
                            <p className="text-sm text-ink-400">Loading…</p>
                        ) : summary.studentsByDepartment.length ? (
                            summary.studentsByDepartment.map((item) => (
                                <ProgressBar
                                    key={item.department}
                                    label={item.department}
                                    value={item.count}
                                    max={maxDeptCount}
                                    tone="brass"
                                />
                            ))
                        ) : (
                            <p className="text-sm text-ink-400">No department data yet.</p>
                        )}
                    </div>
                </div>

                {/* Hall utilization */}
                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                    <h2 className="font-display text-lg font-semibold text-ink-900">
                        Hall utilization
                    </h2>
                    <div className="mt-4 space-y-3.5">
                        {loading ? (
                            <p className="text-sm text-ink-400">Loading…</p>
                        ) : summary.hallUtilization.length ? (
                            summary.hallUtilization.map((item) => (
                                <ProgressBar
                                    key={item.room}
                                    label={item.room}
                                    value={item.allocated}
                                    max={item.capacity || 1}
                                    suffix={` / ${item.capacity}`}
                                    tone="ink"
                                />
                            ))
                        ) : (
                            <p className="text-sm text-ink-400">No allocations recorded yet.</p>
                        )}
                    </div>
                </div>

                {/* Staff workload */}
                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                    <h2 className="font-display text-lg font-semibold text-ink-900">
                        Staff workload
                    </h2>
                    <div className="mt-4 space-y-3.5">
                        {loading ? (
                            <p className="text-sm text-ink-400">Loading…</p>
                        ) : summary.staffWorkload.length ? (
                            summary.staffWorkload.map((item) => (
                                <ProgressBar
                                    key={item.name}
                                    label={item.name}
                                    value={item.duties}
                                    max={maxWorkload}
                                    suffix=" duties"
                                    tone="emerald"
                                />
                            ))
                        ) : (
                            <p className="text-sm text-ink-400">No duties assigned yet.</p>
                        )}
                    </div>
                </div>

                {/* Recent / upcoming exams */}
                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                    <h2 className="font-display text-lg font-semibold text-ink-900">
                        Upcoming examinations
                    </h2>

                    <div className="mt-4 overflow-x-auto">
                        {loading ? (
                            <p className="text-sm text-ink-400">Loading…</p>
                        ) : summary.recentExams.length ? (
                            <table className="w-full min-w-[420px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                                        <th className="py-2 pr-3 font-medium">Subject</th>
                                        <th className="py-2 pr-3 font-medium">Date</th>
                                        <th className="py-2 pr-3 font-medium">Dept.</th>
                                        <th className="py-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.recentExams.map((exam) => (
                                        <tr
                                            key={exam.exam_id}
                                            className="border-b border-ink-50 last:border-0"
                                        >
                                            <td className="py-2.5 pr-3 font-medium text-ink-700">
                                                {exam.subject_name}
                                            </td>
                                            <td className="py-2.5 pr-3 text-ink-500">
                                                {formatDate(exam.exam_date)}
                                            </td>
                                            <td className="py-2.5 pr-3 text-ink-500">
                                                {exam.department}
                                            </td>
                                            <td className="py-2.5">
                                                <StatusPill label={exam.status || 'Scheduled'} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-ink-400">No upcoming examinations yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
