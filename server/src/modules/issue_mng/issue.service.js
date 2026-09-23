const issueRepository = require("./issue.repository");
const authRepository = require("../auth/auth.repository");
const ApiError = require("../../shared/utils/ApiError");

const reportIssue = async ({ issue_type, description, duty_id }, userId) => {

    const user = await authRepository.findUserById(userId);

    let roomNumber = null;

    if (duty_id) {
        const StaffDuty = require("../duty_mng/duty.model");
        const Room = require("../room_mng/room.model");

        const duty = await StaffDuty.findByPk(duty_id, {
            include: [{ model: Room, attributes: ["room_number"] }]
        });

        roomNumber = duty?.Room?.room_number || null;
    }

    return await issueRepository.insert({
        issue_type,
        description,
        duty_id: duty_id || null,
        room_number: roomNumber,
        reported_by: userId,
        reported_by_name: user?.name || "Unknown",
        status: "OPEN"
    });
};

const getAllIssues = async (status) => {
    const filters = status ? { status } : {};
    return await issueRepository.findAll(filters);
};

const getMyIssues = async (userId) => {
    return await issueRepository.findByReporter(userId);
};

const updateIssueStatus = async (issueId, status) => {

    const existing = await issueRepository.findById(issueId);
    if (!existing) {
        throw new ApiError(404, "Issue not found");
    }

    await issueRepository.updateStatus(issueId, status);

    return await issueRepository.findById(issueId);
};

module.exports = {
    reportIssue,
    getAllIssues,
    getMyIssues,
    updateIssueStatus
};
