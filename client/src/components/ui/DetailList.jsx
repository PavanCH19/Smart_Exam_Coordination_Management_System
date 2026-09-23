import React from 'react'

// Renders whatever shape a details endpoint returns: an array of records as
// a table, a single object as a key/value list, or a plain empty state.
const DetailList = ({ data }) => {
    const rows = Array.isArray(data) ? data : data ? [data] : []

    if (rows.length === 0) {
        return <p className="text-sm text-ink-400">No records found.</p>
    }

    const columns = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row || {}).forEach((key) => set.add(key))
            return set
        }, new Set())
    )

    const formatCell = (value) => {
        if (value === null || value === undefined || value === '') return '—'
        if (typeof value === 'object') return JSON.stringify(value)
        return String(value)
    }

    const formatHeader = (key) =>
        key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())

    return (
        <div className="overflow-x-auto rounded-xl border border-ink-100">
            <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                    <tr className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-400">
                        {columns.map((column) => (
                            <th key={column} className="px-3 py-2.5 font-medium">
                                {formatHeader(column)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={row.id || row.exam_id || row.attendance_id || index} className="border-b border-ink-50 last:border-0">
                            {columns.map((column) => (
                                <td key={column} className="px-3 py-2.5 text-ink-600">
                                    {formatCell(row[column])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default DetailList
