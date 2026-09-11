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
            role: user.role
        }
    };
};

// ---------- CHANGE PASSWORD ----------

const changePassword = async (userId, { oldPassword, newPassword }) => {
    const user = await authRepository.findUserById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
        throw new ApiError(401, "Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await authRepository.updateUserPassword(user.id, hashedPassword);

    return { message: "Password changed successfully" };
};

module.exports = {
    login,
    changePassword
};
