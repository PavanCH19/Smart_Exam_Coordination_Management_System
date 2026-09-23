const notificationService = require("./notification.service");

const sendNotification = async (req, res, next) => {

    try {
        const result = await notificationService.sendNotification(req.body, req.user.id);

        res.status(201).json({
            success: true,
            message: "Notification sent successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllNotifications = async (req, res, next) => {

    try {
        const result = await notificationService.getAllNotifications();

        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteNotification = async (req, res, next) => {

    try {
        const result = await notificationService.deleteNotification(req.params.id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


const getMyNotifications = async (req, res, next) => {

    try {
        const result = await notificationService.getMyNotifications(req.user.id, req.user.role);

        res.status(200).json({
            success: true,
            message: "Notifications fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const markNotificationRead = async (req, res, next) => {

    try {
        const result = await notificationService.markNotificationRead(req.params.id, req.user.id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    sendNotification,
    getAllNotifications,
    deleteNotification,
    getMyNotifications,
    markNotificationRead
};
