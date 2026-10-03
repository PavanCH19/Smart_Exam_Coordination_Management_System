import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import StaffForm from '../components/StaffForm'
import StaffTable from '../components/StaffTable'
import Modal from '../components/ui/Modal'

import {
    getStaff,
    searchStaff,
    addStaff as addStaffApi,
    updateStaff as updateStaffApi,
    updateStaffAvailability,
    deleteStaff as deleteStaffApi,
    bulkUploadStaff,
} from '../axiosRoutes/staffRoutes'

import {
    setStaff,
    addStaff,
    updateStaff,
    removeStaff,
    setSelectedStaff,
    setStaffLoading,
    setStaffError,
} from '../redux/slices/staffSlice'
import PageHeader from '../components/ui/PageHeader'


const StaffManagement = () => {

    const dispatch = useDispatch()

    const { staff, selectedStaff, loading, error, pagination, } = useSelector((state) => state.staff)

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)
    const [csvFile, setCsvFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [uploadMessage, setUploadMessage] = useState('')


    // GET ALL STAFF
    const fetchStaff = async (requestedPage = page) => {

        try {

            dispatch(setStaffLoading(true))
            dispatch(setStaffError(null))

            const response = await getStaff({
                page: requestedPage,
                limit: 10,
            })

            const responsePagination =
                response.data.pagination || {}

            dispatch(
                setStaff({
                    staff: response.data.data || [],
                    pagination: responsePagination,
                }),
            )

            if (
                responsePagination.page &&
                responsePagination.page !== page
            ) {
                setPage(responsePagination.page)
            }

            dispatch(setStaffLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setStaffError(
                    error.response?.data?.message ||
                    'Failed to fetch staff',
                ),
            )
        }
    }


    // LOAD STAFF
    useEffect(() => {
        fetchStaff(page)
    }, [page])


    // SEARCH STAFF
    const handleSearch = async (searchTerm) => {

        if (!searchTerm.trim()) {
            setPage(1)
            await fetchStaff(1)
            return
        }

        try {

            dispatch(setStaffLoading(true))
            dispatch(setStaffError(null))

            const response = await searchStaff({ q: searchTerm })

            const staffData =
                response.data.data || response.data || []

            const staffList = Array.isArray(staffData)
                ? staffData
                : [staffData]

            dispatch(
                setStaff({
                    staff: staffList,
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: staffList.length,
                        totalPages: 1,
                    },
                }),
            )

            dispatch(setStaffLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setStaffError(
                    error.response?.data?.message ||
                    'Failed to search staff',
                ),
            )
        }
    }


    // ADD / UPDATE STAFF
    const handleSubmit = async (data) => {

        try {

            dispatch(setStaffLoading(true))
            dispatch(setStaffError(null))


            if (selectedStaff) {

                const response = await updateStaffApi( selectedStaff.employee_id, data )

                const updatedStaff = response.data.data || response.data

                dispatch( updateStaff(updatedStaff) )

                dispatch( setSelectedStaff(null) )

            } else {

                const response = await addStaffApi(data)

                const newStaff =
                    response.data.data || response.data

                dispatch(
                    addStaff(newStaff),
                )
                await fetchStaff(page)
            }

            dispatch(setStaffLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setStaffError(
                    error.response?.data?.message ||
                    'Staff operation failed',
                ),
            )
        }
    }


    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedStaff(null))
        setFormModalOpen(true)
    }

    // EDIT STAFF
    const handleEdit = (staffMember) => {
        dispatch(
            setSelectedStaff(staffMember),
        )
        setFormModalOpen(true)
    }


    // UPDATE STAFF AVAILABILITY
    const handleAvailability = async (staffMember) => {

        try {

            dispatch(setStaffLoading(true))
            dispatch(setStaffError(null))


            const newAvailability =
                staffMember.availability === 'AVAILABLE'
                    ? 'UNAVAILABLE'
                    : 'AVAILABLE'


            const response =
                await updateStaffAvailability(
                    staffMember.employee_id,
                    {
                        availability: newAvailability,
                    },
                )


            const updatedStaff =
                response.data.data || response.data


            dispatch(
                updateStaff(updatedStaff),
            )

            dispatch(setStaffLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setStaffError(
                    error.response?.data?.message ||
                    'Failed to update staff availability',
                ),
            )
        }
    }


    // DELETE STAFF
    const handleDelete = async (staffMember) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${staffMember.name}?`,
        )

        if (!confirmDelete) {
            return
        }

        try {
            dispatch(setStaffLoading(true))
            dispatch(setStaffError(null))

            await deleteStaffApi( staffMember.employee_id, )

            dispatch(
                removeStaff(
                    staffMember.employee_id,
                ),
            )

            dispatch(setStaffLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setStaffError(
                    error.response?.data?.message ||
                    'Failed to delete staff',
                ),
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(
            setSelectedStaff(null),
        )
        setFormModalOpen(false)
    }

    const handleBulkUpload = async (event) => {
        event.preventDefault()

        if (!csvFile) {
            dispatch(setStaffError('Please select a CSV file'))
            return
        }

        const formData = new FormData()
        formData.append('file', csvFile)

        try {
            setUploading(true)
            setUploadMessage('')
            dispatch(setStaffError(null))

            const response = await bulkUploadStaff(formData)
            const result = response.data.data || {}
            setCsvFile(null)
            event.target.reset()
            setUploadMessage(`Uploaded ${result.count || 0} staff member(s).`)
            setSearch('')
            setPage(1)
            await fetchStaff(1)
        } catch (error) {
            dispatch(setStaffError(error.response?.data?.message || 'Failed to upload staff'))
        } finally {
            setUploading(false)
        }
    }

    // RENDER
    return (
        <div className="space-y-6">
            <PageHeader
                icon="staff"
                title="Staff Management"
                description="Manage invigilators, availability and workload."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add staff
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {uploadMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    {uploadMessage}
                </div>
            )}

            <form onSubmit={handleBulkUpload} className="space-y-4 rounded-2xl border border-dashed border-ink-200 bg-white p-5">
                <div>
                    <h2 className="text-sm font-semibold text-ink-800">Bulk upload staff</h2>
                    <p className="mt-1 text-sm text-ink-500">
                        Choose a CSV file with employee_id, name, department, email and designation columns.
                        Phone and availability are optional.
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    <div className="min-w-[260px] flex-1">
                        <label htmlFor="staff-csv" className="mb-1.5 block text-sm font-medium text-ink-600">
                            Select staff CSV file
                        </label>
                        <input
                            id="staff-csv"
                            name="file"
                            type="file"
                            accept=".csv,text/csv"
                            onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                            disabled={uploading}
                            className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-ink-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-ink-700 hover:file:bg-ink-200"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!csvFile || uploading}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {uploading ? 'Uploading…' : 'Upload CSV'}
                    </button>
                </div>
            </form>

            {/* SEARCH */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <input
                    type="text"
                    value={search}
                    onChange={(event) => {
                        const nextSearch = event.target.value
                        setSearch(nextSearch)
                        handleSearch(nextSearch)
                    }}
                    placeholder="Search employee ID, name, email…"
                    className="min-w-[240px] flex-1 rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400"
                />

                <button
                    type="button"
                    onClick={() => {
                        setSearch('')
                        setPage(1)
                        fetchStaff(1)
                    }}
                    className="rounded-lg border border-ink-200 px-3.5 py-2 text-sm font-medium text-ink-600 transition hover:border-brass-300"
                >
                    Clear
                </button>
            </div>

            {/* STAFF TABLE */}
            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <StaffTable
                    staff={staff}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAvailability={handleAvailability}
                />
            )}

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-4">
                <button
                    type="button"
                    disabled={ page <= 1 || loading }
                    onClick={() => setPage( (current) => current - 1, ) }
                    className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Previous
                </button>

                <span className="text-sm text-ink-500">
                    Page {pagination.page || page} of {pagination.totalPages || 1}
                </span>

                <button
                    type="button"
                    disabled={ page >= (pagination.totalPages || 1) || loading }
                    onClick={() => setPage( (current) => current + 1, ) }
                    className="rounded-lg border border-ink-200 px-3.5 py-1.5 text-sm font-medium text-ink-600 transition hover:border-brass-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                </button>
            </div>

            {/* Add / Edit modal */}
            <Modal
                open={formModalOpen}
                onClose={handleCancel}
                title={selectedStaff ? 'Update staff' : 'Add staff'}
                description={selectedStaff ? `Editing ${selectedStaff.name}` : 'Enter the new staff member\u2019s details'}
                size="lg"
            >
                <StaffForm
                    staff={selectedStaff}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    )
}


export default StaffManagement
