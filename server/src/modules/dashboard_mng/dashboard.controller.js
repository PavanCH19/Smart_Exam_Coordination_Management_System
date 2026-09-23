const dashboardService = require("./dashboard.service");

const getAdminDashboard = async (req, res, next) => {

    try {
        const result = await dashboardService.getAdminDashboard();

        res.status(200).json({
            success: true,
            message: "Admin dashboard fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getStaffDashboard = async (req, res, next) => {

    try {
        const result = await dashboardService.getStaffDashboard(req.user.id);

        res.status(200).json({
            success: true,
            message: "Staff dashboard fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getStudentDashboard = async (req, res, next) => {

    try {
        const result = await dashboardService.getStudentDashboard(req.user.id);

        res.status(200).json({
            success: true,
            message: "Student dashboard fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getAdminDashboard,
    getStaffDashboard,
    getStudentDashboard
};
