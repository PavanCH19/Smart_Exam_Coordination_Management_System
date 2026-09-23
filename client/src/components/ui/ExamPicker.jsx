import React, { useEffect, useState } from 'react'
import { getExams } from '../../axiosRoutes/examRoutes'

const formatDate = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

const selectClass =
    'w-full max-w-md rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

// Fetches the exam list once and lets the parent page track which exam is
// currently selected; also hands back the full exam object on change so
// pages don't need to re-look it up.
const ExamPicker = ({ value, onChange, label = 'Select examination' }) => {
    const [exams, setExams] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        const fetchExams = async () => {
            try {
                setLoading(true)
                const response = await getExams({ limit: 200 })
                const data = response.data.data || response.data || []
                if (isMounted) setExams(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error(error)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchExams()
        return () => {
            isMounted = false
        }
    }, [])

    const handleChange = (event) => {
        const examId = event.target.value
        const exam = exams.find((item) => String(item.exam_id) === String(examId))
        onChange(examId, exam || null)
    }

    return (
        <div>
            <label htmlFor="exam-picker" className="block text-sm font-medium text-ink-700">
                {label}
            </label>
            <select
                id="exam-picker"
                value={value || ''}
                onChange={handleChange}
                disabled={loading}
                className={`mt-1.5 ${selectClass}`}
            >
                <option value="">
                    {loading ? 'Loading exams…' : 'Select an examination'}
                </option>
                {exams.map((exam) => (
                    <option key={exam.exam_id} value={exam.exam_id}>
                        {exam.subject_name || exam.subject_code} — {formatDate(exam.exam_date)} · {exam.department} Sem {exam.semester}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default ExamPicker
