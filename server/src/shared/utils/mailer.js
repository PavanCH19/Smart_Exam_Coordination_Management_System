const nodemailer = require("nodemailer");

let transporter = null;
let warnedNoConfig = false;

const isConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

const getTransporter = () => {
    if (transporter) return transporter;

    if (!isConfigured()) return null;

    transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });

    return transporter;
};

// Sends an email and never throws — a failed/unconfigured email should
// never break the request that triggered it (creating a student, sending a
// notification, etc). Callers can inspect the returned { sent, error }
// if they want to react to failures, but aren't required to.
const sendMail = async ({ to, subject, html, text }) => {

    if (!to) {
        return { sent: false, error: "No recipient email address provided" };
    }

    const activeTransporter = getTransporter();

    if (!activeTransporter) {
        if (!warnedNoConfig) {
            console.warn(
                "[mailer] SMTP is not configured (SMTP_HOST/SMTP_USER missing in .env) " +
                "— emails will be skipped. Set these to enable real email delivery."
            );
            warnedNoConfig = true;
        }
        return { sent: false, error: "Email is not configured" };
    }

    try {
        await activeTransporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html,
            text: text || undefined
        });
        return { sent: true };
    } catch (error) {
        console.error(`[mailer] Failed to send email to ${to}:`, error.message);
        return { sent: false, error: error.message };
    }
};

// Sends the same message to many recipients, sequentially, and never
// throws — used for bulk uploads and audience-wide notifications.
const sendBulkMail = async (recipients, { subject, html, text }) => {

    const results = { sent: 0, failed: 0 };

    for (const to of recipients) {
        // eslint-disable-next-line no-await-in-loop
        const result = await sendMail({ to, subject, html, text });
        if (result.sent) results.sent += 1;
        else results.failed += 1;
    }

    return results;
};

module.exports = {
    isConfigured,
    sendMail,
    sendBulkMail
};
