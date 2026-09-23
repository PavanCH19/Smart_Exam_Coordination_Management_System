import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getStudentExams } from '../axiosRoutes/studentRoutes'
import PageHeader from '../components/ui/PageHeader'

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })
}

const StudentVenueSeat = () => {
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
                setError(requestError.response?.data?.message || 'Failed to load venue details')
            } finally {
                setLoading(false)
            }
        }
        fetchExams()
    }, [user])

    return (
        <div className="space-y-6">
            <PageHeader icon="venue" title="Venue & Seat" description="Building, room and seat number for each exam." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : exams.length === 0 ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    No examinations scheduled yet.
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exams.map((exam) => (
                        <div key={exam.exam_id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                            <p className="font-display text-base font-semibold text-ink-900">
                                {exam.subject_name}
                            </p>
                            <p className="mt-0.5 text-xs text-ink-500">
                                {formatDate(exam.exam_date)} · {exam.start_time}
                            </p>

                            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-4 text-sm">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-ink-400">Building</p>
                                    <p className="mt-0.5 font-medium text-ink-700">{exam.building || 'TBA'}</p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-ink-400">Room</p>
                                    <p className="mt-0.5 font-medium text-ink-700">{exam.room_number || 'TBA'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs uppercase tracking-wide text-ink-400">Seat number</p>
                                    <p className="mt-0.5 font-mono text-lg font-semibold text-brass-600">
                                        {exam.seat_number || 'Not assigned yet'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default StudentVenueSeat
