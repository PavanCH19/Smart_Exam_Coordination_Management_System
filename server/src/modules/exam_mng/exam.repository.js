const { Op } = require("sequelize");
const Exam = require("./exam.model");
const Subject = require("../subject_mng/subject.model");

const subjectAttributes = ["subject_name", "subject_code", "duration"];

const findExamById = async (examId) => {
    return await Exam.findByPk(examId, {
        include: [{ model: Subject, attributes: subjectAttributes }]
    });
};

const findAllExams = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    return await Exam.findAndCountAll({
        where: filters,
        include: [{ model: Subject, attributes: subjectAttributes }],
        limit,
        offset,
        order: [["exam_date", "ASC"], ["start_time", "ASC"]]
    });
};

// Used by the Timetable view — same shape as findAllExams but no pagination
// envelope, since the frontend timetable groups the full filtered set by date.
const findExamsByFilters = async (filters = {}) => {
    return await Exam.findAll({
        where: filters,
        include: [{ model: Subject, attributes: subjectAttributes }],
        order: [["exam_date", "ASC"], ["start_time", "ASC"]]
    });
};

const findExamsByDepartmentSemesterInRange = async (department, semester, startDate, endDate) => {
    return await Exam.findAll({
        where: {
            department,
            semester,
            exam_date: { [Op.between]: [startDate, endDate] }
        },
        order: [["exam_date", "ASC"]]
    });
};

const findExamsOnDateForDeptSemester = async (department, semester, examDate) => {
    return await Exam.findAll({
        where: { department, semester, exam_date: examDate }
    });
};

const insertExam = async (exam) => {
    return await Exam.create(exam);
};

const updateExam = async (examId, exam) => {

    return await Exam.update(
        exam,
        {
            where: { exam_id: examId }
        }
    );
};

const deleteExam = async (examId) => {

    return await Exam.destroy({
        where: { exam_id: examId }
    });
};

module.exports = {
    findExamById,
    findAllExams,
    findExamsByFilters,
    findExamsByDepartmentSemesterInRange,
    findExamsOnDateForDeptSemester,
    insertExam,
    updateExam,
    deleteExam
};
