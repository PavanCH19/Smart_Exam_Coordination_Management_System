import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

const WORKFLOW_STEPS = [
    'Students & staff',
    'Exam scheduling',
    'Room allocation',
    'Staff allocation',
    'Seating',
    'Admit cards',
    'Exam day',
    'Reports',
]

const PORTALS = [
    {
        role: 'Admin',
        description:
            'Manage students, staff and departments, build the exam timetable, allocate halls and invigilators, and monitor every session from one control centre.',
        points: ['Automated timetable', 'Hall & staff allocation', 'Reports & audit logs'],
    },
    {
        role: 'Staff',
        description:
            'See duty rosters at a glance, confirm attendance, review hall and subject details, and flag issues the moment they come up.',
        points: ['Duty roster', 'Attendance marking', 'Issue reporting'],
    },
    {
        role: 'Student',
        description:
            'Check the exam timetable, download the admit card, and find the exact venue and seat number for every paper.',
        points: ['Exam timetable', 'Digital admit card', 'Venue & seat lookup'],
    },
]

const HomePage = () => {
    return (
        <div className="min-h-screen bg-paper">
            <NavBar />

            {/* Hero */}
            <section className="border-b border-ink-100 bg-ink-950">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass-300">
                        Examination Cell · Digital Platform
                    </p>
                    <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-paper sm:text-5xl lg:text-6xl">
                        One system to coordinate every examination on campus.
                    </h1>
                    <p className="mt-5 max-w-2xl text-base text-ink-300 sm:text-lg">
                        Scheduling, room and invigilator allocation, seating, admit cards,
                        attendance and reporting — run from a single, role-aware
                        platform for the admin, staff and student portals.
                    </p>
                    <div className="mt-9 flex flex-wrap items-center gap-4">
                        <Link
                            to="/login"
                            className="rounded-lg bg-brass-500 px-6 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-brass-600"
                        >
                            Login to your portal
                        </Link>
                        <a
                            href="#workflow"
                            className="text-sm font-medium text-ink-200 underline decoration-ink-500 underline-offset-4 transition hover:text-paper"
                        >
                            See how it works
                        </a>
                    </div>
                </div>
            </section>

            {/* Workflow */}
            <section id="workflow" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                    Core workflow
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-500">
                    Every examination moves through the same coordinated pipeline, from
                    the first data entry to the final report.
                </p>

                <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {WORKFLOW_STEPS.map((step, index) => (
                        <li
                            key={step}
                            className="flex items-center gap-3 rounded-xl border border-ink-100 bg-white px-4 py-3.5 shadow-card"
                        >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-900 font-mono text-xs font-semibold text-brass-300">
                                {index + 1}
                            </span>
                            <span className="text-sm font-medium text-ink-700">{step}</span>
                        </li>
                    ))}
                </ol>
            </section>

            {/* Portals */}
            <section className="border-t border-ink-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <h2 className="font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                        Three portals, one platform
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-ink-500">
                        Everyone signs in through the same login and lands on the screen
                        built for their role.
                    </p>

                    <div className="mt-8 grid gap-5 lg:grid-cols-3">
                        {PORTALS.map((portal) => (
                            <div
                                key={portal.role}
                                className="flex flex-col rounded-2xl border border-ink-100 p-6 transition hover:border-brass-200 hover:shadow-card"
                            >
                                <span className="font-mono text-xs uppercase tracking-wide text-brass-600">
                                    {portal.role} portal
                                </span>
                                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                                    {portal.description}
                                </p>
                                <ul className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm text-ink-500">
                                    {portal.points.map((point) => (
                                        <li key={point} className="flex items-center gap-2">
                                            <span className="h-1.5 w-1.5 rounded-full bg-brass-400" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="border-t border-ink-100 bg-paper py-8">
                <div className="mx-auto max-w-7xl px-4 text-center text-xs text-ink-400 sm:px-6 lg:px-8">
                    Smart Exam Coordination and Management System
                </div>
            </footer>
        </div>
    )
}

export default HomePage
