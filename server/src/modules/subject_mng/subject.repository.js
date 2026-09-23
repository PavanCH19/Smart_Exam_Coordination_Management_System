const { Op } = require("sequelize");
const Subject = require("./subject.model");

const findSubjectById = async (subjectId) => {
    return await Subject.findByPk(subjectId);
};

const findSubjectByCode = async (subjectCode) => {
    return await Subject.findOne({
        where: { subject_code: subjectCode }
    });
};

const findAllSubjects = async (filters = {}, search, page = 1, limit = 10) => {

    const offset = (page - 1) * limit;

    const where = { ...filters };

    if (search) {
        where[Op.or] = [
            { subject_code: { [Op.like]: `%${search}%` } },
            { subject_name: { [Op.like]: `%${search}%` } }
        ];
    }

    return await Subject.findAndCountAll({
        where,
        limit,
        offset,
        order: [["subject_id", "DESC"]]
    });
};

const insertSubject = async (subject) => {
    return await Subject.create(subject);
};

const updateSubject = async (subjectId, subject) => {

    return await Subject.update(
        subject,
        {
            where: { subject_id: subjectId }
        }
    );
};

const deleteSubject = async (subjectId) => {

    return await Subject.destroy({
        where: { subject_id: subjectId }
    });
};

module.exports = {
    findSubjectById,
    findSubjectByCode,
    findAllSubjects,
    insertSubject,
    updateSubject,
    deleteSubject
};
