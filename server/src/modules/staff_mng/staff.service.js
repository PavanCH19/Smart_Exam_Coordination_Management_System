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

    const staff = await staffRepository.insertStaff({ employee_id, name, department, email, phone, designation, availability });

    // Auto-provision a login account and email the credentials.
    const { provisionLoginAccount } = require("../../shared/utils/userAccount.util");
    await provisionLoginAccount({
        name: staff.name,
        email: staff.email,
        role: "STAFF",
        employeeId: staff.employee_id
    });

    return staff;

};

const getAllStaff = async (filters, page, limit) => {
    const { rows, count } = await staffRepository.findAllStaff(filters, page, limit);

    return {
        staff: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const searchStaff = async (searchTerm, filters, page, limit) => {
    const { rows, count } = await staffRepository.searchStaff(searchTerm, filters, page, limit);

    return {
        staff: rows,
        pagination: {
            page,
            limit,
            total: count,
            totalPages: Math.ceil(count / limit)
        }
    };
};

const getStaffById = async (staffId) => {

    const staff = await staffRepository.findStaffByEmployeeId(staffId);

    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    return staff;
};

const updateStaff = async (staffId, staff) => {

    const existingStaff = await staffRepository.findStaffByEmployeeId(staffId);

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

    await staffRepository.updateStaff(existingStaff.staff_id, staff);

    return await staffRepository.findStaffByEmployeeId(staff.employee_id || staffId);
};

const updateAvailability = async (staffId, availability) => {

    const existingStaff = await staffRepository.findStaffByEmployeeId(staffId);

    if (!existingStaff) {
        throw new ApiError(404, "Staff not found");
    }

    await staffRepository.updateAvailability(existingStaff.staff_id, availability);

    return await staffRepository.findStaffByEmployeeId(staffId);
};

const deleteStaff = async (staffId) => {

    const staff = await staffRepository.findStaffByEmployeeId(staffId);

    if (!staff) {
        throw new ApiError(404, "Staff not found");
    }

    const StaffDuty = require("../duty_mng/duty.model");
    const User = require("../auth/user.model");

    await StaffDuty.destroy({ where: { staff_id: staff.staff_id } });
    await staffRepository.deleteStaff(staff.staff_id);
    await User.destroy({ where: { employee_id: staff.employee_id } });

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
