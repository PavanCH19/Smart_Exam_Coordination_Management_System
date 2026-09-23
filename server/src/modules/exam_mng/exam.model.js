const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const Subject = require("../subject_mng/subject.model");

const Exam = sequelize.define(
    "Exam",
    {
        exam_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Subject,
                key: "subject_id"
            }
        },

        department: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        semester: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        exam_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },

        start_time: {
            type: DataTypes.STRING(5), // "HH:MM"
            allowNull: false
        },

        end_time: {
            type: DataTypes.STRING(5),
            allowNull: false
        },

        status: {
            type: DataTypes.ENUM("SCHEDULED", "COMPLETED", "CANCELLED"),
            allowNull: false,
            defaultValue: "SCHEDULED"
        }
    },
    {
        tableName: "exams",
        timestamps: false
    }
);

Exam.belongsTo(Subject, { foreignKey: "subject_id" });

module.exports = Exam;
