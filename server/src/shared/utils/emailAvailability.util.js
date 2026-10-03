const { Op, col, fn, where } = require("sequelize");

const ApiError = require("./ApiError");
const Student = require("../../modules/std_mng/students.model");
const Staff = require("../../modules/staff_mng/staff.model");
const User = require("../../modules/auth/user.model");

const assertEmailsAvailable = async (emails) => {
    const normalizedEmails = [...new Set(
        emails
            .filter(Boolean)
            .map((email) => email.trim().toLowerCase())
    )];

    if (normalizedEmails.length === 0) {
        return;
    }

    const [students, staff, users] = await Promise.all([
        Student.findAll({
            attributes: ["email"],
            where: where(fn("LOWER", col("email")), { [Op.in]: normalizedEmails })
        }),
        Staff.findAll({
            attributes: ["email"],
            where: where(fn("LOWER", col("email")), { [Op.in]: normalizedEmails })
        }),
        User.findAll({
            attributes: ["email"],
            where: where(fn("LOWER", col("email")), { [Op.in]: normalizedEmails })
        })
    ]);

    const existingEmail = [...students, ...staff, ...users]
        .map((record) => record.email)
        .find((email) => normalizedEmails.includes(email.toLowerCase()));

    if (existingEmail) {
        throw new ApiError(409, `Email is already registered: ${existingEmail}`);
    }
};

module.exports = { assertEmailsAvailable };
