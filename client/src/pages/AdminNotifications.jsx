import React, { useEffect, useState } from 'react'
import {
    getNotifications,
    sendNotification,
    deleteNotification,
} from '../axiosRoutes/notificationRoutes'
import Modal from '../components/ui/Modal'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'
const labelClass = 'block text-sm font-medium text-ink-700'

const initialForm = {
    title: '',
    message: '',
    audience: 'ALL',
    type: 'INFO',
}

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [modalOpen, setModalOpen] = useState(false)
    const [formData, setFormData] = useState(initialForm)
    const [sending, setSending] = useState(false)

    const fetchNotifications = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getNotifications()
            setNotifications(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load notifications')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target
        setFormData((current) => ({ ...current, [name]: value }))
    }

    const handleSend = async (event) => {
        event.preventDefault()

        try {
            setSending(true)
            const response = await sendNotification(formData)
            const newNotification = response.data.data || response.data
            setNotifications((current) => [newNotification, ...current])
            setFormData(initialForm)
            setModalOpen(false)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to send notification')
        } finally {
            setSending(false)
        }
    }

    const handleDelete = async (notification) => {
        const confirmDelete = window.confirm('Retract this notification?')
        if (!confirmDelete) return

        try {
            await deleteNotification(notification.notification_id)
            setNotifications((current) =>
                current.filter((item) => item.notification_id !== notification.notification_id)
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to delete notification')
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon="notification"
                title="Notifications"
                description="Send announcements and reminders to students or staff."
                actions={
                    <button
                        type="button"
                        onClick={() => setModalOpen(true)}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Send notification
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Audience</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">Sent</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">Loading…</td></tr>
                            ) : notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <tr key={notification.notification_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                        <td className="px-4 py-3 font-medium text-ink-800">{notification.title}</td>
                                        <td className="px-4 py-3 text-ink-500">{notification.audience}</td>
                                        <td className="px-4 py-3">
                                            <StatusPill
                                                label={notification.type || 'INFO'}
                                                tone={notification.type === 'ALERT' ? 'negative' : notification.type === 'REMINDER' ? 'warning' : 'info'}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-ink-500">{formatDateTime(notification.sent_at || notification.created_at)}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(notification)}
                                                className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
                                            >
                                                Retract
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">No notifications sent yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Send notification">
                <form onSubmit={handleSend}>
                    <div className="grid gap-4">
                        <div>
                            <label htmlFor="title" className={labelClass}>Title</label>
                            <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required className={inputClass} />
                        </div>

                        <div>
                            <label htmlFor="message" className={labelClass}>Message</label>
                            <textarea id="message" name="message" rows="4" value={formData.message} onChange={handleChange} required className={`${inputClass} resize-none`} />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="audience" className={labelClass}>Audience</label>
                                <select id="audience" name="audience" value={formData.audience} onChange={handleChange} className={inputClass}>
                                    <option value="ALL">Everyone</option>
                                    <option value="STUDENTS">Students</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="type" className={labelClass}>Type</label>
                                <select id="type" name="type" value={formData.type} onChange={handleChange} className={inputClass}>
                                    <option value="INFO">Information</option>
                                    <option value="REMINDER">Reminder</option>
                                    <option value="ALERT">Alert</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 hover:bg-ink-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={sending} className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-800 disabled:opacity-60">
                            {sending ? 'Sending…' : 'Send'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default AdminNotifications
