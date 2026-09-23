import React from 'react'

// A small, consistent icon set for nav + page headers. Hand-authored as
// inline SVG (stroke-based, 24x24) rather than pulling in an icon package,
// since this project only ships Tailwind via CDN and has no bundler-level
// dependency resolution to lean on.
const PATHS = {
    dashboard: 'M4 4h6v6H4V4Zm10 0h6v10h-6V4ZM4 14h6v6H4v-6Zm10 4h6v2h-6v-2Z',
    students: 'M12 3 2 8l10 5 8-4.2V15h1V8L12 3ZM6 12.5V17c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5l-6 3.2-6-3.2Z',
    staff: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z',
    department: 'M4 21V6l8-3 8 3v15h-6v-5h-4v5H4Zm4-9h2v2H8v-2Zm0 4h2v2H8v-2Zm6-4h2v2h-2v-2Zm0 4h2v2h-2v-2Z',
    course: 'M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Zm16 0c0-.8-.7-1.5-1.5-1.5H12v16h6.5c.8 0 1.5-.7 1.5-1.5v-13Z',
    subject: 'M5 4h11a2 2 0 0 1 2 2v14l-7-3-7 3V6a2 2 0 0 1 1-2Zm0 2v11.2l5.5-2.4 5.5 2.4V6H5Z',
    room: 'M5 21V5.4L14 3v18h5v2H2v-2h3Zm9-14.4-7 1.9V21h7V6.6ZM16 12h1v2h-1v-2Z',
    exam: 'M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 12h8v1.5H8V12Zm0 3.5h8V17H8v-1.5ZM8 8.5h4V10H8V8.5Z',
    timetable: 'M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 6h14v11H5V8Zm2 3h4v3H7v-3Z',
    allocation: 'M4 5h7v7H4V5Zm9 0h7v4h-7V5Zm0 6h7v8h-7v-8ZM4 14h7v6H4v-6Z',
    seating: 'M4 4h4v4H4V4Zm6 0h4v4h-4V4Zm6 0h4v4h-4V4ZM4 10h4v4H4v-4Zm6 0h4v4h-4v-4Zm6 0h4v4h-4v-4ZM4 16h4v4H4v-4Zm6 0h4v4h-4v-4Zm6 0h4v4h-4v-4Z',
    admitCard: 'M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm2 3v2h4V8H5Zm0 4v2h7v-2H5Zm10-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-3 8c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5v.5h-6v-.5Z',
    attendance: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2.3 9.3 2.4 2.4 5-5-1.4-1.4-3.6 3.6-1-1-1.4 1.4Z',
    notification: 'M12 2a6 6 0 0 0-6 6v3.6c0 .6-.2 1.2-.6 1.7L4 15.5V17h16v-1.5l-1.4-1.7c-.4-.5-.6-1.1-.6-1.7V8a6 6 0 0 0-6-6Zm-2.8 17a2.8 2.8 0 0 0 5.6 0H9.2Z',
    issue: 'M12 2 1 21h22L12 2Zm0 6.5 6.6 11.5H5.4L12 8.5ZM11 11v4h2v-4h-2Zm0 5.5v2h2v-2h-2Z',
    report: 'M4 20V10h4v10H4Zm6 0V4h4v16h-4Zm6 0v-7h4v7h-4Z',
    audit: 'M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 12h8v1.5H8V12Zm0 3.5h5V17H8v-1.5Z',
    users: 'M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3 3.1-5 7-5s7 2 7 5v1H2v-1Zm14.5-3.9c2.6.4 4.5 1.9 4.5 3.9v1h-4v-1c0-1.4-.6-2.6-1.6-3.6.4-.1.7-.2 1.1-.3Z',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a1.5 1.5 0 0 1 1.5 1.5c0 .7-.4 1.2-1 1.4V19h-1v-2.1c-.6-.2-1-.7-1-1.4A1.5 1.5 0 0 1 12 14Z',
    venue: 'M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
    chevronLeft: 'M15 4 7 12l8 8 1.4-1.4L9.8 12l6.6-6.6L15 4Z',
    chevronRight: 'M9 4 7.6 5.4 14.2 12l-6.6 6.6L9 20l8-8L9 4Z',
    logout: 'M10 3H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5v-2H6V5h4V3Zm4.6 4L13 8.4l2.6 2.6H7v2h8.6L13 15.6 14.6 17l5-5-5-5Z',
    search: 'm21 21-4.3-4.3M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z',
    plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
}

const Icon = ({ name, className = 'h-5 w-5', strokeWidth = 1.75 }) => {
    const path = PATHS[name]
    if (!path) return null

    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
            <path d={path} fill="currentColor" stroke="none" />
        </svg>
    )
}

export default Icon
