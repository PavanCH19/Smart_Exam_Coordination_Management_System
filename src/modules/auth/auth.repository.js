const User = require("./user.model");

// ---------- User ----------

const findUserByEmail = async (email) => {
    return await User.findOne({ where: { email } });
};

const findUserById = async (id) => {
    return await User.findByPk(id);
};

const updateUserPassword = async (userId, hashedPassword) => {
    return await User.update(
        { password: hashedPassword },
        { where: { id: userId } }
    );
};

module.exports = {
    findUserByEmail,
    findUserById,
    updateUserPassword
};
