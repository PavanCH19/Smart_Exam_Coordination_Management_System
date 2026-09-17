const Department = require("./department.model");

const findDepartmentById = async (departmentId) => {
    return await Department.findByPk(departmentId);
};

const findDepartmentByName = async (name) => {
    return await Department.findOne({
        where: { name }
    });
};

const findDepartmentByCode = async (code) => {
    return await Department.findOne({
        where: { code }
    });
};

const findAllDepartments = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    return await Department.findAll({
        where: filters,
        limit,
        offset,
        order: [["department_id", "DESC"]]
    });
};

const insertDepartment = async (department) => {
    return await Department.create(department);
};

const updateDepartment = async (departmentId, department) => {

    return await Department.update(
        department,
        {
            where: { department_id: departmentId }
        }
    );
};

const deleteDepartment = async (departmentId) => {

    return await Department.destroy({
        where: { department_id: departmentId }
    });
};

module.exports = {
    findDepartmentById,
    findDepartmentByName,
    findDepartmentByCode,
    findAllDepartments,
    insertDepartment,
    updateDepartment,
    deleteDepartment
};
