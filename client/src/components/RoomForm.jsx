import React, { useEffect, useState } from 'react'

const initialForm = {
    room_number: '',
    building: '',
    floor: '',
    capacity: '',
    room_type: 'Classroom',
    status: 'AVAILABLE',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const RoomForm = ({ room, onSubmit, onCancel }) => {

    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        if (room) {
            setFormData({
                room_number: room.room_number || '',
                building: room.building || '',
                floor: room.floor ?? '',
                capacity: room.capacity ?? '',
                room_type: room.room_type || 'Classroom',
                status: room.status || 'AVAILABLE',
            })
        } else {
            setFormData(initialForm)
        }
    }, [room])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        onSubmit({
            ...formData,
            floor: Number(formData.floor),
            capacity: Number(formData.capacity),
        })

        if (!room) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="room_number" className={labelClass}>Room number</label>
                    <input
                        id="room_number"
                        name="room_number"
                        type="text"
                        value={formData.room_number}
                        onChange={handleChange}
                        placeholder="A-204"
                        required
                        disabled={Boolean(room)}
                        className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`}
                    />
                </div>

                <div>
                    <label htmlFor="building" className={labelClass}>Building</label>
                    <input
                        id="building"
                        name="building"
                        type="text"
                        value={formData.building}
                        onChange={handleChange}
                        placeholder="Main Block"
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="floor" className={labelClass}>Floor</label>
                    <input
                        id="floor"
                        name="floor"
                        type="number"
                        min="0"
                        value={formData.floor}
                        onChange={handleChange}
                        placeholder="2"
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="capacity" className={labelClass}>Capacity</label>
                    <input
                        id="capacity"
                        name="capacity"
                        type="number"
                        min="1"
                        value={formData.capacity}
                        onChange={handleChange}
                        placeholder="60"
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="room_type" className={labelClass}>Room type</label>
                    <select
                        id="room_type"
                        name="room_type"
                        value={formData.room_type}
                        onChange={handleChange}
                        className={inputClass}
                    >
                        <option value="Classroom">Classroom</option>
                        <option value="Hall">Hall</option>
                        <option value="Laboratory">Laboratory</option>
                        <option value="Auditorium">Auditorium</option>
                        <option value="Seminar Hall">Seminar Hall</option>
                    </select>
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
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                        <option value="MAINTENANCE">Under maintenance</option>
                    </select>
                </div>
            </div>

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
                    {room ? 'Update room' : 'Add room'}
                </button>
            </div>
        </form>
    )
}

export default RoomForm
