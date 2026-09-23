import React, { useEffect, useState } from 'react'
import { getMyAdmitCard, downloadMyAdmitCard } from '../axiosRoutes/admitCardRoutes'
import StatusPill from '../components/ui/StatusPill'
import PageHeader from '../components/ui/PageHeader'

const StudentAdmitCard = () => {
    const [card, setCard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [downloading, setDownloading] = useState(false)

    useEffect(() => {
        const fetchCard = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await getMyAdmitCard()
                setCard(response.data.data || response.data || null)
            } catch (requestError) {
                setError(requestError.response?.data?.message || 'Failed to load admit card status')
            } finally {
                setLoading(false)
            }
        }
        fetchCard()
    }, [])

    const isReady = card?.admit_card_status === 'READY' || card?.admit_card_status === 'GENERATED'

    const handleDownload = async () => {
        try {
            setDownloading(true)
            const response = await downloadMyAdmitCard()

            const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `${card?.usn || 'admit-card'}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Failed to download admit card')
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader icon="admitCard" title="Admit Card" description="Your admit card status and download." />

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-400">
                    Loading…
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-ink-100 bg-ink-950 p-6 text-paper shadow-card sm:p-8">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-300">
                        Examination Admit Card
                    </p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="font-display text-2xl font-semibold">{card?.name || '—'}</p>
                            <p className="mt-1 text-sm text-ink-300">
                                {card?.usn} · {card?.department} · Semester {card?.semester}
                            </p>
                        </div>
                        <StatusPill label={isReady ? 'Ready' : 'Pending'} tone={isReady ? 'positive' : 'warning'} />
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-ink-800 pt-5">
                        <p className="text-xs text-ink-400">
                            {isReady
                                ? 'Your admit card is ready to download. Carry a printed or digital copy on exam day.'
                                : 'Your admit card has not been generated yet — check back closer to your exam dates, or contact the exam cell.'}
                        </p>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={!isReady || downloading}
                            className="shrink-0 rounded-lg bg-brass-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brass-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {downloading ? 'Downloading…' : '⬇ Download PDF'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default StudentAdmitCard
