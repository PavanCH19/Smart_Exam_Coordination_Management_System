const departmentService = require("./department.service");

const addDepartment = async (req, res, next) => {

    try {
        const result = await departmentService.addDepartment(req.body);

        res.status(201).json({
            success: true,
            message: "Department added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllDepartments = async (req, res, next) => {

    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await departmentService.getAllDepartments(
            {},
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Departments fetched successfully",
            data: result.departments,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const updateDepartment = async (req, res, next) => {

    try {
        const result = await departmentService.updateDepartment( req.params.id, req.body );

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteDepartment = async (req, res, next) => {

    try {
        const result = await departmentService.deleteDepartment( req.params.id );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment
};
