import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import StudentForm from '../components/StudentForm'
import StudentTable from '../components/StudentTable'
import Modal from '../components/ui/Modal'
import DetailList from '../components/ui/DetailList'

import {
    getStudents,
    addStudent as addStudentApi,
    updateStudent as updateStudentApi,
    deleteStudent as deleteStudentApi,
    bulkUploadStudents,
    getStudentExams,
    getStudentAttendance,
} from '../axiosRoutes/studentRoutes'
import { getDepartments } from '../axiosRoutes/departmentRoutes'
import { getCourses } from '../axiosRoutes/courseRoutes'

import { setStudents, addStudent, updateStudent, removeStudent, setSelectedStudent, setStudentLoading, setStudentError, } from '../redux/slices/studentSlice'
import PageHeader from '../components/ui/PageHeader'

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]
const SECTIONS = ['A', 'B', 'C', 'D']

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const StudentManagement = () => {

    const dispatch = useDispatch()

    const { students, selectedStudent, loading, error, pagination } = useSelector((state) => state.students)
    const [csvFile, setCsvFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        department: '',
        semester: '',
        section: '',
        course: '',
    })
    const [page, setPage] = useState(1)
    const [details, setDetails] = useState(null)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [departments, setDepartments] = useState([])
    const [courses, setCourses] = useState([])

    useEffect(() => {
        Promise.all([getDepartments({ limit: 100 }), getCourses({ limit: 100 })])
            .then(([departmentResponse, courseResponse]) => {
                const departmentData = departmentResponse.data.data || departmentResponse.data || []
                const courseData = courseResponse.data.data || courseResponse.data || []
                setDepartments(Array.isArray(departmentData) ? departmentData : [])
                setCourses(Array.isArray(courseData) ? courseData : [])
            })
            .catch(() => {
                setDepartments([])
                setCourses([])
            })
    }, [])

    // GET STUDENTS
    const fetchStudents = async (requestedPage = page) => {

        try {

            dispatch(setStudentLoading(true))
            dispatch(setStudentError(null))

            const response = await getStudents({ page: requestedPage, limit: 10, ...filters })
            const responsePagination = response.data.pagination || {}

            dispatch(
                setStudents({
                    students: response.data.data || [],
                    pagination: responsePagination,
                })
            )

            if (responsePagination.page && responsePagination.page !== page) {
                setPage(responsePagination.page)
            }

            dispatch(setStudentLoading(false))

        } catch (error) {

            console.error("🔍"+error)

            dispatch(
                setStudentError(
                    error.response?.data?.message ||
                    'Failed to fetch students'
                )
            )
        }
    }

    // LOAD STUDENTS
    useEffect(() => {
        fetchStudents(page)
    }, [page, filters.search, filters.department, filters.semester, filters.section, filters.course])


    // ADD / UPDATE
    const handleSubmit = async (data) => {
        try {

            dispatch(setStudentLoading(true))
            dispatch(setStudentError(null))

            if (selectedStudent) {

                const response = await updateStudentApi(
                    selectedStudent.usn,
                    data
                )

                const updatedStudent =
                    response.data.data || response.data

                dispatch(updateStudent(updatedStudent))
                dispatch(setSelectedStudent(null))

            } else {

                const response = await addStudentApi(data)

                const newStudent =
                    response.data.data || response.data

                dispatch(addStudent(newStudent))
                await fetchStudents(page)
            }

            dispatch(setStudentLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setStudentError(
                    error.response?.data?.message ||
                    'Student operation failed'
                )
            )
        }
    }

    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedStudent(null))
        setFormModalOpen(true)
    }

    // EDIT
    const handleEdit = (student) => {
        dispatch(setSelectedStudent(student))
        setFormModalOpen(true)
    }

    // DELETE
    const handleDelete = async (student) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${student.name}?`
        )

        if (!confirmDelete) {
            return
        }

        try {

            dispatch(setStudentLoading(true))
            dispatch(setStudentError(null))

            await deleteStudentApi(student.usn)

            dispatch(removeStudent(student.usn))

            dispatch(setStudentLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setStudentError(
                    error.response?.data?.message ||
                    'Failed to delete student'
                )
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(setSelectedStudent(null))
        setFormModalOpen(false)
    }

    const handleFilterChange = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
        setPage(1)
    }

    const handleStudentDetails = async (student, type) => {
        try {
            dispatch(setStudentError(null))
            const request = type === 'exams' ? getStudentExams : getStudentAttendance
            const response = await request(student.student_id)
            setDetails({ title: `${type === 'exams' ? 'Exams' : 'Attendance'} — ${student.name}`, data: response.data.data || response.data })
        } catch (error) {
            dispatch(setStudentError(error.response?.data?.message || `Failed to load student ${type}`))
        }
    }

    const handleBulkUpload = async (event) => {
        event.preventDefault()

        if (!csvFile) {
            dispatch(setStudentError('Please select a CSV file'))
            return
        }

        const formData = new FormData()
        formData.append('file', csvFile)

        try {
            setUploading(true)
            dispatch(setStudentError(null))

            await bulkUploadStudents(formData)
            setCsvFile(null)
            event.target.reset()
            await fetchStudents()
        } catch (error) {
            dispatch(
                setStudentError(
                    error.response?.data?.message ||
                    'Failed to upload students'
                )
            )
        } finally {
            setUploading(false)
        }
    }


    return (
        <div className="space-y-6">
            <PageHeader
                icon="students"
                title="Student Management"
                description="Maintain student records, sections and bulk uploads."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add student
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Bulk upload */}
            <form onSubmit={handleBulkUpload} className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-ink-200 bg-white p-4">
                <label htmlFor="student-csv" className="text-sm font-medium text-ink-600">
                    Bulk upload students (CSV)
                </label>
                <input
                    id="student-csv"
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                    disabled={uploading}
                    className="text-sm text-ink-500 file:mr-3 file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink-700 hover:file:bg-ink-200"
                />
                <button
                    type="submit"
                    disabled={!csvFile || uploading}
                    className="rounded-lg bg-brass-500 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brass-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {uploading ? 'Uploading…' : 'Upload CSV'}
                </button>
            </form>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <input
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search USN, name, or email"
                    className="min-w-[220px] flex-1 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400"
                />
                <select name="department" value={filters.department} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All departments</option>
                    {departments.map((dept) => <option key={dept.department_id} value={dept.name}>{dept.name}</option>)}
                </select>
                <select name="semester" value={filters.semester} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All semesters</option>
                    {SEMESTERS.map((semesterOption) => <option key={semesterOption} value={semesterOption}>{semesterOption}</option>)}
                </select>
                <select name="section" value={filters.section} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All sections</option>
                    {SECTIONS.map((sectionOption) => <option key={sectionOption} value={sectionOption}>{sectionOption}</option>)}
                </select>
                <select name="course" value={filters.course} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All courses</option>
                    {courses.map((course) => <option key={course.course_id} value={course.name}>{course.name}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <StudentTable
                    students={students}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewExams={(student) => handleStudentDetails(student, 'exams')}
                    onViewAttendance={(student) => handleStudentDetails(student, 'attendance')}
                />
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4">
                <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((current) => current - 1)}
                    className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>
                <span className="text-sm text-ink-500">
                    Page {pagination.page || page} of {pagination.totalPages || 1}
                </span>
                <button
                    type="button"
                    disabled={page >= (pagination.totalPages || 1) || loading}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>

            {/* Add / Edit modal */}
            <Modal
                open={formModalOpen}
                onClose={handleCancel}
                title={selectedStudent ? 'Update student' : 'Add student'}
                description={selectedStudent ? `Editing ${selectedStudent.name}` : 'Enter the new student\u2019s details'}
                size="lg"
            >
                <StudentForm
                    student={selectedStudent}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Modal>

            {/* View details modal */}
            <Modal
                open={Boolean(details)}
                onClose={() => setDetails(null)}
                title={details?.title || ''}
                size="lg"
            >
                <DetailList data={details?.data} />
            </Modal>
        </div>
    )
}

export default StudentManagement
