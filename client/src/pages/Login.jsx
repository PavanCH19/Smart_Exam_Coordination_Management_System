import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardByRole, login } from '../axiosRoutes/authRoutes'
import {
  setAuthError,
  setAuthLoading,
  setCredentials,
} from '../redux/slices/authSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(setAuthLoading(true))

    try {
      const response = await login(formData)
      const loginData = response.data?.data ?? response.data
      const role = loginData.user?.role?.toUpperCase()
      const dashboardPath = dashboardByRole[role]

      if (!dashboardPath) {
        throw new Error('User role is not supported')
      }

      dispatch(setCredentials({
        user: loginData.user,
        accessToken: loginData.accessToken,
      }))
      navigate(dashboardPath)
    } catch (requestError) {
      const message = requestError.response?.data?.message ?? 'Login failed'
      dispatch(setAuthError(message))
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brass-500 font-display text-lg font-semibold text-white">
              E
            </span>
          </Link>
          <h1 className="mt-4 font-display text-2xl font-semibold text-paper">
            Sign in to your portal
          </h1>
          <p className="mt-1 text-sm text-ink-400">
            Admin, staff and student accounts all sign in here.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-ink-800 bg-ink-900 p-6 shadow-card sm:p-8"
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-200">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@college.edu"
                className="mt-1.5 block w-full rounded-lg border border-ink-700 bg-ink-950 px-3.5 py-2.5 text-sm text-paper placeholder:text-ink-500 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-200">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-lg border border-ink-700 bg-ink-950 px-3.5 py-2.5 text-sm text-paper placeholder:text-ink-500 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-rose-500/10 px-3.5 py-2.5 text-sm text-rose-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center rounded-lg bg-brass-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/" className="text-brass-300 hover:text-brass-200">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
