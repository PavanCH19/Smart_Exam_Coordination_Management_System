import React, { useEffect, useState } from 'react'
import { getMyNotifications, markNotificationRead } from '../../axiosRoutes/notificationRoutes'
import StatusPill from './StatusPill'
import PageHeader from './PageHeader'

const formatDateTime = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const NotificationInbox = () => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getMyNotifications()
                setNotifications(response.data.data || response.data || [])
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Failed to load notifications')
            } finally {
                setLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    const handleMarkRead = async (notification) => {
        try {
            await markNotificationRead(notification.notification_id)
            setNotifications((current) =>
                current.map((item) =>
                    item.notification_id === notification.notification_id ? { ...item, read: true } : item
                )
            )
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to update notification')
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader icon="notification" title="Notifications" description="Announcements and reminders for you." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : notifications.length === 0 ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    You're all caught up — no notifications yet.
                </div>
            ) : (
                <div className="space-y-2.5">
                    {notifications.map((notification) => (
                        <div
                            key={notification.notification_id}
                            className={`flex items-start justify-between gap-4 rounded-2xl border p-4 shadow-card transition ${
                                notification.read ? 'border-ink-100 bg-white' : 'border-brass-200 bg-brass-50/40'
                            }`}
                        >
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-ink-900">{notification.title}</p>
                                    <StatusPill
                                        label={notification.type || 'INFO'}
                                        tone={notification.type === 'ALERT' ? 'negative' : notification.type === 'REMINDER' ? 'warning' : 'info'}
                                    />
                                </div>
                                <p className="mt-1 text-sm text-ink-600">{notification.message}</p>
                                <p className="mt-1.5 text-xs text-ink-400">
                                    {formatDateTime(notification.sent_at || notification.created_at)}
                                </p>
                            </div>

                            {!notification.read && (
                                <button
                                    type="button"
                                    onClick={() => handleMarkRead(notification)}
                                    className="shrink-0 rounded-md bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:bg-ink-200"
                                >
                                    Mark read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default NotificationInbox
