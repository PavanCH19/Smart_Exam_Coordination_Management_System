import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    departments: [],
    selectedDepartment: null,

    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },

    loading: false,
    error: null,
}

const departmentSlice = createSlice({
    name: 'departments',

    initialState,

    reducers: {

        // Set departments
        setDepartments: (state, action) => {

            const {
                departments = [],
                pagination = {},
            } = action.payload

            state.departments = departments

            state.pagination = {
                ...state.pagination,
                ...pagination,
            }

            state.error = null
        },


        // Add department
        addDepartment: (state, action) => {

            state.departments.push(
                action.payload,
            )
        },


        // Update department
        updateDepartment: (state, action) => {

            const updatedDepartment =
                action.payload

            const departmentIndex =
                state.departments.findIndex(
                    (department) =>
                        department.department_id ===
                        updatedDepartment.department_id,
                )


            if (departmentIndex !== -1) {

                state.departments[
                    departmentIndex
                ] = updatedDepartment
            }


            if (
                state.selectedDepartment?.department_id ===
                updatedDepartment.department_id
            ) {

                state.selectedDepartment =
                    updatedDepartment
            }
        },


        // Remove department
        removeDepartment: (state, action) => {

            state.departments =
                state.departments.filter(
                    (department) =>
                        department.department_id !==
                        action.payload,
                )


            if (
                state.selectedDepartment?.department_id ===
                action.payload
            ) {

                state.selectedDepartment = null
            }
        },


        // Select department
        setSelectedDepartment: (
            state,
            action,
        ) => {
            state.selectedDepartment =
                action.payload
        },


        // Loading
        setDepartmentLoading: (
            state,
            action,
        ) => {

            state.loading = action.payload
        },


        // Error
        setDepartmentError: (
            state,
            action,
        ) => {

            state.error = action.payload
            state.loading = false
        },


        // Clear
        clearDepartments: () =>
            initialState,
    },
})

export const {
    setDepartments,
    addDepartment,
    updateDepartment,
    removeDepartment,
    setSelectedDepartment,
    setDepartmentLoading,
    setDepartmentError,
    clearDepartments,
} = departmentSlice.actions

export default departmentSlice.reducer