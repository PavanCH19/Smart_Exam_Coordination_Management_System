const Issue = require("./issue.model");

const findAll = async (filters = {}) => {
    return await Issue.findAll({ where: filters, order: [["created_at", "DESC"]] });
};

const findById = async (issueId) => {
    return await Issue.findByPk(issueId);
};

const findByReporter = async (reportedBy) => {
    return await Issue.findAll({ where: { reported_by: reportedBy }, order: [["created_at", "DESC"]] });
};

const insert = async (issue) => {
    return await Issue.create(issue);
};

const updateStatus = async (issueId, status) => {
    return await Issue.update({ status }, { where: { issue_id: issueId } });
};

module.exports = {
    findAll,
    findById,
    findByReporter,
    insert,
    updateStatus
};
