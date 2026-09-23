import React, { useEffect, useState } from 'react'
import { getDepartments } from '../axiosRoutes/departmentRoutes'
import { getCourses } from '../axiosRoutes/courseRoutes'

const initialForm = {
    usn: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    semester: '',
    section: '',
    course: '',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const StudentForm = ({ student = null, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialForm)
    const [departments, setDepartments] = useState([])
    const [courses, setCourses] = useState([])
    const [loadError, setLoadError] = useState(null)

    const isEditMode = Boolean(student)

    useEffect(() => {
        let mounted = true

        const loadPrerequisites = async () => {
            try {
                const [departmentResponse, courseResponse] = await Promise.all([
                    getDepartments({ limit: 100 }),
                    getCourses({ limit: 100 }),
                ])
                if (!mounted) return
                const departmentData = departmentResponse.data.data || departmentResponse.data || []
                const courseData = courseResponse.data.data || courseResponse.data || []
                setDepartments(Array.isArray(departmentData) ? departmentData : [])
                setCourses(Array.isArray(courseData) ? courseData : [])
            } catch (error) {
                if (mounted) setLoadError('Departments and courses must be available before creating a student.')
            }
        }

        loadPrerequisites()
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        if (student) {
            setFormData({
                usn: student.usn || '',
                name: student.name || '',
                email: student.email || '',
                phone: student.phone || '',
                department: student.department || '',
                semester: student.semester || '',
                section: student.section || '',
                course: student.course || '',
            })
        } else {
            setFormData(initialForm)
        }
    }, [student])

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        const data = {
            ...formData,
            semester: Number(formData.semester),
        }

        onSubmit(data)

        if (!isEditMode) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {(departments.length === 0 || courses.length === 0) && (
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800">
                    Create at least one department and one course in Department Management and Course Management before creating a student.
                </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="usn" className={labelClass}>USN</label>
                    <input id="usn" name="usn" type="text" value={formData.usn} onChange={handleChange} placeholder="1XX00CS000" required disabled={isEditMode} className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
                </div>

                <div>
                    <label htmlFor="name" className={labelClass}>Name</label>
                    <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Student name" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="email" className={labelClass}>Email</label>
                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="student@college.edu" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="phone" className={labelClass}>Phone</label>
                    <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="9876543210" pattern="[0-9]{10}" maxLength="10" required className={inputClass} />
                </div>

                <div>
                    <label htmlFor="department" className={labelClass}>Department</label>
                    <select id="department" name="department" value={formData.department} onChange={handleChange} required disabled={departments.length === 0} className={inputClass}>
                        <option value="">{departments.length ? 'Select department' : 'Create a department first'}</option>
                        {departments.map((department) => <option key={department.department_id} value={department.name}>{department.name}</option>)}
                    </select>
                </div>

                <div>
                    <label htmlFor="semester" className={labelClass}>Semester</label>
                    <select id="semester" name="semester" value={formData.semester} onChange={handleChange} required className={inputClass}>
                        <option value="">Select semester</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="section" className={labelClass}>Section</label>
                    <select id="section" name="section" value={formData.section} onChange={handleChange} required className={inputClass}>
                        <option value="">Select section</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="course" className={labelClass}>Course</label>
                    <select id="course" name="course" value={formData.course} onChange={handleChange} required disabled={courses.length === 0} className={inputClass}>
                        <option value="">{courses.length ? 'Select course' : 'Create a course first'}</option>
                        {courses.map((course) => <option key={course.course_id} value={course.name}>{course.name} ({course.code})</option>)}
                    </select>
                </div>
            </div>

            {loadError && <p className="mt-4 text-sm text-rose-600">{loadError}</p>}
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
                    disabled={departments.length === 0 || courses.length === 0}
                    className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-800"
                >
                    {isEditMode ? 'Update student' : 'Add student'}
                </button>
            </div>
        </form>
    )
}

export default StudentForm
