import React from 'react'

const actionBtn =
    'rounded-md px-2.5 py-1 text-xs font-medium transition'

const StudentTable = ({ students, onEdit, onDelete, onViewExams, onViewAttendance }) => {
    return (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-ink-900">
                    Student directory
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">USN</th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Phone</th>
                            <th className="px-4 py-3 font-medium">Department</th>
                            <th className="px-4 py-3 font-medium">Sem</th>
                            <th className="px-4 py-3 font-medium">Sec</th>
                            <th className="px-4 py-3 font-medium">Course</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {students.length > 0 ? (
                            students.map((student, index) => (
                                <tr
                                    key={student.usn}
                                    className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40"
                                >
                                    <td className="px-4 py-3 text-ink-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-ink-600">{student.usn}</td>
                                    <td className="px-4 py-3 font-medium text-ink-800">{student.name}</td>
                                    <td className="px-4 py-3 text-ink-500">{student.email}</td>
                                    <td className="px-4 py-3 text-ink-500">{student.phone}</td>
                                    <td className="px-4 py-3 text-ink-500">{student.department}</td>
                                    <td className="px-4 py-3 text-ink-500">{student.semester}</td>
                                    <td className="px-4 py-3 text-ink-500">{student.section}</td>
                                    <td className="px-4 py-3 text-ink-500">{student.course}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={() => onEdit(student)} className={`${actionBtn} bg-ink-100 text-ink-700 hover:bg-ink-200`}>Edit</button>
                                            <button type="button" onClick={() => onViewExams(student)} className={`${actionBtn} bg-sky-50 text-sky-700 hover:bg-sky-100`}>Exams</button>
                                            <button type="button" onClick={() => onViewAttendance(student)} className={`${actionBtn} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}>Attendance</button>
                                            <button type="button" onClick={() => onDelete(student)} className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="px-4 py-10 text-center text-sm text-ink-400">
                                    No students found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StudentTable
