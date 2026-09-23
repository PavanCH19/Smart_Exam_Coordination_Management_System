import React from 'react'
import StatusPill from './ui/StatusPill'

const actionBtn = 'rounded-md px-2.5 py-1 text-xs font-medium transition'

const RoomTable = ({ rooms, onEdit, onDelete }) => {

    return (
        <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
            <div className="border-b border-ink-100 px-5 py-4">
                <h3 className="font-display text-base font-semibold text-ink-900">
                    Exam halls / rooms
                </h3>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                    <thead>
                        <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                            <th className="px-4 py-3 font-medium">#</th>
                            <th className="px-4 py-3 font-medium">Room</th>
                            <th className="px-4 py-3 font-medium">Building</th>
                            <th className="px-4 py-3 font-medium">Floor</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Capacity</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rooms && rooms.length > 0 ? (
                            rooms.map((room, index) => (
                                <tr key={room.room_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                    <td className="px-4 py-3 text-ink-400">{index + 1}</td>
                                    <td className="px-4 py-3 font-mono text-xs font-semibold text-ink-700">{room.room_number}</td>
                                    <td className="px-4 py-3 text-ink-500">{room.building}</td>
                                    <td className="px-4 py-3 text-ink-500">{room.floor}</td>
                                    <td className="px-4 py-3 text-ink-500">{room.room_type}</td>
                                    <td className="px-4 py-3 text-ink-500">{room.capacity}</td>
                                    <td className="px-4 py-3">
                                        <StatusPill label={room.status} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1.5">
                                            <button type="button" onClick={() => onEdit(room)} className={`${actionBtn} bg-ink-100 text-ink-700 hover:bg-ink-200`}>Edit</button>
                                            <button type="button" onClick={() => onDelete(room)} className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-4 py-10 text-center text-sm text-ink-400">
                                    No rooms found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default RoomTable
