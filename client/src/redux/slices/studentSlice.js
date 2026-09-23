import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  students: [],
  selectedStudent: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
}

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents: (state, action) => {
      const { students = [], pagination = {} } = action.payload

      state.students = students
      state.pagination = { ...state.pagination, ...pagination }
      state.error = null
    },
    addStudent: (state, action) => {
      state.students.push(action.payload)
    },
    updateStudent: (state, action) => {
      const updatedStudent = action.payload
      const studentIndex = state.students.findIndex(
        (student) => student.usn === updatedStudent.usn,
      )

      if (studentIndex !== -1) {
        state.students[studentIndex] = updatedStudent
      }

      if (state.selectedStudent?.usn === updatedStudent.usn) {
        state.selectedStudent = updatedStudent
      }
    },
    removeStudent: (state, action) => {
      state.students = state.students.filter((student) => student.usn !== action.payload)

      if (state.selectedStudent?.usn === action.payload) {
        state.selectedStudent = null
      }
    },
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload
    },
    setStudentLoading: (state, action) => {
      state.loading = action.payload
    },
    setStudentError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearStudents: () => initialState,
  },
})

export const {
  setStudents,
  addStudent,
  updateStudent,
  removeStudent,
  setSelectedStudent,
  setStudentLoading,
  setStudentError,
  clearStudents,
} = studentSlice.actions
export default studentSlice.reducer