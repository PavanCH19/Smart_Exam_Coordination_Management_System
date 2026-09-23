import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    courses: [],
    selectedCourse: null,

    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    loading: false,
    error: null,
}

const courseSlice = createSlice({
    name: 'courses',

    initialState,

    reducers: {

        // Set courses
        setCourses: (state, action) => {

            const {
                courses = [],
                pagination = {},
            } = action.payload

            state.courses = courses

            state.pagination = {
                ...state.pagination,
                ...pagination,
            }

            state.error = null
        },


        // Add course
        addCourse: (state, action) => {

            state.courses.push(
                action.payload,
            )
        },


        // Update course
        updateCourse: (state, action) => {

            const updatedCourse =
                action.payload

            const courseIndex =
                state.courses.findIndex(
                    (course) =>
                        course.course_id ===
                        updatedCourse.course_id,
                )


            if (courseIndex !== -1) {

                state.courses[
                    courseIndex
                ] = updatedCourse
            }


            if (
                state.selectedCourse?.course_id ===
                updatedCourse.course_id
            ) {

                state.selectedCourse =
                    updatedCourse
            }
        },


        // Remove course
        removeCourse: (state, action) => {

            state.courses =
                state.courses.filter(
                    (course) =>
                        course.course_id !==
                        action.payload,
                )


            if (
                state.selectedCourse?.course_id ===
                action.payload
            ) {

                state.selectedCourse = null
            }
        },


        // Select course
        setSelectedCourse: (
            state,
            action,
        ) => {
            state.selectedCourse =
                action.payload
        },


        // Loading
        setCourseLoading: (
            state,
            action,
        ) => {

            state.loading = action.payload
        },


        // Error
        setCourseError: (
            state,
            action,
        ) => {

            state.error = action.payload
            state.loading = false
        },


        // Clear
        clearCourses: () =>
            initialState,
    },
})

export const {
    setCourses,
    addCourse,
    updateCourse,
    removeCourse,
    setSelectedCourse,
    setCourseLoading,
    setCourseError,
    clearCourses,
} = courseSlice.actions

export default courseSlice.reducer
