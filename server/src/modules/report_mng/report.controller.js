const reportService = require("./report.service");

const getReport = async (req, res, next) => {

    try {
        const result = await reportService.getReport(req.params.type);

        res.status(200).json({
            success: true,
            message: "Report fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const exportReport = async (req, res, next) => {

    try {
        const format = (req.query.format || "pdf").toLowerCase();
        const { buffer, contentType } = await reportService.exportReport(req.params.type, format);

        res.set({
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${req.params.type}-report.${format === "csv" ? "csv" : "pdf"}"`
        });
        res.status(200).send(buffer);
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getReport,
    exportReport
};
