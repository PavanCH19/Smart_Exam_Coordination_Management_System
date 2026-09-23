import { createSlice } from '@reduxjs/toolkit'

const storedToken = localStorage.getItem('accessToken')
const storedUser = localStorage.getItem('authUser')

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: storedToken,
  isAuthenticated: Boolean(storedToken),
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload

      state.user = user ?? null
      state.accessToken = accessToken
      state.isAuthenticated = Boolean(accessToken)
      state.error = null

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken)
      }
      if (user) {
        localStorage.setItem('authUser', JSON.stringify(user))
      }
    },
    setAuthLoading: (state, action) => {
      state.loading = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('authUser')
    },
  },
})

export const { setCredentials, setAuthLoading, setAuthError, logout } = authSlice.actions
export default authSlice.reducer