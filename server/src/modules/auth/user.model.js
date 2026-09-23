const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("ADMIN", "STAFF", "STUDENT"),
            allowNull: false,
            defaultValue: "STUDENT"
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
            allowNull: false,
            defaultValue: "ACTIVE"
        },
        // Links a login account back to its profile record so the frontend
        // can call student/staff-scoped endpoints straight from the logged-in
        // user object (e.g. GET /students/:id/exams needs user.student_id).
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        employee_id: {
            type: DataTypes.STRING(50),
            allowNull: true
        }
    },
    {
        tableName: "users",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at"
    }
);

module.exports = User;
