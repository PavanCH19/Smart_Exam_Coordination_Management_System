const courseService = require("./course.service");

const addCourse = async (req, res, next) => {

    try {
        const result = await courseService.addCourse(req.body);

        res.status(201).json({
            success: true,
            message: "Course added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllCourses = async (req, res, next) => {

    try {
        const { department, page = 1, limit = 10 } = req.query;

        const filters = {
            ...(department && { department })
        };

        const result = await courseService.getAllCourses(
            filters,
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: result.courses,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const updateCourse = async (req, res, next) => {

    try {
        const result = await courseService.updateCourse( req.params.id, req.body );

        res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteCourse = async (req, res, next) => {

    try {
        const result = await courseService.deleteCourse( req.params.id );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addCourse,
    getAllCourses,
    updateCourse,
    deleteCourse
};
