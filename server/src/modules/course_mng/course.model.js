// Matches the frontend's CourseForm exactly: department is a plain string
// (same convention as Student/Staff department fields), not a foreign key.
// This keeps courses consistent with the rest of the schema, where
// "department" is always a denormalized string rather than a strict FK.

const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Course = sequelize.define(
    "Course",
    {
        course_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        name: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },

        department: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        duration_years: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        total_semesters: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "courses",
        timestamps: false
    }
);

module.exports = Course;
