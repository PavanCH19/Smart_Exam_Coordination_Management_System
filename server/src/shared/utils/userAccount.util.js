// Cross-cutting helper used by std_mng and staff_mng when a new profile is
// created, to also provision a login account and email the credentials.
//
// Deliberately depends only on the auth module's User model (not on
// user_mng's service/repository) to avoid a circular require: user_mng
// already depends on std_mng/staff_mng to resolve profile links, so those
// modules calling back into user_mng would create a cycle.

const bcrypt = require("bcrypt");
const crypto = require("crypto");

const User = require("../../modules/auth/user.model");
const mailer = require("./mailer");
const { credentialsEmailTemplate } = require("./emailTemplates");
const auditService = require("../../modules/audit_mng/audit.service");
const ApiError = require("./ApiError");

const SALT_ROUNDS = 10;

const generateTemporaryPassword = () => crypto.randomBytes(6).toString("hex");

// role: "STUDENT" | "STAFF". Pass studentId for STUDENT, employeeId for STAFF.
const provisionLoginAccount = async ({ name, email, role, studentId, employeeId }) => {

    if (!email) {
        return { created: false, reason: "No email provided" };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: normalizedEmail } });

    if (existing) {
        throw new ApiError(409, `Email is already registered: ${normalizedEmail}`);
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);

    if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV] Temporary password for ${email}: ${temporaryPassword}`);
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role,
        status: "ACTIVE",
        student_id: role === "STUDENT" ? studentId : null,
        employee_id: role === "STAFF" ? employeeId : null
    });

    const { subject, html } = credentialsEmailTemplate({
        name,
        email: normalizedEmail,
        password: temporaryPassword,
        role
    });

    const emailResult = await mailer.sendMail({ to: normalizedEmail, subject, html });

    try {
        await auditService.writeLog({
            action: "USER_AUTO_PROVISIONED",
            target: normalizedEmail,
            details: `role=${role}, email ${emailResult.sent ? "sent" : "NOT sent (" + emailResult.error + ")"}`
        });
    } catch (error) {
        console.error("User provisioning audit failed:", error.message);
    }

    return {
        created: true,
        userId: user.id,
        emailSent: emailResult.sent
    };
};

module.exports = {
    provisionLoginAccount
};
