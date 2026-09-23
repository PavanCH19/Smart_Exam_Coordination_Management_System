import React, { useEffect, useMemo, useState } from 'react'
import { getSubjects } from '../axiosRoutes/subjectRoutes'

const initialForm = {
    subject_id: '',
    exam_date: '',
    start_time: '',
    end_time: '',
    status: 'SCHEDULED',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const readOnlyClass =
    'mt-1.5 block w-full rounded-lg border border-ink-100 bg-ink-50 px-3.5 py-2.5 text-sm text-ink-500'

const labelClass = 'block text-sm font-medium text-ink-700'

// Adds `minutes` to a "HH:MM" time string and returns "HH:MM".
const addMinutes = (time, minutes) => {
    if (!time || !minutes) return ''
    const [hours, mins] = time.split(':').map(Number)
    const total = hours * 60 + mins + minutes
    const normalized = ((total % 1440) + 1440) % 1440
    const outHours = String(Math.floor(normalized / 60)).padStart(2, '0')
    const outMins = String(normalized % 60).padStart(2, '0')
    return `${outHours}:${outMins}`
}

// True if [aStart, aEnd) overlaps [bStart, bEnd) on the same day.
const timesOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

const ExamForm = ({ exam, onSubmit, onCancel, existingExams = [] }) => {

    const [formData, setFormData] = useState(initialForm)
    const [subjects, setSubjects] = useState([])

    useEffect(() => {
        let isMounted = true

        const fetchSubjects = async () => {
            try {
                const response = await getSubjects({ limit: 200 })
                const data = response.data.data || response.data || []
                if (isMounted) setSubjects(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error(error)
            }
        }

        fetchSubjects()
        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (exam) {
            setFormData({
                subject_id: exam.subject_id || '',
                exam_date: exam.exam_date ? exam.exam_date.slice(0, 10) : '',
                start_time: exam.start_time || '',
                end_time: exam.end_time || '',
                status: exam.status || 'SCHEDULED',
            })
        } else {
            setFormData(initialForm)
        }
    }, [exam])

    const selectedSubject = useMemo(
        () => subjects.find((subject) => String(subject.subject_id) === String(formData.subject_id)),
        [subjects, formData.subject_id]
    )

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => {
            const next = { ...current, [name]: value }

            // When the subject changes and it has a known duration, suggest
            // an end time automatically if a start time is already set.
            if (name === 'subject_id') {
                const subject = subjects.find((s) => String(s.subject_id) === String(value))
                if (subject?.duration && next.start_time) {
                    next.end_time = addMinutes(next.start_time, subject.duration)
                }
            }

            if (name === 'start_time' && selectedSubject?.duration) {
                next.end_time = addMinutes(value, selectedSubject.duration)
            }

            return next
        })
    }

    // Soft, client-side clash check: same department + semester + date with
    // an overlapping time window. This is advisory only — the full
    // constraint-based scheduling engine belongs to the Timetable module.
    const conflict = useMemo(() => {
        if (!selectedSubject || !formData.exam_date || !formData.start_time || !formData.end_time) {
            return null
        }

        return existingExams.find((other) => {
            if (exam && other.exam_id === exam.exam_id) return false
            if (!other.exam_date || other.exam_date.slice(0, 10) !== formData.exam_date) return false
            if (other.department !== selectedSubject.department) return false
            if (String(other.semester) !== String(selectedSubject.semester)) return false
            return timesOverlap(formData.start_time, formData.end_time, other.start_time, other.end_time)
        })
    }, [existingExams, selectedSubject, formData.exam_date, formData.start_time, formData.end_time, exam])

    const handleSubmit = (event) => {
        event.preventDefault()

        onSubmit({
            subject_id: formData.subject_id,
            exam_date: formData.exam_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            status: formData.status,
            department: selectedSubject?.department,
            semester: selectedSubject?.semester,
        })

        if (!exam) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="subject_id" className={labelClass}>Subject</label>
                    <select
                        id="subject_id"
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select subject</option>
                        {subjects.map((subject) => (
                            <option key={subject.subject_id} value={subject.subject_id}>
                                {subject.subject_code} — {subject.subject_name} (Sem {subject.semester})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClass}>Department</label>
                    <input readOnly value={selectedSubject?.department || '—'} className={readOnlyClass} />
                </div>

                <div>
                    <label className={labelClass}>Semester</label>
                    <input readOnly value={selectedSubject?.semester || '—'} className={readOnlyClass} />
                </div>

                <div>
                    <label htmlFor="exam_date" className={labelClass}>Exam date</label>
                    <input
                        id="exam_date"
                        name="exam_date"
                        type="date"
                        value={formData.exam_date}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="status" className={labelClass}>Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="start_time" className={labelClass}>Start time</label>
                    <input
                        id="start_time"
                        name="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="end_time" className={labelClass}>End time</label>
                    <input
                        id="end_time"
                        name="end_time"
                        type="time"
                        value={formData.end_time}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    />
                    {selectedSubject?.duration && (
                        <p className="mt-1 text-xs text-ink-400">
                            Suggested from subject duration ({selectedSubject.duration} min) — adjust if needed.
                        </p>
                    )}
                </div>
            </div>

            {conflict && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
                    <strong className="font-semibold">Possible clash:</strong>{' '}
                    this overlaps an existing exam on the same date for the same department and semester
                    {conflict.subject_name ? ` (${conflict.subject_name})` : ''}. You can still save, but
                    review room/staff allocation carefully.
                </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-800"
                >
                    {exam ? 'Update exam' : 'Create exam'}
                </button>
            </div>
        </form>
    )
}

export default ExamForm
