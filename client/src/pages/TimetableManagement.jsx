import React, { useEffect, useMemo, useState } from 'react'
import { getTimetable, generateTimetable } from '../axiosRoutes/timetableRoutes'
import { getDepartments } from '../axiosRoutes/departmentRoutes'
import Modal from '../components/ui/Modal'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const formatDateHeading = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    })
}

const TimetableManagement = () => {
    const [exams, setExams] = useState([])
    const [departments, setDepartments] = useState([])
    const [filters, setFilters] = useState({ department: '', semester: '' })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [generateModalOpen, setGenerateModalOpen] = useState(false)
    const [generateForm, setGenerateForm] = useState({
        department: '',
        semester: '',
        start_date: '',
        end_date: '',
    })
    const [generating, setGenerating] = useState(false)
    const [generateResult, setGenerateResult] = useState(null)

    const fetchDepartments = async () => {
        try {
            const response = await getDepartments({ limit: 100 })
            const data = response.data.data || response.data || []
            setDepartments(Array.isArray(data) ? data : [])
        } catch (requestError) {
            console.error(requestError)
        }
    }

    const fetchTimetable = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await getTimetable(filters)
            const data = response.data.data || response.data || []
            setExams(Array.isArray(data) ? data : [])
        } catch (requestError) {
            setError(
                requestError.response?.data?.message || 'Failed to load timetable'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    useEffect(() => {
        fetchTimetable()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.department, filters.semester])

    const groupedByDate = useMemo(() => {
        const groups = {}
        exams.forEach((exam) => {
            const key = exam.exam_date ? exam.exam_date.slice(0, 10) : 'Unscheduled'
            if (!groups[key]) groups[key] = []
            groups[key].push(exam)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [exams])

    const handleFilterChange = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
    }

    const handleGenerateChange = (event) => {
        const { name, value } = event.target
        setGenerateForm((current) => ({ ...current, [name]: value }))
    }

    const handleGenerate = async (event) => {
        event.preventDefault()

        if (generateForm.start_date > generateForm.end_date) {
            setGenerateResult({
                created: [],
                conflicts: [],
                error: 'End date must be on or after start date.',
            })
            return
        }

        try {
            setGenerating(true)
            setGenerateResult(null)

            const response = await generateTimetable({
                ...generateForm,
                semester: Number(generateForm.semester),
            })
            const result = response.data.data || response.data || {}

            setGenerateResult({
                created: result.created || result.exams || [],
                conflicts: result.conflicts || [],
            })

            await fetchTimetable()
        } catch (requestError) {
            setGenerateResult({
                created: [],
                conflicts: [],
                error:
                    requestError.response?.data?.message ||
                    'Timetable generation failed. This endpoint may not be implemented on the backend yet.',
            })
        } finally {
            setGenerating(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon="timetable"
                title="Examination Timetable"
                description="View the scheduled exams and run automatic generation for a department/semester."
                actions={
                    <button
                        type="button"
                        onClick={() => {
                            setGenerateResult(null)
                            setGenerateModalOpen(true)
                        }}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        ⚡ Generate timetable
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <select name="department" value={filters.department} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.name}>{dept.name}</option>
                    ))}
                </select>
                <select name="semester" value={filters.semester} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                    ))}
                </select>
            </div>

            {/* Timetable, grouped by date */}
            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : groupedByDate.length === 0 ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    No examinations scheduled yet. Use "Generate timetable" or add exams individually from Exam Management.
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedByDate.map(([date, dayExams]) => (
                        <div key={date} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                            <h3 className="font-display text-base font-semibold text-ink-900">
                                {date === 'Unscheduled' ? 'Unscheduled' : formatDateHeading(date)}
                            </h3>
                            <div className="mt-3 divide-y divide-ink-50">
                                {dayExams
                                    .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
                                    .map((exam) => (
                                        <div key={exam.exam_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                            <div>
                                                <p className="font-medium text-ink-800">
                                                    {exam.subject_name || exam.subject_code}
                                                </p>
                                                <p className="text-xs text-ink-500">
                                                    {exam.department} · Semester {exam.semester}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-ink-600">
                                                <span className="font-mono text-xs text-ink-500">
                                                    {exam.start_time} – {exam.end_time}
                                                </span>
                                                <StatusPill label={exam.status || 'Scheduled'} />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Generate timetable modal */}
            <Modal
                open={generateModalOpen}
                onClose={() => setGenerateModalOpen(false)}
                title="Generate timetable"
                description="Runs the scheduling engine for the selected scope. Requires the backend's /timetable/generate endpoint."
                size="lg"
            >
                <form onSubmit={handleGenerate}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label htmlFor="gen-department" className={labelClass}>Department</label>
                            <select
                                id="gen-department"
                                name="department"
                                value={generateForm.department}
                                onChange={handleGenerateChange}
                                required
                                className={inputClass}
                            >
                                <option value="">Select department</option>
                                {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="gen-semester" className={labelClass}>Semester</label>
                            <select
                                id="gen-semester"
                                name="semester"
                                value={generateForm.semester}
                                onChange={handleGenerateChange}
                                required
                                className={inputClass}
                            >
                                <option value="">Select semester</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                                    <option key={sem} value={sem}>{sem}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="gen-start" className={labelClass}>Start date</label>
                            <input
                                id="gen-start"
                                name="start_date"
                                type="date"
                                value={generateForm.start_date}
                                onChange={handleGenerateChange}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="gen-end" className={labelClass}>End date</label>
                            <input
                                id="gen-end"
                                name="end_date"
                                type="date"
                                value={generateForm.end_date}
                                onChange={handleGenerateChange}
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {generateResult?.error && (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                            {generateResult.error}
                        </div>
                    )}

                    {generateResult && !generateResult.error && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm font-medium text-emerald-700">
                                {generateResult.created.length} exam(s) scheduled successfully.
                            </p>
                            {generateResult.conflicts.length > 0 && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                                    <p className="font-semibold">
                                        {generateResult.conflicts.length} conflict(s) could not be auto-resolved:
                                    </p>
                                    <ul className="mt-1 list-inside list-disc space-y-0.5">
                                        {generateResult.conflicts.map((conflict, index) => (
                                            <li key={index}>
                                                {conflict.message || JSON.stringify(conflict)}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                        <button
                            type="button"
                            onClick={() => setGenerateModalOpen(false)}
                            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            disabled={generating}
                            className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {generating ? 'Generating…' : 'Run generation'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default TimetableManagement
