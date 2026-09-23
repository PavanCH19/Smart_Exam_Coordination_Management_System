import React from 'react'
import Icon from './Icon'

// Every management screen renders the same header shape: an icon badge,
// title + one-line description on the left, primary actions on the right.
// Centralising it here is what turns 20 separate "CRUD screens" into one
// consistent product surface.
const PageHeader = ({ icon, title, description, actions, meta }) => (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
            {icon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-brass-300">
                    <Icon name={icon} className="h-5 w-5" />
                </span>
            )}
            <div>
                <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
                    {title}
                </h1>
                {description && (
                    <p className="mt-0.5 max-w-xl text-sm text-ink-500">{description}</p>
                )}
                {meta && (
                    <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>
                )}
            </div>
        </div>

        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
)

export default PageHeader
