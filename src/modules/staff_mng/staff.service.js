const staffRepository = require("./staff.repository");
const ApiError = require("../../shared/utils/ApiError");

const addStaff = async ({ employee_id, name, department, email, phone, designation, availability }) => {

    const existingEmployeeId = await staffRepository.findStaffByEmployeeId(employee_id);

    if (existingEmployeeId) {
        throw new ApiError(409, "Staff with this employee ID already exists");
    }

    const existingEmail = await staffRepository.findStaffByEmail(email);

    if (existingEmail) {
        throw new ApiError(409, "Staff with this email already exists");
    }

    return await staffRepository.insertStaff({ employee_id, name, department, email, phone, designation, availability });

};

const getAllStaff = async (filters, page, limit) => {
    return await staffRepository.findAllStaff(filters, page, limit);
};

const searchStaff = async (searchTerm, filters, page, limit) => {
    return await staffRepository.searchStaff(searchTerm, filters, page, limit);
};

const getStaffById = async (staffId) => {

    const staff = await staffRepository.findStaffById(staffId);

    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    return staff;
};

const updateStaff = async (staffId, staff) => {

    const existingStaff = await staffRepository.findStaffById(staffId);

    if (!existingStaff) {
        throw new ApiError(404, "Staff not found");
    }

    if (staff.employee_id && staff.employee_id !== existingStaff.employee_id) {

        const existingEmployeeId = await staffRepository.findStaffByEmployeeId(staff.employee_id);

        if (existingEmployeeId) {
            throw new ApiError(409, "Staff with this employee ID already exists");
        }
    }

    if (staff.email && staff.email !== existingStaff.email) {

        const existingEmail = await staffRepository.findStaffByEmail(staff.email);

        if (existingEmail) {
            throw new ApiError(409, "Staff with this email already exists");
        }
    }

    await staffRepository.updateStaff(staffId, staff);

    return await staffRepository.findStaffById(staffId);
};

const updateAvailability = async (staffId, availability) => {

    const existingStaff = await staffRepository.findStaffById(staffId);

    if (!existingStaff) {
        throw new ApiError(404, "Staff not found");
    }

    await staffRepository.updateAvailability(staffId, availability);

    return await staffRepository.findStaffById(staffId);
};

const deleteStaff = async (staffId) => {

    const staff = await staffRepository.findStaffById(staffId);

    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    await staffRepository.deleteStaff(staffId);

    return { message: "Staff deleted successfully" };
};

module.exports = {
    addStaff,
    getAllStaff,
    searchStaff,
    getStaffById,
    updateStaff,
    updateAvailability,
    deleteStaff
};
