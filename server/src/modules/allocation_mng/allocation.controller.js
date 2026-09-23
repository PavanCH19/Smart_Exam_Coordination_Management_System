const allocationService = require("./allocation.service");

const addAllocation = async (req, res, next) => {

    try {
        const result = await allocationService.addAllocation(req.params.examId, req.body);

        res.status(201).json({
            success: true,
            message: "Room allocated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllocationsByExamId = async (req, res, next) => {

    try {
        const result = await allocationService.getAllocationsByExamId(req.params.examId);

        res.status(200).json({
            success: true,
            message: "Room allocations fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateAllocation = async (req, res, next) => {

    try {
        const result = await allocationService.updateAllocation(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: "Room allocation updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteAllocation = async (req, res, next) => {

    try {
        const result = await allocationService.deleteAllocation(req.params.id, { id: req.user.id });

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addAllocation,
    getAllocationsByExamId,
    updateAllocation,
    deleteAllocation
};
