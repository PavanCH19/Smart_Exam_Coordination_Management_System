import React, { useEffect, useMemo, useState } from 'react'
import { getMyDuties, markDutyAttendance } from '../axiosRoutes/staffDutyRoutes'
import { getExamAttendance, markAttendance } from '../axiosRoutes/attendanceRoutes'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const selectClass =
    'w-full max-w-md rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })
}

const StaffAttendance = () => {
    const [duties, setDuties] = useState([])
    const [dutyId, setDutyId] = useState('')
    const [loadingDuties, setLoadingDuties] = useState(true)

    const [roster, setRoster] = useState([])
    const [loadingRoster, setLoadingRoster] = useState(false)
    const [error, setError] = useState(null)
    const [savingId, setSavingId] = useState(null)
    const [confirmingDuty, setConfirmingDuty] = useState(false)

    const selectedDuty = useMemo(
        () => duties.find((duty) => String(duty.duty_id) === String(dutyId)),
        [duties, dutyId]
    )

    useEffect(() => {
        const fetchDuties = async () => {
            try {
                setLoadingDuties(true)
                const response = await getMyDuties({ scope: 'all' })
                setDuties(response.data.data || response.data || [])
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Failed to load your duties')
            } finally {
                setLoadingDuties(false)
            }
        }
        fetchDuties()
    }, [])

    const handleDutyChange = async (event) => {
        const id = event.target.value
        setDutyId(id)
        setRoster([])
        setError(null)

        const duty = duties.find((d) => String(d.duty_id) === String(id))
        if (!duty) return

        try {
            setLoadingRoster(true)
            const response = await getExamAttendance(duty.exam_id)
            const fullRoster = response.data.data || response.data || []
            // Scope to students seated in this staff member's assigned room, when known.
            const scoped = duty.room_number
                ? fullRoster.filter((row) => row.room_number === duty.room_number)
                : fullRoster
            setRoster(scoped)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load attendance roster')
        } finally {
            setLoadingRoster(false)
        }
    }

    const handleConfirmDuty = async (status) => {
        if (!selectedDuty) return
        try {
            setConfirmingDuty(true)
            await markDutyAttendance(selectedDuty.duty_id, status)
            setDuties((current) =>
                current.map((duty) => (duty.duty_id === selectedDuty.duty_id ? { ...duty, status } : duty))
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to confirm duty attendance')
        } finally {
            setConfirmingDuty(false)
        }
    }

    const handleMarkStudent = async (student, status) => {
        if (!selectedDuty) return
        try {
            setSavingId(student.student_id)
            await markAttendance(selectedDuty.exam_id, student.student_id, status)
            setRoster((current) =>
                current.map((row) => (row.student_id === student.student_id ? { ...row, status } : row))
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to update student attendance')
        } finally {
            setSavingId(null)
        }
    }

    const present = roster.filter((r) => r.status === 'PRESENT').length
    const absent = roster.filter((r) => r.status === 'ABSENT').length

    return (
        <div className="space-y-6">
            <PageHeader icon="attendance" title="Attendance" description="Confirm your duty and mark students in your assigned room." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <label htmlFor="duty-picker" className="block text-sm font-medium text-ink-700">
                    Select your duty
                </label>
                <select
                    id="duty-picker"
                    value={dutyId}
                    onChange={handleDutyChange}
                    disabled={loadingDuties}
                    className={`mt-1.5 ${selectClass}`}
                >
                    <option value="">{loadingDuties ? 'Loading duties…' : 'Select a duty'}</option>
                    {duties.map((duty) => (
                        <option key={duty.duty_id} value={duty.duty_id}>
                            {formatDate(duty.exam_date)} — {duty.subject_name} · {duty.room_number}
                        </option>
                    ))}
                </select>
            </div>

            {selectedDuty && (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                        <div>
                            <p className="font-medium text-ink-800">Confirm your own attendance for this duty</p>
                            <p className="mt-0.5 text-xs text-ink-500">
                                Current status: <StatusPill label={selectedDuty.status || 'Not marked'} />
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={confirmingDuty}
                                onClick={() => handleConfirmDuty('PRESENT')}
                                className="rounded-lg bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                            >
                                I'm present
                            </button>
                            <button
                                type="button"
                                disabled={confirmingDuty}
                                onClick={() => handleConfirmDuty('ABSENT')}
                                className="rounded-lg bg-rose-50 px-3.5 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                                Report absence
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <StatCard label="Students" value={loadingRoster ? '—' : roster.length} tone="ink" icon="🧾" />
                        <StatCard label="Present" value={loadingRoster ? '—' : present} tone="paper" icon="✅" />
                        <StatCard label="Absent" value={loadingRoster ? '—' : absent} tone="paper" icon="🚫" />
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[560px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                        <th className="px-4 py-3 font-medium">USN</th>
                                        <th className="px-4 py-3 font-medium">Name</th>
                                        <th className="px-4 py-3 font-medium">Seat</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Mark</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loadingRoster ? (
                                        <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">Loading…</td></tr>
                                    ) : roster.length > 0 ? (
                                        roster.map((student) => (
                                            <tr key={student.student_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                                <td className="px-4 py-3 font-mono text-xs text-ink-600">{student.usn}</td>
                                                <td className="px-4 py-3 font-medium text-ink-800">{student.name}</td>
                                                <td className="px-4 py-3 text-ink-500">{student.seat_number || '—'}</td>
                                                <td className="px-4 py-3">
                                                    <StatusPill label={student.status || 'Not marked'} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            type="button"
                                                            disabled={savingId === student.student_id}
                                                            onClick={() => handleMarkStudent(student, 'PRESENT')}
                                                            className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
                                                        >
                                                            Present
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={savingId === student.student_id}
                                                            onClick={() => handleMarkStudent(student, 'ABSENT')}
                                                            className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                                                        >
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">No students found for this room.</td></tr>
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

export default StaffAttendance
