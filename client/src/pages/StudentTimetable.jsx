import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { getStudentExams } from '../axiosRoutes/studentRoutes'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const formatDateHeading = (value) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
    })
}

const StudentTimetable = () => {
    const { user } = useSelector((state) => state.auth)
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchExams = async () => {
            if (!user?.student_id) return

            try {
                setLoading(true)
                setError(null)
                const response = await getStudentExams(user.student_id)
                setExams(response.data.data || response.data || [])
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Failed to load timetable')
            } finally {
                setLoading(false)
            }
        }

        fetchExams()
    }, [user])

    const groupedByDate = useMemo(() => {
        const groups = {}
        exams.forEach((exam) => {
            const key = exam.exam_date ? exam.exam_date.slice(0, 10) : 'Unscheduled'
            if (!groups[key]) groups[key] = []
            groups[key].push(exam)
        })
        return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    }, [exams])

    return (
        <div className="space-y-6">
            <PageHeader icon="timetable" title="Examination Timetable" description="All your scheduled examinations, by date." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : groupedByDate.length === 0 ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    No examinations scheduled yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {groupedByDate.map(([date, dayExams]) => (
                        <div key={date} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                            <h3 className="font-display text-base font-semibold text-ink-900">
                                {date === 'Unscheduled' ? 'Unscheduled' : formatDateHeading(date)}
                            </h3>
                            <div className="mt-3 divide-y divide-ink-50">
                                {dayExams.map((exam) => (
                                    <div key={exam.exam_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                                        <div>
                                            <p className="font-medium text-ink-800">
                                                {exam.subject_name}
                                                {exam.subject_code && (
                                                    <span className="ml-2 text-xs font-normal text-ink-400">
                                                        ({exam.subject_code})
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-ink-500">
                                                {exam.building ? `${exam.building}, ` : ''}{exam.room_number || 'Venue TBA'}
                                                {exam.seat_number ? ` · Seat ${exam.seat_number}` : ''}
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
        </div>
    )
}

export default StudentTimetable
