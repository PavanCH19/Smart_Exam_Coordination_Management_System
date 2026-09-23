import React from 'react'

// A single dashboard metric: label, big number, optional hint and icon glyph.
const StatCard = ({ label, value, hint, icon, tone = 'ink' }) => {
    const toneStyles = {
        ink: 'bg-ink-900 text-paper',
        brass: 'bg-brass-500 text-white',
        paper: 'bg-white text-ink-900 ring-1 ring-ink-100',
    }

    return (
        <div
            className={`flex flex-col justify-between rounded-2xl p-5 shadow-card ${toneStyles[tone]} animate-fade-in-up`}
        >
            <div className="flex items-start justify-between gap-3">
                <span
                    className={`text-xs font-medium uppercase tracking-wide ${
                        tone === 'paper' ? 'text-ink-500' : 'text-white/70'
                    }`}
                >
                    {label}
                </span>
                {icon && (
                    <span
                        className={`text-lg leading-none ${
                            tone === 'paper' ? 'text-brass-500' : 'text-brass-200'
                        }`}
                        aria-hidden="true"
                    >
                        {icon}
                    </span>
                )}
            </div>

            <div className="mt-4 font-display text-3xl font-semibold">
                {value}
            </div>

            {hint && (
                <p
                    className={`mt-1 text-xs ${
                        tone === 'paper' ? 'text-ink-400' : 'text-white/60'
                    }`}
                >
                    {hint}
                </p>
            )}
        </div>
    )
}

export default StatCard
