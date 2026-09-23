const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const Exam = require("../exam_mng/exam.model");
const Room = require("../room_mng/room.model");

const RoomAllocation = sequelize.define(
    "RoomAllocation",
    {
        allocation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Exam, key: "exam_id" }
        },

        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Room, key: "room_id" }
        },

        student_count: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "room_allocations",
        timestamps: false
    }
);

RoomAllocation.belongsTo(Room, { foreignKey: "room_id" });
RoomAllocation.belongsTo(Exam, { foreignKey: "exam_id" });

module.exports = RoomAllocation;
