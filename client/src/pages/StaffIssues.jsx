import React, { useEffect, useState } from 'react'
import { createIssue, getMyIssues } from '../axiosRoutes/issueRoutes'
import { getMyDuties } from '../axiosRoutes/staffDutyRoutes'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'
const labelClass = 'block text-sm font-medium text-ink-700'

const ISSUE_TYPES = [
    { value: 'STUDENT_PROBLEM', label: 'Student problem' },
    { value: 'QUESTION_PAPER', label: 'Question paper issue' },
    { value: 'INFRASTRUCTURE', label: 'Infrastructure problem' },
    { value: 'INVIGILATOR', label: 'Invigilator issue' },
    { value: 'OTHER', label: 'Other' },
]

const initialForm = { issue_type: 'STUDENT_PROBLEM', duty_id: '', description: '' }

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const StaffIssues = () => {
    const [duties, setDuties] = useState([])
    const [formData, setFormData] = useState(initialForm)
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)

    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchIssues = async () => {
        try {
            setLoading(true)
            const response = await getMyIssues()
            setIssues(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load your issues')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchDuties = async () => {
            try {
                const response = await getMyDuties({ scope: 'all' })
                setDuties(response.data.data || response.data || [])
            } catch (requestError) {
                console.error(requestError)
            }
        }
        fetchDuties()
        fetchIssues()
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            setSubmitting(true)
            setError(null)
            setSuccess(false)

            const response = await createIssue(formData)
            const newIssue = response.data.data || response.data
            setIssues((current) => [newIssue, ...current])
            setFormData(initialForm)
            setSuccess(true)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to report issue')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader icon="issue" title="Report an Issue" description="Flag a problem during an exam for the exam committee." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}
            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    Issue reported. The exam committee has been notified.
                </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="issue_type" className={labelClass}>Issue type</label>
                        <select id="issue_type" name="issue_type" value={formData.issue_type} onChange={handleChange} className={inputClass}>
                            {ISSUE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="duty_id" className={labelClass}>Related duty (optional)</label>
                        <select id="duty_id" name="duty_id" value={formData.duty_id} onChange={handleChange} className={inputClass}>
                            <option value="">Not tied to a specific duty</option>
                            {duties.map((duty) => (
                                <option key={duty.duty_id} value={duty.duty_id}>
                                    {duty.subject_name} — {duty.room_number}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <label htmlFor="description" className={labelClass}>Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe what happened…"
                            className={`${inputClass} resize-none`}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="mt-5 rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:opacity-60"
                >
                    {submitting ? 'Submitting…' : 'Submit report'}
                </button>
            </form>

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="border-b border-ink-100 px-5 py-4">
                    <h3 className="font-display text-base font-semibold text-ink-900">Your reported issues</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Description</th>
                                <th className="px-4 py-3 font-medium">Reported</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-ink-400">Loading…</td></tr>
                            ) : issues.length > 0 ? (
                                issues.map((issue) => (
                                    <tr key={issue.issue_id} className="border-b border-ink-50 last:border-0">
                                        <td className="px-4 py-3 text-ink-700">
                                            {ISSUE_TYPES.find((t) => t.value === issue.issue_type)?.label || issue.issue_type}
                                        </td>
                                        <td className="px-4 py-3 max-w-xs truncate text-ink-500">{issue.description}</td>
                                        <td className="px-4 py-3 text-ink-500">{formatDateTime(issue.created_at)}</td>
                                        <td className="px-4 py-3"><StatusPill label={issue.status || 'OPEN'} /></td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="px-4 py-8 text-center text-sm text-ink-400">You haven't reported any issues.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default StaffIssues
