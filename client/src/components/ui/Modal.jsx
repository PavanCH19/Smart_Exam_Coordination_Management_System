import React, { useEffect, useRef } from 'react'

const SIZE_CLASSES = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
}

// A single reusable dialog used for every add / edit / view-details flow
// across the app, so the interaction pattern stays consistent everywhere.
const Modal = ({ open, onClose, title, description, children, size = 'md' }) => {
    const panelRef = useRef(null)

    // Close on Escape
    useEffect(() => {
        if (!open) return undefined

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [open, onClose])

    // Lock background scroll while a dialog is open
    useEffect(() => {
        if (!open) return undefined

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [open])

    // Focus the panel when it opens (basic focus management)
    useEffect(() => {
        if (open) {
            panelRef.current?.focus()
        }
    }, [open])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-8 sm:items-center">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close dialog"
                onClick={onClose}
                className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in-up"
            />

            {/* Panel */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                tabIndex={-1}
                className={`relative z-10 w-full ${SIZE_CLASSES[size]} animate-fade-in-up rounded-2xl bg-white shadow-card outline-none`}
            >
                <div className="flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 sm:px-6">
                    <div>
                        <h2 className="font-display text-lg font-semibold text-ink-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-0.5 text-sm text-ink-500">{description}</p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="max-h-[75vh] overflow-y-auto px-5 py-5 sm:px-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal
