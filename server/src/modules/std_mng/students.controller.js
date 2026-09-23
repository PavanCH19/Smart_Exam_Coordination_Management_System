const studentService = require("./students.service");

const addSingleStudent = async (req, res, next) => {

    try {
        const result = await studentService.addStd(req.body);

        res.status(201).json({
            success: true,
            message: "Student added successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllStudents = async (req, res, next) => {

    try {
        const { search, department, semester, section, course, page = 1, limit = 10 } = req.query;
        const normalizedPage = Math.max(Number(page) || 1, 1);
        const normalizedLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);

        const filters = {
            ...(department && { department }),
            ...(semester && { semester }),
            ...(section && { section }),
            ...(course && { course })
        };

        if (search) {
            const { Op } = require("sequelize");
            filters[Op.or] = [
                { usn: { [Op.like]: `%${search}%` } },
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const result = await studentService.getAllStudents(
            filters,
            normalizedPage,
            normalizedLimit
        );

        res.status(200).json({
            success: true,
            message: "Students fetched successfully",
            data: result.students,
            pagination: result.pagination
        });
    } catch (error) {
        next(error);
    }
};


const getStudentById = async (req, res, next) => {

    try {
        const result = await studentService.getStudentById( req.params.id );

        res.status(200).json({
            success: true,
            message: "Student fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateStudent = async (req, res, next) => {

    try {
        const result = await studentService.updateStudent( req.params.usn, req.body );

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteStudent = async (req, res, next) => {

    try {
        const result = await studentService.deleteStudent( req.params.usn );
        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


const bulkUploadStudents = async (req, res, next) => {

    try {
        const result = await studentService.bulkUploadStudents( req.file );

        res.status(201).json({
            success: true,
            message: "Students uploaded successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getStudentExams = async (req, res, next) => {

    try {
        const result = await studentService.getStudentExams( req.params.id );

        res.status(200).json({
            success: true,
            message: "Student exam timetable fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getStudentAttendance = async (req, res, next) => {

    try {
        const result = await studentService.getStudentAttendance( req.params.id );

        res.status(200).json({
            success: true,
            message: "Student attendance fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addSingleStudent,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent,
    bulkUploadStudents,
    getStudentExams,
    getStudentAttendance
};