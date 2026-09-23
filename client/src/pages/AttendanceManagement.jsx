import React, { useMemo, useState } from 'react'
import ExamPicker from '../components/ui/ExamPicker'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'
import {
    getExamAttendance,
    markAttendance,
    bulkMarkAttendance,
} from '../axiosRoutes/attendanceRoutes'

const AttendanceManagement = () => {
    const [examId, setExamId] = useState('')
    const [exam, setExam] = useState(null)

    const [roster, setRoster] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [savingId, setSavingId] = useState(null)
    const [bulkSaving, setBulkSaving] = useState(false)

    const handleExamChange = async (id, examObject) => {
        setExamId(id)
        setExam(examObject)
        setRoster([])
        setError(null)

        if (!id) return

        try {
            setLoading(true)
            const response = await getExamAttendance(id)
            setRoster(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load attendance roster')
        } finally {
            setLoading(false)
        }
    }

    const handleMark = async (student, status) => {
        try {
            setSavingId(student.student_id)
            await markAttendance(examId, student.student_id, status)
            setRoster((current) =>
                current.map((row) =>
                    row.student_id === student.student_id ? { ...row, status } : row
                )
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to update attendance')
        } finally {
            setSavingId(null)
        }
    }

    const handleBulkMark = async (status) => {
        const confirmBulk = window.confirm(
            `Mark all ${roster.length} students as ${status.toLowerCase()}?`
        )
        if (!confirmBulk) return

        try {
            setBulkSaving(true)
            setError(null)

            await bulkMarkAttendance(examId, {
                updates: roster.map((row) => ({ student_id: row.student_id, status })),
            })

            setRoster((current) => current.map((row) => ({ ...row, status })))
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Bulk attendance update failed')
        } finally {
            setBulkSaving(false)
        }
    }

    const stats = useMemo(() => {
        const total = roster.length
        const present = roster.filter((row) => row.status === 'PRESENT').length
        const absent = roster.filter((row) => row.status === 'ABSENT').length
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0
        return { total, present, absent, percentage }
    }, [roster])

    return (
        <div className="space-y-6">
            <PageHeader
                icon="attendance"
                title="Exam-Day Attendance"
                description="Mark and monitor student attendance for a scheduled examination."
            />

            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <ExamPicker value={examId} onChange={handleExamChange} />
            </div>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {!examId ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Select an examination above to view and mark student attendance.
                </div>
            ) : loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <StatCard label="Total students" value={stats.total} tone="ink" icon="🧾" />
                        <StatCard label="Present" value={stats.present} tone="paper" icon="✅" />
                        <StatCard label="Absent" value={stats.absent} tone="paper" icon="🚫" />
                        <StatCard label="Attendance" value={`${stats.percentage}%`} tone="brass" icon="📊" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-4">
                        <p className="text-sm text-ink-500">
                            {exam?.subject_name || exam?.subject_code} — {exam?.department} Sem {exam?.semester}
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => handleBulkMark('PRESENT')}
                                disabled={bulkSaving || roster.length === 0}
                                className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                            >
                                Mark all present
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBulkMark('ABSENT')}
                                disabled={bulkSaving || roster.length === 0}
                                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                            >
                                Mark all absent
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                        <th className="px-4 py-3 font-medium">USN</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Room</th>
                                        <th className="px-4 py-3 font-medium">Seat</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Mark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roster.length > 0 ? (
                                        roster.map((student) => (
                                            <tr key={student.student_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                                <td className="px-4 py-3 font-mono text-xs text-ink-600">{student.usn}</td>
                                                <td className="px-4 py-3 font-medium text-ink-800">{student.name}</td>
                                                <td className="px-4 py-3 text-ink-500">{student.room_number || '—'}</td>
                                                <td className="px-4 py-3 text-ink-500">{student.seat_number || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <StatusPill label={student.status || 'Not marked'} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            type="button"
                                                            disabled={savingId === student.student_id}
                                                            onClick={() => handleMark(student, 'PRESENT')}
                                                            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={savingId === student.student_id}
                                                            onClick={() => handleMark(student, 'ABSENT')}
                                                            className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                                        >
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-10 text-center text-sm text-ink-400">
                                                No students found for this exam's roster.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default AttendanceManagement
