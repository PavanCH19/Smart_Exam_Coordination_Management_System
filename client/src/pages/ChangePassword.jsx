import React, { useState } from 'react'
import { changePassword } from '../axiosRoutes/authRoutes'
import PageHeader from '../components/ui/PageHeader'

const inputClass =
    'mt-1.5 block w-full max-w-sm rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const initialForm = {
    current_password: '',
    new_password: '',
    confirm_password: '',
}

const ChangePassword = () => {
    const [formData, setFormData] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setError(null)
        setSuccess(false)

        if (formData.new_password !== formData.confirm_password) {
            setError('New password and confirmation do not match')
            return
        }

        if (formData.new_password.length < 8) {
            setError('New password must be at least 8 characters')
            return
        }

        try {
            setLoading(true)
            await changePassword({
                current_password: formData.current_password,
                new_password: formData.new_password,
            })
            setSuccess(true)
            setFormData(initialForm)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-lg space-y-6">
            <PageHeader
                icon="lock"
                title="Change Password"
                description="Update the password used to sign in to your account."
            />

            <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-card">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="current_password" className={labelClass}>Current password</label>
                        <input
                            id="current_password"
                            name="current_password"
                            type="password"
                            value={formData.current_password}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>

                    <div>
                        <label htmlFor="new_password" className={labelClass}>New password</label>
                        <input
                            id="new_password"
                            name="new_password"
                            type="password"
                            value={formData.new_password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            className={inputClass}
                        />
                        <p className="mt-1 text-xs text-ink-400">At least 8 characters.</p>
                    </div>

                    <div>
                        <label htmlFor="confirm_password" className={labelClass}>Confirm new password</label>
                        <input
                            id="confirm_password"
                            name="confirm_password"
                            type="password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            required
                            className={inputClass}
                        />
                    </div>
                </div>

                {error && (
                    <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-700">
                        Password updated successfully.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Updating…' : 'Update password'}
                </button>
            </form>
        </div>
    )
}

export default ChangePassword
