const { Op } = require("sequelize");
const AuditLog = require("./audit.model");

const findAll = async (filters = {}, page = 1, limit = 20) => {

    const offset = (page - 1) * limit;
    const where = {};

    if (filters.action) {
        where.action = { [Op.like]: `%${filters.action}%` };
    }

    if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp[Op.gte] = new Date(filters.startDate);
        if (filters.endDate) where.timestamp[Op.lte] = new Date(filters.endDate);
    }

    return await AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [["timestamp", "DESC"]]
    });
};

const insert = async (entry) => {
    return await AuditLog.create(entry);
};

module.exports = {
    findAll,
    insert
};
