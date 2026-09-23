import React, { useEffect, useState } from 'react'

const initialForm = {
    name: '',
    code: '',
    description: '',
}

const inputClass =
    'mt-1.5 block w-full rounded-lg border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brass-400 focus:outline-none focus:ring-1 focus:ring-brass-400'

const labelClass = 'block text-sm font-medium text-ink-700'

const DepartmentForm = ({ department, onSubmit, onCancel }) => {

    const [formData, setFormData] = useState(initialForm)

    useEffect(() => {
        if (department) {
            setFormData({
                name: department.name || '',
                code: department.code || '',
                description: department.description || '',
            })
        } else {
            setFormData(initialForm)
        }
    }, [department])

    const handleChange = (event) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        onSubmit(formData)

        if (!department) {
            setFormData(initialForm)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="name" className={labelClass}>Department name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Computer Science and Engineering"
                        required
                        className={inputClass}
                    />
                </div>

                <div>
                    <label htmlFor="code" className={labelClass}>Department code</label>
                    <input
                        id="code"
                        name="code"
                        type="text"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="CSE"
                        required
                        className={`${inputClass} uppercase`}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label htmlFor="description" className={labelClass}>Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Department of Computer Science and Engineering"
                        rows="3"
                        className={`${inputClass} resize-none`}
                    />
                </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-ink-100 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-ink-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="rounded-lg bg-ink-900 px-4 py-2 text-sm font-semibold text-paper transition hover:bg-ink-800"
                >
                    {department ? 'Update department' : 'Add department'}
                </button>
            </div>
        </form>
    )
}

export default DepartmentForm
