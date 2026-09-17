const staffService = require("./staff.service");

const addStaff = async (req, res, next) => {

    try {
        const result = await staffService.addStaff(req.body);

        res.status(201).json({
            success: true,
            message: "Staff added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllStaff = async (req, res, next) => {

    try {
        const { department, designation, availability, page = 1, limit = 10 } = req.query;

        const filters = {
            ...(department && { department }),
            ...(designation && { designation }),
            ...(availability && { availability })
        };

        const result = await staffService.getAllStaff(
            filters,
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Staff fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const searchStaff = async (req, res, next) => {

    try {
        const { q, department, designation, availability, page = 1, limit = 10 } = req.query;

        const filters = {
            ...(department && { department }),
            ...(designation && { designation }),
            ...(availability && { availability })
        };

        const result = await staffService.searchStaff(
            q,
            filters,
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Staff search results fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getStaffById = async (req, res, next) => {

    try {
        const result = await staffService.getStaffById( req.params.id );

        res.status(200).json({
            success: true,
            message: "Staff fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateStaff = async (req, res, next) => {

    try {
        const result = await staffService.updateStaff( req.params.id, req.body );

        res.status(200).json({
            success: true,
            message: "Staff updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateAvailability = async (req, res, next) => {

    try {
        const result = await staffService.updateAvailability( req.params.id, req.body.availability );

        res.status(200).json({
            success: true,
            message: "Staff availability updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteStaff = async (req, res, next) => {

    try {
        const result = await staffService.deleteStaff( req.params.id );
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addStaff,
    getAllStaff,
    searchStaff,
    getStaffById,
    updateStaff,
    updateAvailability,
    deleteStaff
};
