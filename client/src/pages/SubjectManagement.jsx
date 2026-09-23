import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import SubjectForm from '../components/SubjectForm'
import SubjectTable from '../components/SubjectTable'
import Modal from '../components/ui/Modal'

import {
    getSubjects,
    addSubject as addSubjectApi,
    updateSubject as updateSubjectApi,
    deleteSubject as deleteSubjectApi,
} from '../axiosRoutes/subjectRoutes'

import {
    setSubjects,
    addSubject,
    updateSubject,
    removeSubject,
    setSelectedSubject,
    setSubjectLoading,
    setSubjectError,
} from '../redux/slices/subjectSlice'
import PageHeader from '../components/ui/PageHeader'

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8]

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'


const SubjectManagement = () => {

    const dispatch = useDispatch()

    const {
        subjects,
        selectedSubject,
        loading,
        error,
        pagination,
    } = useSelector((state) => state.subjects)

    const [page, setPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [filters, setFilters] = useState({ search: '', semester: '' })

    // GET ALL SUBJECTS
    const fetchSubjects = async (requestedPage = page) => {

        try {
            dispatch(setSubjectLoading(true))
            dispatch(setSubjectError(null))

            const response = await getSubjects({
                page: requestedPage,
                limit: 10,
                ...filters,
            })

            const responsePagination = response.data.pagination || {}

            dispatch(
                setSubjects({
                    subjects: response.data.data || [],
                    pagination: responsePagination,
                }),
            )

            if (responsePagination.page && responsePagination.page !== page) {
                setPage(responsePagination.page)
            }

            dispatch(setSubjectLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setSubjectError(
                    error.response?.data?.message || 'Failed to fetch subjects',
                ),
            )
        }
    }

    // LOAD SUBJECTS
    useEffect(() => {
        fetchSubjects(page)
    }, [page, filters.search, filters.semester])

    // ADD / UPDATE
    const handleSubmit = async (data) => {

        try {
            dispatch(setSubjectLoading(true))
            dispatch(setSubjectError(null))

            if (selectedSubject) {

                const response = await updateSubjectApi(
                    selectedSubject.subject_id,
                    data,
                )

                const updatedSubject = response.data.data || response.data

                dispatch(updateSubject(updatedSubject))
                dispatch(setSelectedSubject(null))

            } else {

                const response = await addSubjectApi(data)

                const newSubject = response.data.data || response.data

                dispatch(addSubject(newSubject))
            }

            dispatch(setSubjectLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setSubjectError(
                    error.response?.data?.message || 'Subject operation failed',
                ),
            )
        }
    }

    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedSubject(null))
        setFormModalOpen(true)
    }

    // EDIT
    const handleEdit = (subject) => {
        dispatch(setSelectedSubject(subject))
        setFormModalOpen(true)
    }

    // DELETE
    const handleDelete = async (subject) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${subject.subject_name}?`,
        )

        if (!confirmDelete) {
            return
        }

        try {
            dispatch(setSubjectLoading(true))
            dispatch(setSubjectError(null))

            await deleteSubjectApi(subject.subject_id)

            dispatch(removeSubject(subject.subject_id))

            dispatch(setSubjectLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setSubjectError(
                    error.response?.data?.message || 'Failed to delete subject',
                ),
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(setSelectedSubject(null))
        setFormModalOpen(false)
    }

    const handleFilterChange = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
        setPage(1)
    }

    // RENDER
    return (
        <div className="space-y-6">
            <PageHeader
                icon="subject"
                title="Subject Management"
                description="Subjects, semesters and exam durations."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add subject
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
                <input
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search subject code or name"
                    className="min-w-[220px] flex-1 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400"
                />
                <select name="semester" value={filters.semester} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All semesters</option>
                    {SEMESTERS.map((sem) => <option key={sem} value={sem}>{sem}</option>)}
                </select>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <SubjectTable
                    subjects={subjects}
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
                title={selectedSubject ? 'Update subject' : 'Add subject'}
                description={selectedSubject ? `Editing ${selectedSubject.subject_name}` : 'Enter the new subject\u2019s details'}
            >
                <SubjectForm
                    subject={selectedSubject}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    )
}

export default SubjectManagement
