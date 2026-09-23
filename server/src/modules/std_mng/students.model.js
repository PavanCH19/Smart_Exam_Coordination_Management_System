const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Student = sequelize.define(
    "Student",
    {
        student_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        usn: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },

        phone: {
            type: DataTypes.STRING(15),
            allowNull: true
        },

        department: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        semester: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        section: {
            type: DataTypes.STRING(10),
            allowNull: false
        },

        course: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        tableName: "students",
        timestamps: false
    }
);

module.exports = Student;