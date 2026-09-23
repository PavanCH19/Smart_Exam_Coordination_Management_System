const notificationRepository = require("./notification.repository");
const ApiError = require("../../shared/utils/ApiError");
const mailer = require("../../shared/utils/mailer");
const { notificationEmailTemplate } = require("../../shared/utils/emailTemplates");

// Collects the actual email addresses for a notification's audience by
// reading directly from the Student/Staff tables (not the users table,
// since not every student/staff necessarily has a login account yet).
const getRecipientEmails = async (audience) => {
    const Student = require("../std_mng/students.model");
    const Staff = require("../staff_mng/staff.model");

    const emails = [];

    if (audience === "ALL" || audience === "STUDENTS") {
        const students = await Student.findAll({ attributes: ["email"] });
        emails.push(...students.map((s) => s.email));
    }

    if (audience === "ALL" || audience === "STAFF") {
        const staff = await Staff.findAll({ attributes: ["email"] });
        emails.push(...staff.map((s) => s.email));
    }

    return emails.filter(Boolean);
};

const sendNotification = async ({ title, message, audience, type }, createdBy) => {

    const notification = await notificationRepository.insert({ title, message, audience, type, created_by: createdBy });

    // Email delivery runs after the record is saved and never blocks or
    // fails the API response — the notification exists in-app regardless
    // of whether email sending succeeds.
    const recipients = await getRecipientEmails(audience);
    const { subject, html } = notificationEmailTemplate({ title, message, type });

    mailer.sendBulkMail(recipients, { subject, html }).catch((error) => {
        console.error("[notifications] Bulk email send failed:", error.message);
    });

    return notification;
};

const getAllNotifications = async () => {
    return await notificationRepository.findAll();
};

const deleteNotification = async (notificationId) => {

    const existing = await notificationRepository.findById(notificationId);
    if (!existing) {
        throw new ApiError(404, "Notification not found");
    }

    await notificationRepository.remove(notificationId);

    return { message: "Notification retracted successfully" };
};

const getMyNotifications = async (userId, role) => {

    const audience = role === "STUDENT" ? "STUDENTS" : "STAFF";

    const notifications = await notificationRepository.findForUser(audience, userId);
    const readIds = new Set(await notificationRepository.findReadNotificationIds(userId));

    return notifications.map((notification) => {
        const plain = notification.toJSON();
        return { ...plain, read: readIds.has(plain.notification_id) };
    });
};

const markNotificationRead = async (notificationId, userId) => {

    const existing = await notificationRepository.findById(notificationId);
    if (!existing) {
        throw new ApiError(404, "Notification not found");
    }

    await notificationRepository.markRead(notificationId, userId);

    return { message: "Notification marked as read" };
};

module.exports = {
    sendNotification,
    getAllNotifications,
    deleteNotification,
    getMyNotifications,
    markNotificationRead
};
