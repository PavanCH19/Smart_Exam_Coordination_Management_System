const { Op } = require("sequelize");
const { Notification, NotificationRead } = require("./notification.model");

const findAll = async () => {
    return await Notification.findAll({ order: [["sent_at", "DESC"]] });
};

const findForAudience = async (audience) => {
    return await Notification.findAll({
        where: { audience: { [Op.in]: ["ALL", audience] } },
        order: [["sent_at", "DESC"]]
    });
};

const findForUser = async (audience, userId) => {
    return await Notification.findAll({
        where: {
            [Op.or]: [
                { audience: { [Op.in]: ["ALL", audience] }, recipient_user_id: null },
                { recipient_user_id: userId }
            ]
        },
        order: [["sent_at", "DESC"]]
    });
};

const findById = async (notificationId) => {
    return await Notification.findByPk(notificationId);
};

const insert = async (notification) => {
    return await Notification.create(notification);
};

const remove = async (notificationId) => {
    return await Notification.destroy({ where: { notification_id: notificationId } });
};

const findReadNotificationIds = async (userId) => {
    const reads = await NotificationRead.findAll({ where: { user_id: userId } });
    return reads.map((r) => r.notification_id);
};

const markRead = async (notificationId, userId) => {
    const existing = await NotificationRead.findOne({
        where: { notification_id: notificationId, user_id: userId }
    });

    if (existing) return existing;

    return await NotificationRead.create({ notification_id: notificationId, user_id: userId });
};

module.exports = {
    findAll,
    findForAudience,
    findForUser,
    findById,
    insert,
    remove,
    findReadNotificationIds,
    markRead
};
