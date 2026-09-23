// Small, dependency-free HTML email templates. Kept simple and inline-styled
// since most email clients strip <style> blocks.

const wrapper = (bodyHtml) => `
<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
    <div style="background: #101b2e; padding: 20px 24px; border-radius: 8px 8px 0 0;">
        <span style="color: #e9c98f; font-size: 18px; font-weight: bold;">Smart Exam Coordination and Management System</span>
    </div>
    <div style="border: 1px solid #e5e5e5; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        ${bodyHtml}
    </div>
    <p style="color: #999; font-size: 11px; margin-top: 16px;">
        This is an automated message — please do not reply directly to this email.
    </p>
</div>`;

const credentialsEmailTemplate = ({ name, email, password, role }) => {

    const roleLabel = role === "STUDENT" ? "Student" : role === "STAFF" ? "Staff" : "Admin";

    const html = wrapper(`
        <p>Hi ${name},</p>
        <p>An account has been created for you on the Smart Exam Coordination and Management System as a <b>${roleLabel}</b>.</p>
        <table style="border-collapse: collapse; margin: 16px 0;">
            <tr>
                <td style="padding: 6px 12px 6px 0; color: #666;">Login email</td>
                <td style="padding: 6px 0; font-weight: bold;">${email}</td>
            </tr>
            <tr>
                <td style="padding: 6px 12px 6px 0; color: #666;">Temporary password</td>
                <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${password}</td>
            </tr>
        </table>
        <p>Please log in and change your password as soon as possible from the Account settings page.</p>
    `);

    return {
        subject: "Your Smart Exam Coordination account has been created",
        html
    };
};

const notificationEmailTemplate = ({ title, message, type }) => {

    const tagColor = type === "ALERT" ? "#dc2626" : type === "REMINDER" ? "#b8863b" : "#2563eb";
    const tagLabel = type === "ALERT" ? "Alert" : type === "REMINDER" ? "Reminder" : "Information";

    const html = wrapper(`
        <span style="display: inline-block; background: ${tagColor}1a; color: ${tagColor}; font-size: 11px; font-weight: bold; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;">
            ${tagLabel}
        </span>
        <h2 style="margin: 12px 0 8px;">${title}</h2>
        <p style="white-space: pre-line;">${message}</p>
    `);

    return {
        subject: `[${tagLabel}] ${title}`,
        html
    };
};

const dutyAssignmentEmailTemplate = ({ name, message }) => ({
    subject: "Your examination invigilation duties have been assigned",
    html: wrapper(`
        <p>Hi ${name},</p>
        <p>Your current examination assignments are:</p>
        <p style="white-space: pre-line; background: #f5f5f5; padding: 14px; border-radius: 6px;">${message}</p>
        <p>Completed or cancelled duties are not included.</p>
    `)
});

module.exports = {
    credentialsEmailTemplate,
    notificationEmailTemplate,
    dutyAssignmentEmailTemplate
};
