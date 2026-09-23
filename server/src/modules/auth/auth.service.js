const bcrypt = require("bcrypt");
const authRepository = require("./auth.repository");
const ApiError = require("../../shared/utils/ApiError");
const { generateAccessToken } = require("../../shared/utils/jwt.util");

const SALT_ROUNDS = 10;

// ---------- LOGIN ----------

const login = async ({ email, password }) => {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
        throw new ApiError(401, "Invalid email or password");
    }

    if (user.status !== "ACTIVE") {
        throw new ApiError(403, "Your account is inactive. Please contact the administrator");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password");
    }

    const payload = { 
        id: user.id, 
        role: user.role 
    };
    const accessToken = generateAccessToken(payload);

    return {
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            // The frontend's student portal calls student-scoped endpoints
            // (e.g. GET /students/:id/exams) directly off this field.
            student_id: user.student_id,
            employee_id: user.employee_id
        }
    };
};

// ---------- CHANGE PASSWORD ----------

const changePassword = async (userId, { current_password, new_password }) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isOldPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isOldPasswordValid) {
        throw new ApiError(401, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(new_password, SALT_ROUNDS);
    await authRepository.updateUserPassword(user.id, hashedPassword);

    return { message: "Password changed successfully" };
};

module.exports = {
    login,
    changePassword
};
