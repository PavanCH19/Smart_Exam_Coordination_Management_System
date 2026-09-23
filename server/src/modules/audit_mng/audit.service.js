const auditRepository = require("./audit.repository");

const getAllLogs = async (filters, page, limit) => {
    const { rows, count } = await auditRepository.findAll(filters, page, limit);

    return {
        logs: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

// Fire-and-forget style logger used by other modules as a side effect of
// mutating actions (timetable generation, room/staff reassignment, admit
// card generation, attendance overrides, user account changes, etc).
// Swallows its own errors so a logging failure never breaks the real
// operation that triggered it.
const writeLog = async ({ action, performedBy, performedByName, target, details }) => {
    try {
        await auditRepository.insert({
            action,
            performed_by: performedBy || null,
            performed_by_name: performedByName || null,
            target: target || null,
            details: details || null
        });
    } catch (error) {
        console.error("Failed to write audit log:", error.message);
    }
};

module.exports = {
    getAllLogs,
    writeLog
};
