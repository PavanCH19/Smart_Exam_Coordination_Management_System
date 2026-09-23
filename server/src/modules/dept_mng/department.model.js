// NOTE: The schema only named the "departments" table without columns. These
// fields are a reasonable minimal assumption (matches the STRING `department`
// field already used on the Student/Staff models) — adjust as needed.

const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Department = sequelize.define(
    "Department",
    {
        department_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true
        },

        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },

        description: {
            type: DataTypes.STRING(500),
            allowNull: true
        }
    },
    {
        tableName: "departments",
        timestamps: false
    }
);

module.exports = Department;
