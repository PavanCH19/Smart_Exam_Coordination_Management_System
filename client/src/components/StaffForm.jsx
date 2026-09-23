import React, { useEffect, useState } from 'react'
import { getDepartments } from '../axiosRoutes/departmentRoutes'

const initialForm = {
    employee_id: '',
    name: '',
    department: '',
    email: '',
    phone: '',
    designation: '',
    availability: 'AVAILABLE',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const StaffForm = ({ staff, onSubmit, onCancel }) => {

    const [formData, setFormData] = useState(initialForm)
    const [departments, setDepartments] = useState([])

    useEffect(() => {
        let mounted = true
        getDepartments({ limit: 100 })
            .then((response) => {
                const data = response.data.data || response.data || []
                if (mounted) setDepartments(Array.isArray(data) ? data : [])
            })
            .catch(() => { if (mounted) setDepartments([]) })
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        if (staff) {
            setFormData({
                employee_id: staff.employee_id || '',
                name: staff.name || '',
                department: staff.department || '',
                email: staff.email || '',
                phone: staff.phone || '',
                designation: staff.designation || '',
                availability: staff.availability || 'AVAILABLE',
            })
        } else {
            setFormData(initialForm)
        }
    }, [staff])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        onSubmit(formData)

        if (!staff) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {departments.length === 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                    Create at least one department in Department Management before creating staff.
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="employee_id" className={labelClass}>Employee ID</label>
                    <input id="employee_id" name="employee_id" type="text" value={formData.employee_id} onChange={handleChange} placeholder="EMP001" required disabled={!!staff} className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
                </div>

                <div>
                    <label htmlFor="name" className={labelClass}>Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="John Doe" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="department" className={labelClass}>Department</label>
                    <select id="department" name="department" value={formData.department} onChange={handleChange} required disabled={departments.length === 0} className={inputClass}>
                        <option value="">{departments.length ? 'Select department' : 'Create a department first'}</option>
                        {departments.map((department) => <option key={department.department_id} value={department.name}>{department.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john.doe@college.edu" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="phone" className={labelClass}>Phone</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="designation" className={labelClass}>Designation</label>
                    <input id="designation" name="designation" type="text" value={formData.designation} onChange={handleChange} placeholder="Assistant Professor" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="availability" className={labelClass}>Availability</label>
                    <select id="availability" name="availability" value={formData.availability} onChange={handleChange} className={inputClass}>
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
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
                    disabled={departments.length === 0}
                    className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-800"
                >
                    {staff ? 'Update staff' : 'Add staff'}
                </button>
            </div>
        </form>
    )
}

export default StaffForm
