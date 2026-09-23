import React, { useEffect, useState } from 'react'
import ExamPicker from '../components/ui/ExamPicker'
import Modal from '../components/ui/Modal'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

import {
    getRoomAllocations,
    addRoomAllocation,
    deleteRoomAllocation,
} from '../axiosRoutes/roomAllocationRoutes'
import {
    getStaffDuties,
    addStaffDuty,
    deleteStaffDuty,
} from '../axiosRoutes/staffDutyRoutes'
import { getRooms } from '../axiosRoutes/roomRoutes'
import { getStaff } from '../axiosRoutes/staffRoutes'
import { getStudents } from '../axiosRoutes/studentRoutes'

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'
const labelClass = 'block text-sm font-medium text-ink-700'
const actionBtn = 'rounded-md px-2.5 py-1 text-xs font-medium transition'

const AllocationManagement = () => {
    const [examId, setExamId] = useState('')
    const [exam, setExam] = useState(null)

    const [roomAllocations, setRoomAllocations] = useState([])
    const [staffDuties, setStaffDuties] = useState([])
    const [rooms, setRooms] = useState([])
    const [staffList, setStaffList] = useState([])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [roomModalOpen, setRoomModalOpen] = useState(false)
    const [roomForm, setRoomForm] = useState({ room_id: '', student_count: '' })

    const [dutyModalOpen, setDutyModalOpen] = useState(false)
    const [dutyForm, setDutyForm] = useState({ staff_id: '', room_id: '', duty_type: 'MAIN' })
    const [dutyWarning, setDutyWarning] = useState(null)

    const [suggestion, setSuggestion] = useState(null)
    const [suggesting, setSuggesting] = useState(false)

    // Static reference data, fetched once
    useEffect(() => {
        const loadReferenceData = async () => {
            try {
                const [roomsResponse, staffResponse] = await Promise.all([
                    getRooms({ limit: 200 }),
                    getStaff({ limit: 200 }),
                ])
                setRooms(roomsResponse.data.data || roomsResponse.data || [])
                setStaffList(staffResponse.data.data || staffResponse.data || [])
            } catch (requestError) {
                console.error(requestError)
            }
        }

        loadReferenceData()
    }, [])

    const fetchAllocationData = async (currentExamId) => {
        if (!currentExamId) {
            setRoomAllocations([])
            setStaffDuties([])
            return
        }

        try {
            setLoading(true)
            setError(null)

            const [roomAllocResponse, dutiesResponse] = await Promise.all([
                getRoomAllocations(currentExamId),
                getStaffDuties(currentExamId),
            ])

            setRoomAllocations(roomAllocResponse.data.data || roomAllocResponse.data || [])
            setStaffDuties(dutiesResponse.data.data || dutiesResponse.data || [])
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    'Failed to load allocation data for this exam'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleExamChange = (id, examObject) => {
        setExamId(id)
        setExam(examObject)
        setSuggestion(null)
        fetchAllocationData(id)
    }

    // ---- Room allocation ----

    const totalAllocated = roomAllocations.reduce(
        (sum, allocation) => sum + (Number(allocation.student_count) || 0),
        0
    )

    const handleAddRoomAllocation = async (event) => {
        event.preventDefault()

        try {
            const response = await addRoomAllocation(examId, {
                room_id: roomForm.room_id,
                student_count: Number(roomForm.student_count),
            })
            const newAllocation = response.data.data || response.data
            setRoomAllocations((current) => [...current, newAllocation])
            setRoomModalOpen(false)
            setRoomForm({ room_id: '', student_count: '' })
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to add room allocation')
        }
    }

    const handleDeleteRoomAllocation = async (allocation) => {
        const confirmDelete = window.confirm(
            `Remove room ${allocation.room_number || allocation.room_id} from this exam?`
        )
        if (!confirmDelete) return

        try {
            await deleteRoomAllocation(allocation.allocation_id)
            setRoomAllocations((current) =>
                current.filter((item) => item.allocation_id !== allocation.allocation_id)
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to remove room allocation')
        }
    }

    // Client-side "smart" split: fetch how many students belong to this
    // exam's department + semester, then greedily fill available rooms
    // (largest capacity first) that aren't already allocated to this exam.
    const handleSuggestSplit = async () => {
        if (!exam) return

        try {
            setSuggesting(true)
            setError(null)

            const studentResponse = await getStudents({
                department: exam.department,
                semester: exam.semester,
                limit: 1,
            })
            const totalStudents = studentResponse.data.pagination?.total ?? 0

            const alreadyUsedRoomIds = new Set(roomAllocations.map((a) => a.room_id))
            const candidateRooms = rooms
                .filter((room) => room.status === 'AVAILABLE' && !alreadyUsedRoomIds.has(room.room_id))
                .sort((a, b) => (b.capacity || 0) - (a.capacity || 0))

            let remaining = Math.max(0, totalStudents - totalAllocated)
            const plan = []

            for (const room of candidateRooms) {
                if (remaining <= 0) break
                const assign = Math.min(remaining, room.capacity || 0)
                if (assign <= 0) continue
                plan.push({ room, student_count: assign })
                remaining -= assign
            }

            setSuggestion({ totalStudents, remaining, plan })
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to compute room suggestion')
        } finally {
            setSuggesting(false)
        }
    }

    const applySuggestion = async () => {
        if (!suggestion) return

        try {
            for (const item of suggestion.plan) {
                // eslint-disable-next-line no-await-in-loop
                const response = await addRoomAllocation(examId, {
                    room_id: item.room.room_id,
                    student_count: item.student_count,
                })
                const newAllocation = response.data.data || response.data
                setRoomAllocations((current) => [...current, newAllocation])
            }
            setSuggestion(null)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to apply suggested allocation')
        }
    }

    // ---- Staff duty ----

    const handleDutyFormChange = (event) => {
        const { name, value } = event.target
        setDutyForm((current) => ({ ...current, [name]: value }))

        if (name === 'staff_id') {
            const staffMember = staffList.find((s) => String(s.employee_id) === String(value))
            setDutyWarning(
                staffMember?.availability === 'UNAVAILABLE'
                    ? 'This staff member is marked unavailable. Consider assigning a standby instead.'
                    : staffDuties.some((duty) => String(duty.staff_id) === String(value))
                      ? 'This staff member already has a duty for this exam.'
                      : null
            )
        }
    }

    const handleAddStaffDuty = async (event) => {
        event.preventDefault()

        try {
            const response = await addStaffDuty(examId, dutyForm)
            const newDuty = response.data.data || response.data
            setStaffDuties((current) => [...current, newDuty])
            setDutyModalOpen(false)
            setDutyForm({ staff_id: '', room_id: '', duty_type: 'MAIN' })
            setDutyWarning(null)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to assign staff duty')
        }
    }

    const handleDeleteStaffDuty = async (duty) => {
        const confirmDelete = window.confirm('Remove this staff duty assignment?')
        if (!confirmDelete) return

        try {
            await deleteStaffDuty(duty.duty_id)
            setStaffDuties((current) => current.filter((item) => item.duty_id !== duty.duty_id))
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to remove staff duty')
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon="allocation"
                title="Room & Staff Allocation"
                description="Assign rooms and invigilators to a scheduled examination."
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
                    Select an examination above to manage its room and staff allocation.
                </div>
            ) : loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-2">
                    {/* Room allocation */}
                    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-display text-lg font-semibold text-ink-900">Room allocation</h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handleSuggestSplit}
                                    disabled={suggesting}
                                    className="rounded-lg border border-brass-300 px-3 py-1.5 text-xs font-medium text-brass-700 transition hover:bg-brass-50 disabled:opacity-50"
                                >
                                    {suggesting ? 'Calculating…' : '✨ Auto-suggest split'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRoomModalOpen(true)}
                                    className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-ink-800"
                                >
                                    + Add room
                                </button>
                            </div>
                        </div>

                        {suggestion && (
                            <div className="mt-4 rounded-lg border border-brass-200 bg-brass-50 p-3.5 text-sm">
                                <p className="font-medium text-brass-800">
                                    {suggestion.totalStudents} students in {exam?.department} Sem {exam?.semester};{' '}
                                    {totalAllocated} already allocated.
                                </p>
                                <ul className="mt-2 space-y-1 text-ink-700">
                                    {suggestion.plan.map((item) => (
                                        <li key={item.room.room_id}>
                                            {item.room.room_number} ({item.room.capacity} cap.) → {item.student_count} students
                                        </li>
                                    ))}
                                </ul>
                                {suggestion.remaining > 0 && (
                                    <p className="mt-2 text-rose-700">
                                        {suggestion.remaining} students still unaccommodated — add more available rooms.
                                    </p>
                                )}
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={applySuggestion}
                                        disabled={suggestion.plan.length === 0}
                                        className="rounded-lg bg-brass-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brass-600 disabled:opacity-50"
                                    >
                                        Apply suggestion
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSuggestion(null)}
                                        className="rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-50"
                                    >
                                        Discard
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[380px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                                        <th className="py-2 pr-3 font-medium">Room</th>
                                        <th className="py-2 pr-3 font-medium">Capacity</th>
                                        <th className="py-2 pr-3 font-medium">Students</th>
                                        <th className="py-2 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roomAllocations.length > 0 ? (
                                        roomAllocations.map((allocation) => (
                                            <tr key={allocation.allocation_id} className="border-b border-ink-50 last:border-0">
                                                <td className="py-2.5 pr-3 font-medium text-ink-700">
                                                    {allocation.room_number || allocation.room_id}
                                                </td>
                                                <td className="py-2.5 pr-3 text-ink-500">{allocation.capacity ?? '—'}</td>
                                                <td className="py-2.5 pr-3 text-ink-500">{allocation.student_count}</td>
                                                <td className="py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRoomAllocation(allocation)}
                                                        className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-sm text-ink-400">
                                                No rooms allocated yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Staff duty allocation */}
                    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-display text-lg font-semibold text-ink-900">Staff allocation</h3>
                            <button
                                type="button"
                                onClick={() => setDutyModalOpen(true)}
                                disabled={roomAllocations.length === 0}
                                className="rounded-lg bg-ink-900 px-3 py-1.5 text-xs font-semibold text-paper transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                + Assign staff
                            </button>
                        </div>

                        {roomAllocations.length === 0 && (
                            <p className="mt-3 text-xs text-ink-400">
                                Allocate at least one room before assigning invigilators.
                            </p>
                        )}

                        <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[380px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                                        <th className="py-2 pr-3 font-medium">Staff</th>
                                        <th className="py-2 pr-3 font-medium">Room</th>
                                        <th className="py-2 pr-3 font-medium">Duty</th>
                                        <th className="py-2 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffDuties.length > 0 ? (
                                        staffDuties.map((duty) => (
                                            <tr key={duty.duty_id} className="border-b border-ink-50 last:border-0">
                                                <td className="py-2.5 pr-3 font-medium text-ink-700">
                                                    {duty.staff_name || duty.staff_id}
                                                </td>
                                                <td className="py-2.5 pr-3 text-ink-500">
                                                    {duty.room_number || duty.room_id}
                                                </td>
                                                <td className="py-2.5 pr-3">
                                                    <StatusPill
                                                        label={duty.duty_type || 'MAIN'}
                                                        tone={duty.duty_type === 'STANDBY' ? 'brass' : 'info'}
                                                    />
                                                </td>
                                                <td className="py-2.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteStaffDuty(duty)}
                                                        className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-8 text-center text-sm text-ink-400">
                                                No staff assigned yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add room allocation modal */}
            <Modal
                open={roomModalOpen}
                onClose={() => setRoomModalOpen(false)}
                title="Add room allocation"
                description={exam ? `${exam.subject_name || exam.subject_code} — ${exam.department} Sem ${exam.semester}` : ''}
            >
                <form onSubmit={handleAddRoomAllocation}>
                    <div className="grid gap-4">
                        <div>
                            <label htmlFor="alloc-room" className={labelClass}>Room</label>
                            <select
                                id="alloc-room"
                                value={roomForm.room_id}
                                onChange={(e) => setRoomForm((c) => ({ ...c, room_id: e.target.value }))}
                                required
                                className={inputClass}
                            >
                                <option value="">Select room</option>
                                {rooms
                                    .filter((room) => room.status === 'AVAILABLE')
                                    .map((room) => (
                                        <option key={room.room_id} value={room.room_id}>
                                            {room.room_number} — {room.building} (cap. {room.capacity})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="alloc-count" className={labelClass}>Student count</label>
                            <input
                                id="alloc-count"
                                type="number"
                                min="1"
                                value={roomForm.student_count}
                                onChange={(e) => setRoomForm((c) => ({ ...c, student_count: e.target.value }))}
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setRoomModalOpen(false)}
                            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-800"
                        >
                            Add allocation
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Assign staff duty modal */}
            <Modal
                open={dutyModalOpen}
                onClose={() => { setDutyModalOpen(false); setDutyWarning(null) }}
                title="Assign staff duty"
                description={exam ? `${exam.subject_name || exam.subject_code} — ${exam.department} Sem ${exam.semester}` : ''}
            >
                <form onSubmit={handleAddStaffDuty}>
                    <div className="grid gap-4">
                        <div>
                            <label htmlFor="duty-staff" className={labelClass}>Staff member</label>
                            <select
                                id="duty-staff"
                                name="staff_id"
                                value={dutyForm.staff_id}
                                onChange={handleDutyFormChange}
                                required
                                className={inputClass}
                            >
                                <option value="">Select staff</option>
                                {staffList.map((staffMember) => (
                                    <option key={staffMember.employee_id} value={staffMember.employee_id}>
                                        {staffMember.name} — {staffMember.department} ({staffMember.availability})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="duty-room" className={labelClass}>Room</label>
                            <select
                                id="duty-room"
                                name="room_id"
                                value={dutyForm.room_id}
                                onChange={handleDutyFormChange}
                                required
                                className={inputClass}
                            >
                                <option value="">Select room</option>
                                {roomAllocations.map((allocation) => (
                                    <option key={allocation.allocation_id} value={allocation.room_id}>
                                        {allocation.room_number || allocation.room_id}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="duty-type" className={labelClass}>Duty type</label>
                            <select
                                id="duty-type"
                                name="duty_type"
                                value={dutyForm.duty_type}
                                onChange={handleDutyFormChange}
                                className={inputClass}
                            >
                                <option value="MAIN">Main invigilator</option>
                                <option value="STANDBY">Standby</option>
                            </select>
                        </div>
                    </div>

                    {dutyWarning && (
                        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                            {dutyWarning}
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                        <button
                            type="button"
                            onClick={() => { setDutyModalOpen(false); setDutyWarning(null) }}
                            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-800"
                        >
                            Assign
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AllocationManagement
