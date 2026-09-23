import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import RoomForm from '../components/RoomForm'
import RoomTable from '../components/RoomTable'
import Modal from '../components/ui/Modal'

import {
    getRooms,
    addRoom as addRoomApi,
    updateRoom as updateRoomApi,
    deleteRoom as deleteRoomApi,
} from '../axiosRoutes/roomRoutes'

import {
    setRooms,
    addRoom,
    updateRoom,
    removeRoom,
    setSelectedRoom,
    setRoomLoading,
    setRoomError,
} from '../redux/slices/roomSlice'
import PageHeader from '../components/ui/PageHeader'


const RoomManagement = () => {

    const dispatch = useDispatch()

    const {
        rooms,
        selectedRoom,
        loading,
        error,
        pagination,
    } = useSelector((state) => state.rooms)

    const [page, setPage] = useState(1)
    const [formModalOpen, setFormModalOpen] = useState(false)

    // GET ALL ROOMS
    const fetchRooms = async (requestedPage = page) => {

        try {
            dispatch(setRoomLoading(true))
            dispatch(setRoomError(null))

            const response = await getRooms({
                page: requestedPage,
                limit: 10,
            })

            const responsePagination = response.data.pagination || {}

            dispatch(
                setRooms({
                    rooms: response.data.data || [],
                    pagination: responsePagination,
                }),
            )

            if (responsePagination.page && responsePagination.page !== page) {
                setPage(responsePagination.page)
            }

            dispatch(setRoomLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setRoomError(
                    error.response?.data?.message || 'Failed to fetch rooms',
                ),
            )
        }
    }

    // LOAD ROOMS
    useEffect(() => {
        fetchRooms(page)
    }, [page])

    // ADD / UPDATE
    const handleSubmit = async (data) => {

        try {
            dispatch(setRoomLoading(true))
            dispatch(setRoomError(null))

            if (selectedRoom) {

                const response = await updateRoomApi(
                    selectedRoom.room_id,
                    data,
                )

                const updatedRoom = response.data.data || response.data

                dispatch(updateRoom(updatedRoom))
                dispatch(setSelectedRoom(null))

            } else {

                const response = await addRoomApi(data)

                const newRoom = response.data.data || response.data

                dispatch(addRoom(newRoom))
            }

            dispatch(setRoomLoading(false))
            setFormModalOpen(false)

        } catch (error) {

            console.error(error)

            dispatch(
                setRoomError(
                    error.response?.data?.message || 'Room operation failed',
                ),
            )
        }
    }

    // OPEN ADD MODAL
    const handleOpenAdd = () => {
        dispatch(setSelectedRoom(null))
        setFormModalOpen(true)
    }

    // EDIT
    const handleEdit = (room) => {
        dispatch(setSelectedRoom(room))
        setFormModalOpen(true)
    }

    // DELETE
    const handleDelete = async (room) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete room ${room.room_number}?`,
        )

        if (!confirmDelete) {
            return
        }

        try {
            dispatch(setRoomLoading(true))
            dispatch(setRoomError(null))

            await deleteRoomApi(room.room_id)

            dispatch(removeRoom(room.room_id))

            dispatch(setRoomLoading(false))

        } catch (error) {

            console.error(error)

            dispatch(
                setRoomError(
                    error.response?.data?.message || 'Failed to delete room',
                ),
            )
        }
    }

    // CANCEL / CLOSE FORM MODAL
    const handleCancel = () => {
        dispatch(setSelectedRoom(null))
        setFormModalOpen(false)
    }

    const totalCapacity = rooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0)
    const availableCount = rooms.filter((room) => room.status === 'AVAILABLE').length

    // RENDER
    return (
        <div className="space-y-6">
            <PageHeader
                icon="room"
                title="Exam Hall Management"
                description="Rooms, capacity and availability for examinations."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add room
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {/* Quick summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-ink-100 bg-white p-4 text-center">
                    <p className="font-display text-xl font-semibold text-ink-900">{rooms.length}</p>
                    <p className="text-xs text-ink-500">Rooms (this page)</p>
                </div>
                <div className="rounded-xl border border-ink-100 bg-white p-4 text-center">
                    <p className="font-display text-xl font-semibold text-ink-900">{totalCapacity}</p>
                    <p className="text-xs text-ink-500">Combined capacity</p>
                </div>
                <div className="rounded-xl border border-ink-100 bg-white p-4 text-center">
                    <p className="font-display text-xl font-semibold text-emerald-600">{availableCount}</p>
                    <p className="text-xs text-ink-500">Available now</p>
                </div>
            </div>

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <RoomTable
                    rooms={rooms}
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
                title={selectedRoom ? 'Update room' : 'Add room'}
                description={selectedRoom ? `Editing room ${selectedRoom.room_number}` : 'Enter the new room\u2019s details'}
            >
                <RoomForm
                    room={selectedRoom}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            </Modal>
        </div>
    )
}

export default RoomManagement
