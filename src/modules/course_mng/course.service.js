const courseRepository = require("./course.repository");
const departmentRepository = require("./department.repository");
const ApiError = require("../../shared/utils/ApiError");

const addCourse = async ({ name, code, department_id, duration_semesters }) => {

    const department = await departmentRepository.findDepartmentById(department_id);

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    const existingCode = await courseRepository.findCourseByCode(code);

    if (existingCode) {
        throw new ApiError(409, "Course with this code already exists");
    }

    return await courseRepository.insertCourse({ name, code, department_id, duration_semesters });

};

const getAllCourses = async (filters, page, limit) => {
    return await courseRepository.findAllCourses(filters, page, limit);
};

const getCourseById = async (courseId) => {

    const course = await courseRepository.findCourseById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    return course;
};

const updateCourse = async (courseId, course) => {

    const existingCourse = await courseRepository.findCourseById(courseId);

    if (!existingCourse) {
        throw new ApiError(404, "Course not found");
    }

    if (course.department_id && course.department_id !== existingCourse.department_id) {

        const department = await departmentRepository.findDepartmentById(course.department_id);

        if (!department) {
            throw new ApiError(404, "Department not found");
        }
    }

    if (course.code && course.code !== existingCourse.code) {

        const existingCode = await courseRepository.findCourseByCode(course.code);

        if (existingCode) {
            throw new ApiError(409, "Course with this code already exists");
        }
    }

    await courseRepository.updateCourse(courseId, course);

    return await courseRepository.findCourseById(courseId);
};

const deleteCourse = async (courseId) => {

    const course = await courseRepository.findCourseById(courseId);

    if (!course) {
        throw new ApiError(404, "Course not found");
    }

    await courseRepository.deleteCourse(courseId);

    return { message: "Course deleted successfully" };
};

module.exports = {
    addCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
};
