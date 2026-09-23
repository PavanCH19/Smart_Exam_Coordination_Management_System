import React from 'react'

// Used for department distribution, hall utilization and staff workload bars.
const ProgressBar = ({ label, value, max = 100, suffix = '', tone = 'brass' }) => {
    const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

    const barTone = {
        brass: 'bg-brass-500',
        ink: 'bg-ink-700',
        emerald: 'bg-emerald-500',
        rose: 'bg-rose-500',
    }[tone]

    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink-700">{label}</span>
                <span className="shrink-0 font-mono text-xs text-ink-400">
                    {value}
                    {suffix}
                </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
                <div
                    className={`h-full rounded-full ${barTone} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}

export default ProgressBar
