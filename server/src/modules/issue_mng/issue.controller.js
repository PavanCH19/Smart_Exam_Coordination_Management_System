const issueService = require("./issue.service");

const reportIssue = async (req, res, next) => {

    try {
        const result = await issueService.reportIssue(req.body, req.user.id);

        res.status(201).json({
            success: true,
            message: "Issue reported successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getAllIssues = async (req, res, next) => {

    try {
        const result = await issueService.getAllIssues(req.query.status);

        res.status(200).json({
            success: true,
            message: "Issues fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const getMyIssues = async (req, res, next) => {

    try {
        const result = await issueService.getMyIssues(req.user.id);

        res.status(200).json({
            success: true,
            message: "Your issues fetched successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


const updateIssueStatus = async (req, res, next) => {

    try {
        const result = await issueService.updateIssueStatus(req.params.id, req.body.status);

        res.status(200).json({
            success: true,
            message: "Issue status updated successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};


module.exports = {
    reportIssue,
    getAllIssues,
    getMyIssues,
    updateIssueStatus
};
