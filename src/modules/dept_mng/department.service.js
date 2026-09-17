const departmentRepository = require("./department.repository");
const ApiError = require("../../shared/utils/ApiError");

const addDepartment = async ({ name, code, description }) => {

    const existingName = await departmentRepository.findDepartmentByName(name);

    if (existingName) {
        throw new ApiError(409, "Department with this name already exists");
    }

    const existingCode = await departmentRepository.findDepartmentByCode(code);

    if (existingCode) {
        throw new ApiError(409, "Department with this code already exists");
    }

    return await departmentRepository.insertDepartment({ name, code, description });

};

const getAllDepartments = async (filters, page, limit) => {
    return await departmentRepository.findAllDepartments(filters, page, limit);
};

const getDepartmentById = async (departmentId) => {

    const department = await departmentRepository.findDepartmentById(departmentId);

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    return department;
};

const updateDepartment = async (departmentId, department) => {

    const existingDepartment = await departmentRepository.findDepartmentById(departmentId);

    if (!existingDepartment) {
        throw new ApiError(404, "Department not found");
    }

    if (department.name && department.name !== existingDepartment.name) {

        const existingName = await departmentRepository.findDepartmentByName(department.name);

        if (existingName) {
            throw new ApiError(409, "Department with this name already exists");
        }
    }

    if (department.code && department.code !== existingDepartment.code) {

        const existingCode = await departmentRepository.findDepartmentByCode(department.code);

        if (existingCode) {
            throw new ApiError(409, "Department with this code already exists");
        }
    }

    await departmentRepository.updateDepartment(departmentId, department);

    return await departmentRepository.findDepartmentById(departmentId);
};

const deleteDepartment = async (departmentId) => {

    const department = await departmentRepository.findDepartmentById(departmentId);

    if (!department) {
        throw new ApiError(404, "Department not found");
    }

    await departmentRepository.deleteDepartment(departmentId);

    return { message: "Department deleted successfully" };
};

module.exports = {
    addDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
};
