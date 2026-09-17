// NOTE: The schema only named the "courses" table without columns. These fields
// are a reasonable minimal assumption (matches the STRING `course` field already
// used on the Student model, plus a link back to departments) — adjust as needed.

const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const Department = require("./department.model");

const Course = sequelize.define(
    "Course",
    {
        course_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },

        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Department,
                key: "department_id"
            }
        },

        duration_semesters: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: "courses",
        timestamps: false
    }
);

Course.belongsTo(Department, { foreignKey: "department_id" });

module.exports = Course;
