import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  staff: [],
  selectedStaff: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
}

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setStaff: (state, action) => {
      const { staff = [], pagination = {} } = action.payload

      state.staff = staff
      state.pagination = {
        ...state.pagination,
        ...pagination,
      }
      state.error = null
    },

    addStaff: (state, action) => {
      state.staff.push(action.payload)
    },

    updateStaff: (state, action) => {
      const updatedStaff = action.payload

      const staffIndex = state.staff.findIndex(
        (staff) => staff.employee_id === updatedStaff.employee_id,
      )

      if (staffIndex !== -1) {
        state.staff[staffIndex] = updatedStaff
      }

      if (state.selectedStaff?.employee_id === updatedStaff.employee_id) {
        state.selectedStaff = updatedStaff
      }
    },

    removeStaff: (state, action) => {
      state.staff = state.staff.filter(
        (staff) => staff.employee_id !== action.payload,
      )

      if (state.selectedStaff?.employee_id === action.payload) {
        state.selectedStaff = null
      }
    },

    setSelectedStaff: (state, action) => {
      state.selectedStaff = action.payload
    },

    setStaffLoading: (state, action) => {
      state.loading = action.payload
    },

    setStaffError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },

    clearStaff: () => initialState,
  },
})

export const {
  setStaff,
  addStaff,
  updateStaff,
  removeStaff,
  setSelectedStaff,
  setStaffLoading,
  setStaffError,
  clearStaff,
} = staffSlice.actions

export default staffSlice.reducer