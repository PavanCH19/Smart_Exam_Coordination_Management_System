const attendanceService = require("./attendance.service");

const getRoster = async (req, res, next) => {

    try {
        const result = await attendanceService.getRosterForExam(req.params.examId);

        res.status(200).json({
            success: true,
            message: "Attendance roster fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const markAttendance = async (req, res, next) => {

    try {
        const isStaff = req.user.role === "STAFF";

        const result = await attendanceService.markAttendance(
            req.params.examId,
            req.params.studentId,
            req.body.status,
            req.user.id,
            isStaff
        );

        res.status(200).json({
            success: true,
            message: "Attendance updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const bulkMarkAttendance = async (req, res, next) => {

    try {
        const isStaff = req.user.role === "STAFF";

        const result = await attendanceService.bulkMarkAttendance(
            req.params.examId,
            req.body.updates,
            req.user.id,
            isStaff
        );

        res.status(200).json({
            success: true,
            message: `${result.updated} student(s) updated`,
            data: result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getRoster,
    markAttendance,
    bulkMarkAttendance
};
