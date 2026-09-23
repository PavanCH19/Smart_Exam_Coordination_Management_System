import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ExamForm from '../components/ExamForm'
import ExamTable from '../components/ExamTable'
import Modal from '../components/ui/Modal'

import {
    getExams,
    addExam as addExamApi,
    updateExam as updateExamApi,
    deleteExam as deleteExamApi,
} from '../axiosRoutes/examRoutes'

import {
    setExams,
    addExam,
    updateExam,
    removeExam,
    setSelectedExam,
    setExamLoading,
    setExamError,
} from '../redux/slices/examSlice'
import PageHeader from '../components/ui/PageHeader'

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'


const ExamManagement = () => {

    const dispatch = useDispatch()

    const {
        exams,
        selectedExam,
        loading,
        error,
        pagination,
    } = useSelector((state) => state.exams)

    const [page, setPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState('')

    // GET ALL EXAMS
    const fetchExams = async (requestedPage = page) => {

        try {
            dispatch(setExamLoading(true))
            dispatch(setExamError(null))

            const response = await getExams({
                page: requestedPage,
                limit: 10,
                status: statusFilter || undefined,
            })

            const responsePagination = response.data.pagination || {}

            dispatch(
                setExams({
                    exams: response.data.data || [],
                    pagination: responsePagination,
                }),
            )

            if (responsePagination.page && responsePagination.page !== page) {
                setPage(responsePagination.page)
            }

            dispatch(setExamLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setExamError(
                    error.response?.data?.message || 'Failed to fetch exams',
                ),
            )
        }
    }

    // LOAD EXAMS
    useEffect(() => {
        fetchExams(page)
    }, [page, statusFilter])

    // ADD / UPDATE
    const handleSubmit = async (data) => {

        try {
            dispatch(setExamLoading(true))
            dispatch(setExamError(null))

            if (selectedExam) {

                const response = await updateExamApi(
                    selectedExam.exam_id,
                    data,
                )

                const updatedExam = response.data.data || response.data

                dispatch(updateExam(updatedExam))
                dispatch(setSelectedExam(null))

            } else {

                const response = await addExamApi(data)

                const newExam = response.data.data || response.data

                dispatch(addExam(newExam))
            }

            dispatch(setExamLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setExamError(
                    error.response?.data?.message || 'Exam operation failed',
                ),
            )
        }
    }

    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedExam(null))
        setFormModalOpen(true)
    }

    // EDIT
    const handleEdit = (exam) => {
        dispatch(setSelectedExam(exam))
        setFormModalOpen(true)
    }

    // DELETE
    const handleDelete = async (exam) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete this examination?`,
        )

        if (!confirmDelete) {
            return
        }

        try {
            dispatch(setExamLoading(true))
            dispatch(setExamError(null))

            await deleteExamApi(exam.exam_id)

            dispatch(removeExam(exam.exam_id))

            dispatch(setExamLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setExamError(
                    error.response?.data?.message || 'Failed to delete exam',
                ),
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(setSelectedExam(null))
        setFormModalOpen(false)
    }

    // RENDER
    return (
        <div className="space-y-6">
            <PageHeader
                icon="exam"
                title="Exam Management"
                description="Create and schedule examination sessions."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Create exam
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <select
                    value={statusFilter}
                    onChange={(event) => {
                        setStatusFilter(event.target.value)
                        setPage(1)
                    }}
                    className={selectClass}
                >
                    <option value="">All statuses</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <ExamTable
                    exams={exams}
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
                title={selectedExam ? 'Update exam' : 'Create exam'}
                description={selectedExam ? 'Editing an existing examination' : 'Select a subject and schedule the exam'}
                size="lg"
            >
                <ExamForm
                    exam={selectedExam}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    existingExams={exams}
                />
            </Modal>
        </div>
    )
}

export default ExamManagement
