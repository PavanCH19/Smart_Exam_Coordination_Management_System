const dutyService = require("./duty.service");

const addDuty = async (req, res, next) => {

    try {
        const result = await dutyService.addDuty(req.params.examId, req.body);

        res.status(201).json({
            success: true,
            message: "Staff duty assigned successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getDutiesByExamId = async (req, res, next) => {

    try {
        const result = await dutyService.getDutiesByExamId(req.params.examId);

        res.status(200).json({
            success: true,
            message: "Staff duties fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateDuty = async (req, res, next) => {

    try {
        const result = await dutyService.updateDuty(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: "Staff duty updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteDuty = async (req, res, next) => {

    try {
        const result = await dutyService.deleteDuty(req.params.id, { id: req.user.id });

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


const getMyDuties = async (req, res, next) => {

    try {
        const { scope } = req.query;

        const result = await dutyService.getMyDuties(req.user.id, scope);

        res.status(200).json({
            success: true,
            message: "Duty roster fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const markDutyAttendance = async (req, res, next) => {

    try {
        // ADMIN can confirm on behalf of a staff member; STAFF can only
        // confirm their own (service enforces the ownership check either way).
        const userId = req.user.role === "STAFF" ? req.user.id : null;

        const result = await dutyService.markDutyAttendance(req.params.id, req.body.status, userId);

        res.status(200).json({
            success: true,
            message: "Duty attendance updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addDuty,
    getDutiesByExamId,
    updateDuty,
    deleteDuty,
    getMyDuties,
    markDutyAttendance
};
