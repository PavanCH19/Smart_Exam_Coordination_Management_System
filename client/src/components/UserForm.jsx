import React, { useEffect, useState } from 'react'

const initialForm = {
    name: '',
    email: '',
    role: 'STAFF',
    status: 'ACTIVE',
    password: '',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'
const labelClass = 'block text-sm font-medium text-ink-700'

const UserForm = ({ user, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'STAFF',
                status: user.status || 'ACTIVE',
                password: '',
            })
        } else {
            setFormData(initialForm)
        }
    }, [user])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        const payload = { ...formData }
        if (user && !payload.password) {
            delete payload.password
        }

        onSubmit(payload)

        if (!user) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className={labelClass}>Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled={Boolean(user)} className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
                </div>

                <div>
                    <label htmlFor="role" className={labelClass}>Role</label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className={inputClass}>
                        <option value="ADMIN">Admin</option>
                        <option value="STAFF">Staff</option>
                        <option value="STUDENT">Student</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="status" className={labelClass}>Status</label>
                    <select id="status" name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="password" className={labelClass}>
                        {user ? 'New password (leave blank to keep current)' : 'Temporary password'}
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!user}
                        minLength={8}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                <button type="button" onClick={onCancel} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
                    Cancel
                </button>
                <button type="submit" className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-800">
                    {user ? 'Update user' : 'Add user'}
                </button>
            </div>
        </form>
    )
}

export default UserForm
