import React, { useEffect, useMemo, useState } from 'react'
import ExamPicker from '../components/ui/ExamPicker'
import { getRoomAllocations } from '../axiosRoutes/roomAllocationRoutes'
import { getStudents } from '../axiosRoutes/studentRoutes'
import {
    getSeatingArrangement,
    saveSeatingArrangement,
} from '../axiosRoutes/seatingRoutes'
import PageHeader from '../components/ui/PageHeader'

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const SEATS_PER_ROW = 10

// Round-robin interleave: takes groups of students (by section) and weaves
// them together so consecutive seats rarely share a section — a simple
// stand-in for "intelligent" mixed seating.
const interleaveBySection = (students) => {
    const groups = {}
    students.forEach((student) => {
        const key = student.section || 'default'
        if (!groups[key]) groups[key] = []
        groups[key].push(student)
    })

    const queues = Object.values(groups)
    const result = []
    let remaining = students.length

    while (remaining > 0) {
        for (const queue of queues) {
            if (queue.length > 0) {
                result.push(queue.shift())
                remaining -= 1
            }
        }
    }

    return result
}

const seatLabel = (index) => {
    const row = Math.floor(index / SEATS_PER_ROW)
    const col = (index % SEATS_PER_ROW) + 1
    const rowLetter = String.fromCharCode(65 + row)
    return `${rowLetter}${col}`
}

const SeatingManagement = () => {
    const [examId, setExamId] = useState('')
    const [exam, setExam] = useState(null)

    const [allocations, setAllocations] = useState([])
    const [allocationId, setAllocationId] = useState('')

    const [seats, setSeats] = useState([])
    const [mixed, setMixed] = useState(true)

    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [error, setError] = useState(null)
    const [note, setNote] = useState(null)

    const selectedAllocation = useMemo(
        () => allocations.find((a) => String(a.allocation_id) === String(allocationId)),
        [allocations, allocationId]
    )

    const handleExamChange = async (id, examObject) => {
        setExamId(id)
        setExam(examObject)
        setAllocationId('')
        setSeats([])
        setError(null)
        setNote(null)

        if (!id) {
            setAllocations([])
            return
        }

        try {
            setLoading(true)
            const response = await getRoomAllocations(id)
            setAllocations(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load room allocations')
        } finally {
            setLoading(false)
        }
    }

    const handleAllocationChange = async (event) => {
        const id = event.target.value
        setAllocationId(id)
        setSeats([])
        setNote(null)

        if (!id) return

        try {
            setLoading(true)
            const response = await getSeatingArrangement(id)
            setSeats(response.data.data || response.data || [])
        } catch (requestError) {
            // No seating saved yet is expected — not necessarily an error.
            setSeats([])
        } finally {
            setLoading(false)
        }
    }

    const handleGenerate = async () => {
        if (!selectedAllocation || !exam) return

        try {
            setGenerating(true)
            setError(null)
            setNote(null)

            const studentResponse = await getStudents({
                department: exam.department,
                semester: exam.semester,
                limit: selectedAllocation.student_count,
            })

            let students = studentResponse.data.data || studentResponse.data || []
            students = students.slice(0, selectedAllocation.student_count)

            if (mixed) {
                students = interleaveBySection([...students])
            }

            const generatedSeats = students.map((student, index) => ({
                seat_number: seatLabel(index),
                student_id: student.student_id,
                usn: student.usn,
                name: student.name,
                section: student.section,
            }))

            setSeats(generatedSeats)

            try {
                await saveSeatingArrangement(
                    allocationId,
                    generatedSeats.map(({ seat_number, student_id }) => ({ seat_number, student_id }))
                )
            } catch (saveError) {
                setNote('Seating was generated, but could not be saved to the server.')
            }
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to generate seating')
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon="seating"
                title="Seating Arrangement"
                description="Generate and review seat assignments for an allocated room."
            />

            <div className="grid gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-card sm:grid-cols-2">
                <ExamPicker value={examId} onChange={handleExamChange} />

                <div>
                    <label htmlFor="allocation-picker" className="block text-sm font-medium text-ink-700">
                        Room allocation
                    </label>
                    <select
                        id="allocation-picker"
                        value={allocationId}
                        onChange={handleAllocationChange}
                        disabled={!examId || allocations.length === 0}
                        className={`mt-1.5 w-full max-w-md ${selectClass}`}
                    >
                        <option value="">
                            {!examId
                                ? 'Select an exam first'
                                : allocations.length === 0
                                  ? 'No rooms allocated for this exam yet'
                                  : 'Select a room'}
                        </option>
                        {allocations.map((allocation) => (
                            <option key={allocation.allocation_id} value={allocation.allocation_id}>
                                {allocation.room_number || allocation.room_id} — {allocation.student_count} students
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {note && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    {note}
                </div>
            )}

            {allocationId && (
                <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-display text-lg font-semibold text-ink-900">
                            {selectedAllocation?.room_number || selectedAllocation?.room_id} — seating
                        </h3>

                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-1.5 text-sm text-ink-600">
                                <input
                                    type="checkbox"
                                    checked={mixed}
                                    onChange={(e) => setMixed(e.target.checked)}
                                    className="h-4 w-4 rounded border-ink-300 text-brass-500 focus:ring-brass-400"
                                />
                                Mixed seating (interleave sections)
                            </label>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={generating}
                                className="rounded-lg bg-brass-500 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:opacity-50"
                            >
                                {generating ? 'Generating…' : '✨ Generate seating'}
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="mt-6 text-center text-sm text-ink-400">Loading…</p>
                    ) : seats.length === 0 ? (
                        <p className="mt-6 text-center text-sm text-ink-400">
                            No seating generated yet for this room.
                        </p>
                    ) : (
                        <>
                            {/* Visual seat grid */}
                            <div
                                className="mt-6 grid gap-2"
                                style={{ gridTemplateColumns: `repeat(${SEATS_PER_ROW}, minmax(0, 1fr))` }}
                            >
                                {seats.map((seat) => (
                                    <div
                                        key={seat.seat_number}
                                        title={`${seat.usn || ''} ${seat.name || ''}`}
                                        className="flex aspect-square flex-col items-center justify-center rounded-lg border border-ink-100 bg-ink-50 p-1 text-center"
                                    >
                                        <span className="font-mono text-[10px] font-semibold text-brass-600">
                                            {seat.seat_number}
                                        </span>
                                        <span className="mt-0.5 w-full truncate text-[10px] text-ink-500">
                                            {seat.usn || seat.student_id}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Table view */}
                            <div className="mt-6 overflow-x-auto">
                                <table className="w-full min-w-[420px] text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-ink-100 text-xs uppercase tracking-wide text-ink-400">
                                            <th className="py-2 pr-3 font-medium">Seat</th>
                                            <th className="py-2 pr-3 font-medium">USN</th>
                                            <th className="py-2 font-medium">Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {seats.map((seat) => (
                                            <tr key={seat.seat_number} className="border-b border-ink-50 last:border-0">
                                                <td className="py-2.5 pr-3 font-mono text-xs font-semibold text-brass-700">
                                                    {seat.seat_number}
                                                </td>
                                                <td className="py-2.5 pr-3 text-ink-600">{seat.usn}</td>
                                                <td className="py-2.5 text-ink-700">{seat.name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default SeatingManagement
