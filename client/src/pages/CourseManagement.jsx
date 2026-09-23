import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import CourseForm from '../components/CourseForm'
import CourseTable from '../components/CourseTable'
import Modal from '../components/ui/Modal'

import {
    getCourses,
    addCourse as addCourseApi,
    updateCourse as updateCourseApi,
    deleteCourse as deleteCourseApi,
} from '../axiosRoutes/courseRoutes'

import {
    setCourses,
    addCourse,
    updateCourse,
    removeCourse,
    setSelectedCourse,
    setCourseLoading,
    setCourseError,
} from '../redux/slices/courseSlice'
import PageHeader from '../components/ui/PageHeader'


const CourseManagement = () => {

    const dispatch = useDispatch()

    const {
        courses,
        selectedCourse,
        loading,
        error,
        pagination,
    } = useSelector((state) => state.courses)

    const [page, setPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)

    // GET ALL COURSES
    const fetchCourses = async (requestedPage = page) => {

        try {
            dispatch(setCourseLoading(true))
            dispatch(setCourseError(null))

            const response = await getCourses({
                page: requestedPage,
                limit: 10,
            })

            const responsePagination = response.data.pagination || {}

            dispatch(
                setCourses({
                    courses: response.data.data || [],
                    pagination: responsePagination,
                }),
            )

            if (responsePagination.page && responsePagination.page !== page) {
                setPage(responsePagination.page)
            }

            dispatch(setCourseLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setCourseError(
                    error.response?.data?.message || 'Failed to fetch courses',
                ),
            )
        }
    }

    // LOAD COURSES
    useEffect(() => {
        fetchCourses(page)
    }, [page])

    // ADD / UPDATE
    const handleSubmit = async (data) => {

        try {
            dispatch(setCourseLoading(true))
            dispatch(setCourseError(null))

            if (selectedCourse) {

                const response = await updateCourseApi(
                    selectedCourse.course_id,
                    data,
                )

                const updatedCourse = response.data.data || response.data

                dispatch(updateCourse(updatedCourse))
                dispatch(setSelectedCourse(null))

            } else {

                const response = await addCourseApi(data)

                const newCourse = response.data.data || response.data

                dispatch(addCourse(newCourse))
            }

            dispatch(setCourseLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setCourseError(
                    error.response?.data?.message || 'Course operation failed',
                ),
            )
        }
    }

    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedCourse(null))
        setFormModalOpen(true)
    }

    // EDIT
    const handleEdit = (course) => {
        dispatch(setSelectedCourse(course))
        setFormModalOpen(true)
    }

    // DELETE
    const handleDelete = async (course) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${course.name}?`,
        )

        if (!confirmDelete) {
            return
        }

        try {
            dispatch(setCourseLoading(true))
            dispatch(setCourseError(null))

            await deleteCourseApi(course.course_id)

            dispatch(removeCourse(course.course_id))

            dispatch(setCourseLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setCourseError(
                    error.response?.data?.message || 'Failed to delete course',
                ),
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(setSelectedCourse(null))
        setFormModalOpen(false)
    }

    // RENDER
    return (
        <div className="space-y-6">
            <PageHeader
                icon="course"
                title="Course Management"
                description="Programmes offered under each department."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add course
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <CourseTable
                    courses={courses}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {/* PAGINATION */}
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
                title={selectedCourse ? 'Update course' : 'Add course'}
                description={selectedCourse ? `Editing ${selectedCourse.name}` : 'Enter the new course\u2019s details'}
            >
                <CourseForm
                    course={selectedCourse}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    )
}

export default CourseManagement
