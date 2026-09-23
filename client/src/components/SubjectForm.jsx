import React, { useEffect, useState } from 'react'
import { getDepartments } from '../axiosRoutes/departmentRoutes'

const initialForm = {
    subject_code: '',
    subject_name: '',
    semester: '',
    department: '',
    duration: '',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const SubjectForm = ({ subject, onSubmit, onCancel }) => {

    const [formData, setFormData] = useState(initialForm)
    const [departments, setDepartments] = useState([])

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
        if (subject) {
            setFormData({
                subject_code: subject.subject_code || '',
                subject_name: subject.subject_name || '',
                semester: subject.semester ?? '',
                department: subject.department || '',
                duration: subject.duration ?? '',
            })
        } else {
            setFormData(initialForm)
        }
    }, [subject])

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
            semester: Number(formData.semester),
            duration: Number(formData.duration),
        })

        if (!subject) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {departments.length === 0 && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                    Create at least one department in Department Management before creating a subject.
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="subject_code" className={labelClass}>Subject code</label>
                    <input
                        id="subject_code"
                        name="subject_code"
                        type="text"
                        value={formData.subject_code}
                        onChange={handleChange}
                        placeholder="CS301"
                        required
                        disabled={Boolean(subject)}
                        className={`${inputClass} uppercase disabled:bg-ink-50 disabled:text-ink-400`}
                    />
                </div>

                <div>
                    <label htmlFor="subject_name" className={labelClass}>Subject name</label>
                    <input
                        id="subject_name"
                        name="subject_name"
                        type="text"
                        value={formData.subject_name}
                        onChange={handleChange}
                        placeholder="Database Management Systems"
                        required
                        className={inputClass}
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
                    <label htmlFor="semester" className={labelClass}>Semester</label>
                    <select
                        id="semester"
                        name="semester"
                        value={formData.semester}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="duration" className={labelClass}>Exam duration (minutes)</label>
                    <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Select duration</option>
                        {Array.from({ length: 15 }, (_, index) => (index + 2) * 15).map((minutes) => (
                            <option key={minutes} value={minutes}>{minutes} minutes</option>
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
                    {subject ? 'Update subject' : 'Add subject'}
                </button>
            </div>
        </form>
    )
}

export default SubjectForm
