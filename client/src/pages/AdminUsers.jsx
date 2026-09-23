import React, { useEffect, useState } from 'react'
import UserForm from '../components/UserForm'
import Modal from '../components/ui/Modal'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'
import {
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
} from '../axiosRoutes/userRoutes'

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'
const actionBtn = 'rounded-md px-2.5 py-1 text-xs font-medium transition'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [selectedUser, setSelectedUser] = useState(null)
    const [modalOpen, setModalOpen] = useState(false)

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await getUsers({ role: roleFilter || undefined })
            setUsers(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleFilter])

    const handleOpenAdd = () => {
        setSelectedUser(null)
        setModalOpen(true)
    }

    const handleEdit = (user) => {
        setSelectedUser(user)
        setModalOpen(true)
    }

    const handleCancel = () => {
        setSelectedUser(null)
        setModalOpen(false)
    }

    const handleSubmit = async (data) => {
        try {
            if (selectedUser) {
                const response = await updateUser(selectedUser.user_id, data)
                const updated = response.data.data || response.data
                setUsers((current) => current.map((u) => (u.user_id === selectedUser.user_id ? updated : u)))
            } else {
                const response = await addUser(data)
                const created = response.data.data || response.data
                setUsers((current) => [...current, created])
            }
            setModalOpen(false)
            setSelectedUser(null)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'User operation failed')
        }
    }

    const handleDelete = async (user) => {
        const confirmDelete = window.confirm(`Deactivate access for ${user.name}?`)
        if (!confirmDelete) return

        try {
            await deleteUser(user.user_id)
            setUsers((current) => current.filter((u) => u.user_id !== user.user_id))
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to delete user')
        }
    }

    const handleResetPassword = async (user) => {
        const confirmReset = window.confirm(`Send a password reset for ${user.name}?`)
        if (!confirmReset) return

        try {
            await resetUserPassword(user.user_id)
            window.alert('Password reset triggered.')
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to reset password')
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                icon="users"
                title="User Accounts"
                description="Login access for admin, staff and student accounts."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenAdd}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600"
                    >
                        + Add user
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className={selectClass}>
                    <option value="">All roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                    <option value="STUDENT">Student</option>
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">Loading…</td></tr>
                            ) : users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.user_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                        <td className="px-4 py-3 font-medium text-ink-800">{user.name}</td>
                                        <td className="px-4 py-3 text-ink-500">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-md bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-700">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill label={user.status || 'ACTIVE'} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-1.5">
                                                <button type="button" onClick={() => handleEdit(user)} className={`${actionBtn} bg-ink-100 text-ink-700 hover:bg-ink-200`}>Edit</button>
                                                <button type="button" onClick={() => handleResetPassword(user)} className={`${actionBtn} bg-sky-50 text-sky-700 hover:bg-sky-100`}>Reset password</button>
                                                <button type="button" onClick={() => handleDelete(user)} className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}>Deactivate</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-ink-400">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                open={modalOpen}
                onClose={handleCancel}
                title={selectedUser ? 'Update user' : 'Add user'}
                description={selectedUser ? `Editing ${selectedUser.name}` : 'Create a new login for a staff, student or admin account'}
            >
                <UserForm user={selectedUser} onSubmit={handleSubmit} onCancel={handleCancel} />
            </Modal>
        </div>
    )
}

export default AdminUsers
