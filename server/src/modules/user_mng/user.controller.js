const userService = require("./user.service");

const addUser = async (req, res, next) => {

    try {
        const result = await userService.addUser(req.body, { id: req.user.id });

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllUsers = async (req, res, next) => {

    try {
        const { role } = req.query;
        const filters = { ...(role && { role }) };

        const result = await userService.getAllUsers(filters);

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateUser = async (req, res, next) => {

    try {
        const result = await userService.updateUser(req.params.id, req.body, { id: req.user.id });

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const deleteUser = async (req, res, next) => {

    try {
        const result = await userService.deleteUser(req.params.id, { id: req.user.id });

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};


const resetUserPassword = async (req, res, next) => {

    try {
        const result = await userService.resetUserPassword(req.params.id, { id: req.user.id });

        res.status(200).json({
            success: true,
            message: result.message,
            data: { temporaryPassword: result.temporaryPassword }
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    addUser,
    getAllUsers,
    updateUser,
    deleteUser,
    resetUserPassword
};
