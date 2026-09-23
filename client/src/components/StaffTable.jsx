import React from 'react'
import StatusPill from './ui/StatusPill'

const actionBtn = 'rounded-md px-2.5 py-1 text-xs font-medium transition'

const StaffTable = ({ staff, onEdit, onDelete, onAvailability }) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-ink-900">
                    Staff directory
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                            <th className="px-4 py-3 font-medium">Employee ID</th>
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Department</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Phone</th>
                            <th className="px-4 py-3 font-medium">Designation</th>
                            <th className="px-4 py-3 font-medium">Availability</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {staff && staff.length > 0 ? (
                            staff.map((staffMember) => (
                                <tr key={staffMember.employee_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                    <td className="px-4 py-3 font-mono text-xs text-ink-600">{staffMember.employee_id}</td>
                                    <td className="px-4 py-3 font-medium text-ink-800">{staffMember.name}</td>
                                    <td className="px-4 py-3 text-ink-500">{staffMember.department}</td>
                                    <td className="px-4 py-3 text-ink-500">{staffMember.email}</td>
                                    <td className="px-4 py-3 text-ink-500">{staffMember.phone}</td>
                                    <td className="px-4 py-3 text-ink-500">{staffMember.designation}</td>
                                    <td className="px-4 py-3">
                                        <StatusPill label={staffMember.availability} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={() => onEdit(staffMember)} className={`${actionBtn} bg-ink-100 text-ink-700 hover:bg-ink-200`}>Edit</button>
                                            <button type="button" onClick={() => onAvailability(staffMember)} className={`${actionBtn} bg-brass-50 text-brass-700 hover:bg-brass-100`}>Toggle availability</button>
                                            <button type="button" onClick={() => onDelete(staffMember)} className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-4 py-10 text-center text-sm text-ink-400">
                                    No staff found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default StaffTable
