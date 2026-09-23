const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Subject = sequelize.define(
    "Subject",
    {
        subject_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        subject_code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },

        subject_name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        department: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        semester: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        // Default exam duration in minutes for this subject — used by the
        // frontend to auto-suggest an exam's end time from its start time.
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "subjects",
        timestamps: false
    }
);

module.exports = Subject;
