const auditService = require("./audit.service");

const getAllLogs = async (req, res, next) => {

    try {
        const { action, startDate, endDate, page = 1, limit = 20 } = req.query;

        const result = await auditService.getAllLogs(
            { action, startDate, endDate },
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Audit logs fetched successfully",
            data: result.logs,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllLogs };
