const { Op } = require("sequelize");

const Staff = require("./staff.model");

const findStaffById = async (staffId) => {
    return await Staff.findByPk(staffId);
};

const findStaffByEmail = async (email) => {
    return await Staff.findOne({
        where: { email }
    });
};

const findStaffByEmployeeId = async (employeeId) => {
    return await Staff.findOne({
        where: { employee_id: employeeId }
    });
};

const findAllStaff = async (filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    return await Staff.findAll({
        where: filters,
        limit,
        offset,
        order: [["staff_id", "DESC"]]
    });
};

const searchStaff = async (searchTerm, filters = {}, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    const where = { ...filters };

    if (searchTerm) {
        where[Op.or] = [
            { name: { [Op.iLike]: `%${searchTerm}%` } },
            { employee_id: { [Op.iLike]: `%${searchTerm}%` } }
        ];
    }

    return await Staff.findAll({
        where,
        limit,
        offset,
        order: [["staff_id", "DESC"]]
    });
};

const insertStaff = async (staff) => {
    return await Staff.create(staff);
};

const updateStaff = async (staffId, staff) => {

    return await Staff.update(
        staff,
        {
            where: { staff_id: staffId }
        }
    );
};

const updateAvailability = async (staffId, availability) => {

    return await Staff.update(
        { availability },
        {
            where: { staff_id: staffId }
        }
    );
};

const deleteStaff = async (staffId) => {

    return await Staff.destroy({
        where: { staff_id: staffId }
    });
};

module.exports = {
    findStaffById,
    findStaffByEmail,
    findStaffByEmployeeId,
    findAllStaff,
    searchStaff,
    insertStaff,
    updateStaff,
    updateAvailability,
    deleteStaff
};
