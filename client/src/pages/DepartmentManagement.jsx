import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import DepartmentForm from '../components/DepartmentForm'
import DepartmentTable from '../components/DepartmentTable'
import Modal from '../components/ui/Modal'

import {
    getDepartments,
    addDepartment as addDepartmentApi,
    updateDepartment as updateDepartmentApi,
    deleteDepartment as deleteDepartmentApi,
} from '../axiosRoutes/departmentRoutes'

import {
    setDepartments,
    addDepartment,
    updateDepartment,
    removeDepartment,
    setSelectedDepartment,
    setDepartmentLoading,
    setDepartmentError,
} from '../redux/slices/departmentSlice'
import PageHeader from '../components/ui/PageHeader'


const DepartmentManagement = () => {

    const dispatch = useDispatch()

    const {
        departments,
        selectedDepartment,
        loading,
        error,
        pagination,
    } = useSelector((state) => state.departments)

    const [page, setPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)

    // GET ALL DEPARTMENTS
    const fetchDepartments = async (requestedPage = page) => {

        try {
            dispatch(setDepartmentLoading(true))
            dispatch(setDepartmentError(null))

            const response = await getDepartments({
                page: requestedPage,
                limit: 10,
            })

            const responsePagination = response.data.pagination || {}

            dispatch(
                setDepartments({
                    departments: response.data.data || [],
                    pagination: responsePagination,
                }),
            )

            if (responsePagination.page && responsePagination.page !== page) {
                setPage(responsePagination.page)
            }

            dispatch(setDepartmentLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setDepartmentError(
                    error.response?.data?.message || 'Failed to fetch departments',
                ),
            )
        }
    }

    // LOAD DEPARTMENTS
    useEffect(() => {
        fetchDepartments(page)
    }, [page])

    // ADD / UPDATE
    const handleSubmit = async (data) => {

        try {
            dispatch(setDepartmentLoading(true))
            dispatch(setDepartmentError(null))

            if (selectedDepartment) {

                const response = await updateDepartmentApi(
                    selectedDepartment.department_id,
                    data,
                )

                const updatedDepartment = response.data.data || response.data

                dispatch(updateDepartment(updatedDepartment))
                dispatch(setSelectedDepartment(null))

            } else {

                const response = await addDepartmentApi(data)

                const newDepartment = response.data.data || response.data

                dispatch(addDepartment(newDepartment))
            }

            dispatch(setDepartmentLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setDepartmentError(
                    error.response?.data?.message || 'Department operation failed',
                ),
            )
        }
    }

    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedDepartment(null))
        setFormModalOpen(true)
    }

    // EDIT
    const handleEdit = (department) => {
        dispatch(setSelectedDepartment(department))
        setFormModalOpen(true)
    }

    // DELETE
    const handleDelete = async (department) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${department.name}?`,
        )

        if (!confirmDelete) {
            return
        }

        try {
            dispatch(setDepartmentLoading(true))
            dispatch(setDepartmentError(null))

            await deleteDepartmentApi(department.department_id)

            dispatch(removeDepartment(department.department_id))

            dispatch(setDepartmentLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setDepartmentError(
                    error.response?.data?.message || 'Failed to delete department',
                ),
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(setSelectedDepartment(null))
        setFormModalOpen(false)
    }

    // RENDER
    return (
        <div className="space-y-6">
            <PageHeader
                icon="department"
                title="Department Management"
                description="Academic departments used across courses and exams."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add department
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
                <DepartmentTable
                    departments={departments}
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
                title={selectedDepartment ? 'Update department' : 'Add department'}
                description={selectedDepartment ? `Editing ${selectedDepartment.name}` : 'Enter the new department\u2019s details'}
            >
                <DepartmentForm
                    department={selectedDepartment}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    )
}

export default DepartmentManagement
