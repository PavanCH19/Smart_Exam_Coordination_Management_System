import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    exams: [],
    selectedExam: null,

    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    loading: false,
    error: null,
}

const examSlice = createSlice({
    name: 'exams',

    initialState,

    reducers: {

        setExams: (state, action) => {
            const { exams = [], pagination = {} } = action.payload

            state.exams = exams
            state.pagination = { ...state.pagination, ...pagination }
            state.error = null
        },

        addExam: (state, action) => {
            state.exams.push(action.payload)
        },

        updateExam: (state, action) => {
            const updatedExam = action.payload

            const examIndex = state.exams.findIndex(
                (exam) => exam.exam_id === updatedExam.exam_id
            )

            if (examIndex !== -1) {
                state.exams[examIndex] = updatedExam
            }

            if (state.selectedExam?.exam_id === updatedExam.exam_id) {
                state.selectedExam = updatedExam
            }
        },

        removeExam: (state, action) => {
            state.exams = state.exams.filter(
                (exam) => exam.exam_id !== action.payload
            )

            if (state.selectedExam?.exam_id === action.payload) {
                state.selectedExam = null
            }
        },

        setSelectedExam: (state, action) => {
            state.selectedExam = action.payload
        },

        setExamLoading: (state, action) => {
            state.loading = action.payload
        },

        setExamError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },

        clearExams: () => initialState,
    },
})

export const {
    setExams,
    addExam,
    updateExam,
    removeExam,
    setSelectedExam,
    setExamLoading,
    setExamError,
    clearExams,
} = examSlice.actions

export default examSlice.reducer
