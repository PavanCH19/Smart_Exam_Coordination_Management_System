const seatService = require("./seat.service");

const getSeating = async (req, res, next) => {

    try {
        const result = await seatService.getSeatingByAllocationId(req.params.allocationId);

        res.status(200).json({
            success: true,
            message: "Seating fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const generateSeating = async (req, res, next) => {

    try {
        const result = await seatService.generateSeating(req.params.allocationId, req.body);

        res.status(200).json({
            success: true,
            message: "Seating generated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const saveSeating = async (req, res, next) => {

    try {
        const result = await seatService.saveSeating(req.params.allocationId, req.body.seats);

        res.status(200).json({
            success: true,
            message: "Seating saved successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    getSeating,
    generateSeating,
    saveSeating
};
