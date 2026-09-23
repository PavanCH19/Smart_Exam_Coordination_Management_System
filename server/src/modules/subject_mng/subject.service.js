const subjectRepository = require("./subject.repository");
const departmentRepository = require("../dept_mng/department.repository");
const ApiError = require("../../shared/utils/ApiError");

const addSubject = async ({ subject_code, subject_name, department, semester, duration }) => {

    const existingDepartment = await departmentRepository.findDepartmentByName(department);

    if (!existingDepartment) {
        throw new ApiError(404, "Department not found");
    }

    const existingCode = await subjectRepository.findSubjectByCode(subject_code);

    if (existingCode) {
        throw new ApiError(409, "Subject with this code already exists");
    }

    return await subjectRepository.insertSubject({ subject_code, subject_name, department, semester, duration });

};

const getAllSubjects = async (filters, search, page, limit) => {
    const { rows, count } = await subjectRepository.findAllSubjects(filters, search, page, limit);

    return {
        subjects: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getSubjectById = async (subjectId) => {

    const subject = await subjectRepository.findSubjectById(subjectId);

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    return subject;
};

const updateSubject = async (subjectId, subject) => {

    const existingSubject = await subjectRepository.findSubjectById(subjectId);

    if (!existingSubject) {
        throw new ApiError(404, "Subject not found");
    }

    if (subject.department && subject.department !== existingSubject.department) {

        const department = await departmentRepository.findDepartmentByName(subject.department);

        if (!department) {
            throw new ApiError(404, "Department not found");
        }
    }

    if (subject.subject_code && subject.subject_code !== existingSubject.subject_code) {

        const existingCode = await subjectRepository.findSubjectByCode(subject.subject_code);

        if (existingCode) {
            throw new ApiError(409, "Subject with this code already exists");
        }
    }

    await subjectRepository.updateSubject(subjectId, subject);

    return await subjectRepository.findSubjectById(subjectId);
};

const deleteSubject = async (subjectId) => {

    const subject = await subjectRepository.findSubjectById(subjectId);

    if (!subject) {
        throw new ApiError(404, "Subject not found");
    }

    await subjectRepository.deleteSubject(subjectId);

    return { message: "Subject deleted successfully" };
};

module.exports = {
    addSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
};
