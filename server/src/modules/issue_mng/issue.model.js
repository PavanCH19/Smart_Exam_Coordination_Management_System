const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const User = require("../auth/user.model");

const Issue = sequelize.define(
    "Issue",
    {
        issue_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        issue_type: {
            type: DataTypes.ENUM("STUDENT_PROBLEM", "QUESTION_PAPER", "INFRASTRUCTURE", "INVIGILATOR", "OTHER"),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        duty_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        room_number: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        reported_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" }
        },

        reported_by_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        // NOTE: "IN PROGRESS" has a literal space — matches the frontend's
        // exact string, not "IN_PROGRESS".
        status: {
            type: DataTypes.ENUM("OPEN", "IN PROGRESS", "RESOLVED"),
            allowNull: false,
            defaultValue: "OPEN"
        },

        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "issues",
        timestamps: false
    }
);

module.exports = Issue;
