const { Op } = require("sequelize");
const Student = require("./students.model");

const findAllStudents = async (filters = {}, page = 1, limit = 10) => {

    const where = {};

    if (filters.usn) {
        where.usn = {
            [Op.like]: `%${filters.usn}%`
        };
    }

    if (filters.name) {
        where.name = {
            [Op.like]: `%${filters.name}%`
        };
    }

    if (filters.email) {
        where.email = {
            [Op.like]: `%${filters.email}%`
        };
    }

    if (filters.department) {
        where.department = filters.department;
    }

    if (filters.semester) {
        where.semester = filters.semester;
    }

    if (filters.section) {
        where.section = filters.section;
    }

    if (filters.course) {
        where.course = filters.course;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Student.findAndCountAll({
        where,
        limit,
        offset,
        order: [["student_id", "DESC"]]
    });

    return {
        students: rows,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalStudents: count,
            limit
        }
    };
};

module.exports = {
    findAllStudents
};