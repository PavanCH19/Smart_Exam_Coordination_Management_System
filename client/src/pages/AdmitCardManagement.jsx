import React, { useEffect, useState } from 'react'
import { getDepartments } from '../axiosRoutes/departmentRoutes'
import {
    getAdmitCards,
    generateAdmitCards,
    downloadAdmitCard,
} from '../axiosRoutes/admitCardRoutes'
import StatCard from '../components/ui/StatCard'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const selectClass =
    'rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-700 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

const AdmitCardManagement = () => {
    const [departments, setDepartments] = useState([])
    const [filters, setFilters] = useState({ department: '', semester: '' })

    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const [generating, setGenerating] = useState(false)
    const [downloadingId, setDownloadingId] = useState(null)

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await getDepartments({ limit: 100 })
                setDepartments(response.data.data || response.data || [])
            } catch (requestError) {
                console.error(requestError)
            }
        }
        fetchDepartments()
    }, [])

    const fetchCards = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await getAdmitCards({
                ...filters,
                ...(filters.semester ? { semester: Number(filters.semester) } : {}),
            })
            setCards(response.data.data || response.data || [])
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to load admit card statuses')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCards()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.department, filters.semester])

    const handleFilterChange = (event) => {
        setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
    }

    const handleGenerateBulk = async () => {
        try {
            setGenerating(true)
            setError(null)
            await generateAdmitCards({
                ...filters,
                ...(filters.semester ? { semester: Number(filters.semester) } : {}),
            })
            await fetchCards()
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    'Bulk generation failed. Check that the /admit-cards/generate endpoint is implemented.'
            )
        } finally {
            setGenerating(false)
        }
    }

    const handleDownload = async (student) => {
        try {
            setDownloadingId(student.student_id)
            const response = await downloadAdmitCard(student.student_id)

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `${student.usn || student.student_id}_admit_card.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    `Failed to download admit card for ${student.name}`
            )
        } finally {
            setDownloadingId(null)
        }
    }

    const readyCount = cards.filter((c) => c.admit_card_status === 'READY' || c.admit_card_status === 'GENERATED').length
    const pendingCount = cards.length - readyCount

    return (
        <div className="space-y-6">
            <PageHeader
                icon="admitCard"
                title="Admit Cards"
                description="Generate downloadable admit cards before room allocation. Venue and seat details are added later when available."
                actions={
                    <button
                        type="button"
                        onClick={handleGenerateBulk}
                        disabled={generating}
                        className="rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:opacity-50"
                    >
                        {generating ? 'Generating…' : '⚡ Generate for filtered students'}
                    </button>
                }
            />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                Room allocation is optional for generation. Students can receive their admit card now; room and seat fields will show as TBA until seating is assigned.
            </div>

            <div className="grid grid-cols-3 gap-4">
                <StatCard label="Total students" value={loading ? '—' : cards.length} tone="ink" icon="🎓" />
                <StatCard label="Admit cards ready" value={loading ? '—' : readyCount} tone="brass" icon="🪪" />
                <StatCard label="Pending" value={loading ? '—' : pendingCount} tone="paper" icon="⏳" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-ink-100 bg-white p-4">
                <select name="department" value={filters.department} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All departments</option>
                    {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.name}>{dept.name}</option>
                    ))}
                </select>
                <select name="semester" value={filters.semester} onChange={handleFilterChange} className={selectClass}>
                    <option value="">All semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>{sem}</option>
                    ))}
                </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                                <th className="px-4 py-3 font-medium">USN</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Department</th>
                                <th className="px-4 py-3 font-medium">Semester</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Generated</th>
                                <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-sm text-ink-400">
                                        Loading…
                                    </td>
                                </tr>
                            ) : cards.length > 0 ? (
                                cards.map((student) => {
                                    const isReady =
                                        student.admit_card_status === 'READY' ||
                                        student.admit_card_status === 'GENERATED'

                                    return (
                                        <tr key={student.student_id} className="border-b border-ink-50 last:border-0 hover:bg-brass-50/40">
                                            <td className="px-4 py-3 font-mono text-xs text-ink-600">{student.usn}</td>
                                            <td className="px-4 py-3 font-medium text-ink-800">{student.name}</td>
                                            <td className="px-4 py-3 text-ink-500">{student.department}</td>
                                            <td className="px-4 py-3 text-ink-500">{student.semester}</td>
                                            <td className="px-4 py-3">
                                                <StatusPill
                                                    label={isReady ? 'Ready' : 'Pending'}
                                                    tone={isReady ? 'positive' : 'warning'}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-ink-500">{formatDate(student.generated_at)}</td>
                                            <td className="px-4 py-3">
                                                <button
                                                    type="button"
                                                    disabled={!isReady || downloadingId === student.student_id}
                                                    onClick={() => handleDownload(student)}
                                                    className="rounded-md bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700 transition hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    {downloadingId === student.student_id ? 'Downloading…' : 'Download'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-10 text-center text-sm text-ink-400">
                                        No students found for this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AdmitCardManagement
