const bcrypt = require("bcrypt");
const crypto = require("crypto");

const userRepository = require("./user.repository");
const studentRepository = require("../std_mng/students.repository");
const staffRepository = require("../staff_mng/staff.repository");
const auditService = require("../audit_mng/audit.service");
const ApiError = require("../../shared/utils/ApiError");

const SALT_ROUNDS = 10;

const shapeUser = (userInstance) => {
    if (!userInstance) return null;
    const user = userInstance.toJSON ? userInstance.toJSON() : userInstance;

    return {
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
    };
};

// Links a new login account back to its Student/Staff profile record by
// matching email — the admin is expected to create the profile (with a
// given email) before creating the matching login account.
const resolveProfileLinks = async (role, email) => {

    if (role === "STUDENT") {
        const student = await studentRepository.findStudentByEmail(email);
        return { student_id: student ? student.student_id : null, employee_id: null };
    }

    if (role === "STAFF") {
        const staff = await staffRepository.findStaffByEmail(email);
        return { student_id: null, employee_id: staff ? staff.employee_id : null };
    }

    return { student_id: null, employee_id: null };
};

const addUser = async ({ name, email, role, status, password }, actor = {}) => {

    const existing = await userRepository.findUserByEmail(email);
    if (existing) {
        throw new ApiError(409, "A user with this email already exists");
    }

    const links = await resolveProfileLinks(role, email);
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await userRepository.insertUser({
        name,
        email,
        role,
        status: status || "ACTIVE",
        password: hashedPassword,
        ...links
    });

    await auditService.writeLog({
        action: "USER_CREATED",
        performedBy: actor.id,
        target: email,
        details: `role=${role}`
    });

    return shapeUser(user);
};

const getAllUsers = async (filters) => {
    const users = await userRepository.findAllUsers(filters);
    return users.map(shapeUser);
};

const updateUser = async (userId, updates, actor = {}) => {

    const existing = await userRepository.findUserById(userId);
    if (!existing) {
        throw new ApiError(404, "User not found");
    }

    const payload = {
        ...(updates.name && { name: updates.name }),
        ...(updates.role && { role: updates.role }),
        ...(updates.status && { status: updates.status })
    };

    if (updates.role && updates.role !== existing.role) {
        const links = await resolveProfileLinks(updates.role, existing.email);
        Object.assign(payload, links);
    }

    if (updates.password) {
        payload.password = await bcrypt.hash(updates.password, SALT_ROUNDS);
    }

    await userRepository.updateUser(userId, payload);

    await auditService.writeLog({
        action: "USER_UPDATED",
        performedBy: actor.id,
        target: existing.email,
        details: Object.keys(payload).filter((k) => k !== "password").join(", ") || "password changed"
    });

    return shapeUser(await userRepository.findUserById(userId));
};

const deleteUser = async (userId, actor = {}) => {

    const existing = await userRepository.findUserById(userId);
    if (!existing) {
        throw new ApiError(404, "User not found");
    }

    await userRepository.deleteUser(userId);

    await auditService.writeLog({
        action: "USER_DEACTIVATED",
        performedBy: actor.id,
        target: existing.email,
        details: null
    });

    return { message: "User removed successfully" };
};

const resetUserPassword = async (userId, actor = {}) => {

    const existing = await userRepository.findUserById(userId);
    if (!existing) {
        throw new ApiError(404, "User not found");
    }

    const temporaryPassword = crypto.randomBytes(6).toString("hex");
    const hashedPassword = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    await userRepository.updateUser(userId, { password: hashedPassword });

    await auditService.writeLog({
        action: "USER_PASSWORD_RESET",
        performedBy: actor.id,
        target: existing.email,
        details: null
    });

    // NOTE: no email-sending service exists in this project yet — the
    // temporary password is returned directly so the admin can communicate
    // it manually. Wire up an email provider here if/when one is added.
    return { message: "Password reset successfully", temporaryPassword };
};

module.exports = {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
    resetUserPassword
};
