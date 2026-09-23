const subjectService = require("./subject.service");

const addSubject = async (req, res, next) => {

    try {
        const result = await subjectService.addSubject(req.body);

        res.status(201).json({
            success: true,
            message: "Subject added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllSubjects = async (req, res, next) => {

    try {
        const { search, semester, department, page = 1, limit = 10 } = req.query;

        const filters = {
            ...(semester && { semester }),
            ...(department && { department })
        };

        const result = await subjectService.getAllSubjects(
            filters,
            search,
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Subjects fetched successfully",
            data: result.subjects,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const updateSubject = async (req, res, next) => {

    try {
        const result = await subjectService.updateSubject( req.params.id, req.body );

        res.status(200).json({
            success: true,
            message: "Subject updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteSubject = async (req, res, next) => {

    try {
        const result = await subjectService.deleteSubject( req.params.id );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject
};
