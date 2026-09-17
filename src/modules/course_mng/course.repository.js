const Course = require("./course.model");

const findCourseById = async (courseId) => {
    return await Course.findByPk(courseId);
};

const findCourseByCode = async (code) => {
    return await Course.findOne({
        where: { code }
    });
};

const findAllCourses = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    return await Course.findAll({
        where: filters,
        limit,
        offset,
        order: [["course_id", "DESC"]]
    });
};

const insertCourse = async (course) => {
    return await Course.create(course);
};

const updateCourse = async (courseId, course) => {

    return await Course.update(
        course,
        {
            where: { course_id: courseId }
        }
    );
};

const deleteCourse = async (courseId) => {

    return await Course.destroy({
        where: { course_id: courseId }
    });
};

module.exports = {
    findCourseById,
    findCourseByCode,
    findAllCourses,
    insertCourse,
    updateCourse,
    deleteCourse
};
