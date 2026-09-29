import { createSlice } from '@reduxjs/toolkit'

export const getTokenExpiration = (token) => {
  try {
    const payloadSegment = token?.split('.')[1]
    if (!payloadSegment) return null

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(base64.length + ((4 - base64.length % 4) % 4), '=')
    const payloadBytes = Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0))
    const expiration = JSON.parse(new TextDecoder().decode(payloadBytes)).exp

    return typeof expiration === 'number' ? expiration : null
  } catch {
    return null
  }
}

export const isAccessTokenValid = (token) => {
  const expiration = getTokenExpiration(token)
  return expiration !== null && expiration * 1000 > Date.now()
}

const storedToken = localStorage.getItem('accessToken')
const storedUser = localStorage.getItem('authUser')
const hasValidToken = isAccessTokenValid(storedToken)

if (!hasValidToken) {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('authUser')
}

const initialState = {
  user: hasValidToken && storedUser ? JSON.parse(storedUser) : null,
  accessToken: hasValidToken ? storedToken : null,
  isAuthenticated: hasValidToken,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload
      const tokenIsValid = isAccessTokenValid(accessToken)

      state.user = tokenIsValid ? user ?? null : null
      state.accessToken = tokenIsValid ? accessToken : null
      state.isAuthenticated = tokenIsValid
      state.error = null

      if (tokenIsValid) {
        localStorage.setItem('accessToken', accessToken)
        if (user) {
          localStorage.setItem('authUser', JSON.stringify(user))
        }
      } else {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('authUser')
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