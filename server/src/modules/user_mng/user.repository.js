const User = require("../auth/user.model");

const findAllUsers = async (filters = {}) => {
    return await User.findAll({ where: filters, order: [["id", "DESC"]] });
};

const findUserById = async (userId) => {
    return await User.findByPk(userId);
};

const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

const insertUser = async (user) => {
    return await User.create(user);
};

const updateUser = async (userId, user) => {
    return await User.update(user, { where: { id: userId } });
};

const deleteUser = async (userId) => {
    return await User.destroy({ where: { id: userId } });
};

module.exports = {
    findAllUsers,
    findUserById,
    findUserByEmail,
    insertUser,
    updateUser,
    deleteUser
};
