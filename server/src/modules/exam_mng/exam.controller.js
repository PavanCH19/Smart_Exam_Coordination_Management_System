const examService = require("./exam.service");

const addExam = async (req, res, next) => {

    try {
        const result = await examService.addExam(req.body);

        res.status(201).json({
            success: true,
            message: "Exam created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllExams = async (req, res, next) => {

    try {
        const { status, department, semester, page = 1, limit = 10 } = req.query;

        const filters = {
            ...(status && { status }),
            ...(department && { department }),
            ...(semester && { semester })
        };

        const result = await examService.getAllExams(
            filters,
            Number(page),
            Number(limit)
        );

        res.status(200).json({
            success: true,
            message: "Exams fetched successfully",
            data: result.exams,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const getTimetable = async (req, res, next) => {

    try {
        const { department, semester } = req.query;

        const filters = {
            ...(department && { department }),
            ...(semester && { semester })
        };

        const result = await examService.getExamsByFilters(filters);

        res.status(200).json({
            success: true,
            message: "Timetable fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const generateTimetable = async (req, res, next) => {

    try {
        const result = await examService.generateTimetable(req.body, {
            id: req.user.id,
            name: req.user.name
        });

        res.status(200).json({
            success: true,
            message: `${result.created.length} exam(s) scheduled`,
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateExam = async (req, res, next) => {

    try {
        const result = await examService.updateExam( req.params.id, req.body );

        res.status(200).json({
            success: true,
            message: "Exam updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteExam = async (req, res, next) => {

    try {
        const result = await examService.deleteExam( req.params.id );

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addExam,
    getAllExams,
    getTimetable,
    generateTimetable,
    updateExam,
    deleteExam
};
