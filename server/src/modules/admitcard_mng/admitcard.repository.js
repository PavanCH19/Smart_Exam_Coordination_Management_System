const { Op } = require("sequelize");
const AdmitCard = require("./admitcard.model");

const findByStudentId = async (studentId) => {
    return await AdmitCard.findByPk(studentId);
};

const findByStudentIds = async (studentIds) => {
    return await AdmitCard.findAll({
        where: { student_id: { [Op.in]: studentIds } }
    });
};

const upsertAdmitCard = async (studentId, status) => {
    const existing = await AdmitCard.findByPk(studentId);

    if (existing) {
        existing.admit_card_status = status;
        existing.generated_at = status === "READY" ? new Date() : existing.generated_at;
        await existing.save();
        return existing;
    }

    return await AdmitCard.create({
        student_id: studentId,
        admit_card_status: status,
        generated_at: status === "READY" ? new Date() : null
    });
};

module.exports = {
    findByStudentId,
    findByStudentIds,
    upsertAdmitCard
};
