const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const Exam = require("../exam_mng/exam.model");
const Student = require("../std_mng/students.model");

const Attendance = sequelize.define(
    "Attendance",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Exam, key: "exam_id" }
        },

        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Student, key: "student_id" }
        },

        // Denormalized at write time from the seating arrangement, so the
        // roster can display venue info without an extra join on every read.
        room_number: {
            type: DataTypes.STRING(20),
            allowNull: true
        },

        seat_number: {
            type: DataTypes.STRING(10),
            allowNull: true
        },

        status: {
            type: DataTypes.ENUM("PRESENT", "ABSENT"),
            allowNull: true
        }
    },
    {
        tableName: "attendance",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["exam_id", "student_id"] }
        ]
    }
);

module.exports = Attendance;

Attendance.belongsTo(Exam, { foreignKey: "exam_id" });
Attendance.belongsTo(Student, { foreignKey: "student_id" });
