const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const RoomAllocation = require("../allocation_mng/allocation.model");
const Student = require("../std_mng/students.model");

const Seat = sequelize.define(
    "Seat",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        allocation_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: RoomAllocation, key: "allocation_id" }
        },

        seat_number: {
            type: DataTypes.STRING(10),
            allowNull: false
        },

        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Student, key: "student_id" }
        }
    },
    {
        tableName: "seating",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["allocation_id", "seat_number"] },
            { unique: true, fields: ["allocation_id", "student_id"] }
        ]
    }
);

Seat.belongsTo(Student, { foreignKey: "student_id" });
Seat.belongsTo(RoomAllocation, { foreignKey: "allocation_id" });

module.exports = Seat;
