import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    subjects: [],
    selectedSubject: null,

    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    loading: false,
    error: null,
}

const subjectSlice = createSlice({
    name: 'subjects',

    initialState,

    reducers: {

        setSubjects: (state, action) => {
            const { subjects = [], pagination = {} } = action.payload

            state.subjects = subjects
            state.pagination = { ...state.pagination, ...pagination }
            state.error = null
        },

        addSubject: (state, action) => {
            state.subjects.push(action.payload)
        },

        updateSubject: (state, action) => {
            const updatedSubject = action.payload

            const subjectIndex = state.subjects.findIndex(
                (subject) => subject.subject_id === updatedSubject.subject_id
            )

            if (subjectIndex !== -1) {
                state.subjects[subjectIndex] = updatedSubject
            }

            if (state.selectedSubject?.subject_id === updatedSubject.subject_id) {
                state.selectedSubject = updatedSubject
            }
        },

        removeSubject: (state, action) => {
            state.subjects = state.subjects.filter(
                (subject) => subject.subject_id !== action.payload
            )

            if (state.selectedSubject?.subject_id === action.payload) {
                state.selectedSubject = null
            }
        },

        setSelectedSubject: (state, action) => {
            state.selectedSubject = action.payload
        },

        setSubjectLoading: (state, action) => {
            state.loading = action.payload
        },

        setSubjectError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },

        clearSubjects: () => initialState,
    },
})

export const {
    setSubjects,
    addSubject,
    updateSubject,
    removeSubject,
    setSelectedSubject,
    setSubjectLoading,
    setSubjectError,
    clearSubjects,
} = subjectSlice.actions

export default subjectSlice.reducer
