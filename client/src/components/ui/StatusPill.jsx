import React from 'react'

// Small semantic colour map so every screen renders status words the same way.
const TONE_STYLES = {
    positive: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    negative: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
    neutral: 'bg-ink-100 text-ink-600 ring-1 ring-inset ring-ink-200',
    info: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
    brass: 'bg-brass-50 text-brass-700 ring-1 ring-inset ring-brass-200',
}

const STATUS_TONE_LOOKUP = {
    AVAILABLE: 'positive',
    UNAVAILABLE: 'negative',
    MAINTENANCE: 'warning',
    ACTIVE: 'positive',
    INACTIVE: 'negative',
    PRESENT: 'positive',
    ABSENT: 'negative',
    OPEN: 'warning',
    RESOLVED: 'positive',
    'IN PROGRESS': 'info',
    'ISSUE REPORTED': 'negative',
    'STAFF REPLACEMENT REQUIRED': 'warning',
    PENDING: 'warning',
}

const StatusPill = ({ label, tone }) => {
    const resolvedTone =
        tone || STATUS_TONE_LOOKUP[String(label).toUpperCase()] || 'neutral'

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TONE_STYLES[resolvedTone]}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {String(label).toLowerCase()}
        </span>
    )
}

export default StatusPill
