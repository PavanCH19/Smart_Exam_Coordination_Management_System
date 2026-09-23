import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import studentReducer from './slices/studentSlice'
import staffReducer from './slices/staffSlice'
import departmentReducer from './slices/departmentSlice'
import courseReducer from './slices/courseSlice'
import subjectReducer from './slices/subjectSlice'
import roomReducer from './slices/roomSlice'
import examReducer from './slices/examSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    students: studentReducer,
    staff: staffReducer,
    departments: departmentReducer,
    courses: courseReducer,
    subjects: subjectReducer,
    rooms: roomReducer,
    exams: examReducer
  },
})