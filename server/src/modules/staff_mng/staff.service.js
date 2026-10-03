const staffRepository = require("./staff.repository");
const ApiError = require("../../shared/utils/ApiError");
const { parse } = require("csv-parse/sync");
const { createStaffSchema } = require("./staff.validation");
const { assertEmailsAvailable } = require("../../shared/utils/emailAvailability.util");

const addStaff = async ({ employee_id, name, department, email, phone, designation, availability }) => {
    email = email.trim().toLowerCase();

    const existingEmployeeId = await staffRepository.findStaffByEmployeeId(employee_id);

    if (existingEmployeeId) {
        throw new ApiError(409, "Staff with this employee ID already exists");
    }

    await assertEmailsAvailable([email]);

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

const bulkUploadStaff = async (file) => {
    if (!file || !file.buffer) {
        throw new ApiError(400, "CSV file is required in the 'file' field");
    }

    let rows;

    try {
        rows = parse(file.buffer, {
            bom: true,
            columns: (headers) => headers.map((header) => header.trim().toLowerCase()),
            skip_empty_lines: true,
            trim: true
        });
    } catch (error) {
        throw new ApiError(400, `Invalid CSV file: ${error.message}`);
    }

    if (rows.length === 0) {
        throw new ApiError(400, "CSV file must contain a header and at least one staff member");
    }

    const requiredColumns = ["employee_id", "name", "department", "email", "designation"];
    const columns = Object.keys(rows[0]);
    const missingColumns = requiredColumns.filter((column) => !columns.includes(column));

    if (missingColumns.length > 0) {
        throw new ApiError(400, `Missing required CSV columns: ${missingColumns.join(", ")}`);
    }

    const staffMembers = rows.map((row, index) => {
        const rowNumber = index + 2;
        const staff = {
            employee_id: row.employee_id,
            name: row.name,
            department: row.department,
            email: row.email?.trim().toLowerCase(),
            phone: row.phone || null,
            designation: row.designation,
            availability: row.availability || "AVAILABLE"
        };
        const { error } = createStaffSchema.validate(staff, { abortEarly: false });

        if (error) {
            throw new ApiError(400, `Invalid staff data at row ${rowNumber}: ${error.details.map((detail) => detail.message).join(", ")}`);
        }

        return staff;
    });

    const employeeIds = new Set();
    const emails = new Set();

    staffMembers.forEach((staff, index) => {
        const rowNumber = index + 2;
        const normalizedEmployeeId = staff.employee_id.toLowerCase();
        const normalizedEmail = staff.email.toLowerCase();

        if (employeeIds.has(normalizedEmployeeId)) {
            throw new ApiError(400, `Duplicate employee ID in CSV at row ${rowNumber}: ${staff.employee_id}`);
        }
        if (emails.has(normalizedEmail)) {
            throw new ApiError(400, `Duplicate email in CSV at row ${rowNumber}: ${staff.email}`);
        }

        employeeIds.add(normalizedEmployeeId);
        emails.add(normalizedEmail);
    });

    const existingEmployeeIds = await staffRepository.findStaffByEmployeeIds([...employeeIds]);
    if (existingEmployeeIds.length > 0) {
        throw new ApiError(409, `Staff with this employee ID already exists: ${existingEmployeeIds[0].employee_id}`);
    }

    await assertEmailsAvailable([...emails]);

    const insertedStaff = await staffRepository.insertStaffs(staffMembers);
    const { provisionLoginAccount } = require("../../shared/utils/userAccount.util");
    let accountsCreated = 0;
    let emailsSent = 0;

    for (const staff of insertedStaff) {
        // eslint-disable-next-line no-await-in-loop
        const result = await provisionLoginAccount({
            name: staff.name,
            email: staff.email,
            role: "STAFF",
            employeeId: staff.employee_id
        });

        if (result.created) {
            accountsCreated += 1;
            if (result.emailSent) emailsSent += 1;
        }
    }

    return {
        count: insertedStaff.length,
        staff: insertedStaff,
        accountsCreated,
        emailsSent
    };
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
    bulkUploadStaff,
    getAllStaff,
    searchStaff,
    getStaffById,
    updateStaff,
    updateAvailability,
    deleteStaff
};
