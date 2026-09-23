import React from 'react'
import StatusPill from './ui/StatusPill'

const actionBtn = 'rounded-md px-2.5 py-1 text-xs font-medium transition'

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

const ExamTable = ({ exams, onEdit, onDelete }) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-ink-900">
                    Examinations
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">Subject</th>
                            <th className="px-4 py-3 font-medium">Department</th>
                            <th className="px-4 py-3 font-medium">Semester</th>
                            <th className="px-4 py-3 font-medium">Date</th>
                            <th className="px-4 py-3 font-medium">Time</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {exams && exams.length > 0 ? (
                            exams.map((exam, index) => (
                                <tr key={exam.exam_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                    <td className="px-4 py-3 text-ink-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-medium text-ink-800">
                                        {exam.subject_name || exam.subject_code}
                                    </td>
                                    <td className="px-4 py-3 text-ink-500">{exam.department}</td>
                                    <td className="px-4 py-3 text-ink-500">{exam.semester}</td>
                                    <td className="px-4 py-3 text-ink-500">{formatDate(exam.exam_date)}</td>
                                    <td className="px-4 py-3 text-ink-500">
                                        {exam.start_time} – {exam.end_time}
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusPill label={exam.status || 'Scheduled'} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={() => onEdit(exam)} className={`${actionBtn} bg-ink-100 text-ink-700 hover:bg-ink-200`}>Edit</button>
                                            <button type="button" onClick={() => onDelete(exam)} className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-4 py-10 text-center text-sm text-ink-400">
                                    No examinations scheduled yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ExamTable
