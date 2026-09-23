import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    rooms: [],
    selectedRoom: null,

    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    loading: false,
    error: null,
}

const roomSlice = createSlice({
    name: 'rooms',

    initialState,

    reducers: {

        setRooms: (state, action) => {
            const { rooms = [], pagination = {} } = action.payload

            state.rooms = rooms
            state.pagination = { ...state.pagination, ...pagination }
            state.error = null
        },

        addRoom: (state, action) => {
            state.rooms.push(action.payload)
        },

        updateRoom: (state, action) => {
            const updatedRoom = action.payload

            const roomIndex = state.rooms.findIndex(
                (room) => room.room_id === updatedRoom.room_id
            )

            if (roomIndex !== -1) {
                state.rooms[roomIndex] = updatedRoom
            }

            if (state.selectedRoom?.room_id === updatedRoom.room_id) {
                state.selectedRoom = updatedRoom
            }
        },

        removeRoom: (state, action) => {
            state.rooms = state.rooms.filter(
                (room) => room.room_id !== action.payload
            )

            if (state.selectedRoom?.room_id === action.payload) {
                state.selectedRoom = null
            }
        },

        setSelectedRoom: (state, action) => {
            state.selectedRoom = action.payload
        },

        setRoomLoading: (state, action) => {
            state.loading = action.payload
        },

        setRoomError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },

        clearRooms: () => initialState,
    },
})

export const {
    setRooms,
    addRoom,
    updateRoom,
    removeRoom,
    setSelectedRoom,
    setRoomLoading,
    setRoomError,
    clearRooms,
} = roomSlice.actions

export default roomSlice.reducer
