import React, { useEffect, useState } from 'react'
import { getDepartments } from '../axiosRoutes/departmentRoutes'

const initialForm = {
    name: '',
    code: '',
    department: '',
    duration_years: '',
    total_semesters: '',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const CourseForm = ({ course, onSubmit, onCancel }) => {

    const [formData, setFormData] = useState(initialForm)
    const [departments, setDepartments] = useState([])

    // Pull the live department list so the dropdown always matches what's
    // been added under Department Management, instead of a hardcoded list.
    useEffect(() => {
        let isMounted = true

        const fetchDepartments = async () => {
            try {
                const response = await getDepartments({ limit: 100 })
                const data = response.data.data || response.data || []
                if (isMounted) setDepartments(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error(error)
            }
        }

        fetchDepartments()
        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        if (course) {
            setFormData({
                name: course.name || '',
                code: course.code || '',
                department: course.department || '',
                duration_years: course.duration_years ?? '',
                total_semesters: course.total_semesters ?? '',
            })
        } else {
            setFormData(initialForm)
        }
    }, [course])

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
            duration_years: Number(formData.duration_years),
            total_semesters: Number(formData.total_semesters),
        })

        if (!course) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {departments.length === 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                    Create at least one department in Department Management before creating a course.
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                    <label htmlFor="name" className={labelClass}>Course name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Bachelor of Engineering - Computer Science"
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="code" className={labelClass}>Course code</label>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="BE CSE"
                        required
                        className={`${inputClass} uppercase`}
                    />
                </div>

                <div>
                    <label htmlFor="department" className={labelClass}>Department</label>
                    <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">{departments.length ? 'Select department' : 'Create a department first'}</option>
                        {departments.map((dept) => (
                            <option key={dept.department_id} value={dept.name}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="duration_years" className={labelClass}>Duration (years)</label>
                    <select
                        id="duration_years"
                        name="duration_years"
                        value={formData.duration_years}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select duration</option>
                        {[1, 2, 3, 4, 5, 6].map((years) => (
                            <option key={years} value={years}>{years} {years === 1 ? 'year' : 'years'}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="total_semesters" className={labelClass}>Total semesters</label>
                    <select
                        id="total_semesters"
                        name="total_semesters"
                        value={formData.total_semesters}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select total semesters</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                            <option key={semester} value={semester}>{semester}</option>
                        ))}
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
                    {course ? 'Update course' : 'Add course'}
                </button>
            </div>
        </form>
    )
}

export default CourseForm
