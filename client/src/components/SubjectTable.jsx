import React from 'react'

const actionBtn = 'rounded-md px-2.5 py-1 text-xs font-medium transition'

const SubjectTable = ({ subjects, onEdit, onDelete }) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-ink-900">
                    Subjects
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">Code</th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Department</th>
                            <th className="px-4 py-3 font-medium">Semester</th>
                            <th className="px-4 py-3 font-medium">Duration</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {subjects && subjects.length > 0 ? (
                            subjects.map((subject, index) => (
                                <tr key={subject.subject_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                    <td className="px-4 py-3 text-ink-400">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <span className="rounded-md bg-brass-50 px-2 py-0.5 font-mono text-xs font-semibold text-brass-700">
                                            {subject.subject_code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-ink-800">{subject.subject_name}</td>
                                    <td className="px-4 py-3 text-ink-500">{subject.department}</td>
                                    <td className="px-4 py-3 text-ink-500">{subject.semester}</td>
                                    <td className="px-4 py-3 text-ink-500">{subject.duration} min</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={() => onEdit(subject)} className={`${actionBtn} bg-ink-100 text-ink-700 hover:bg-ink-200`}>Edit</button>
                                            <button type="button" onClick={() => onDelete(subject)} className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-10 text-center text-sm text-ink-400">
                                    No subjects found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SubjectTable
