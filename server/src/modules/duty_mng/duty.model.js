const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const Exam = require("../exam_mng/exam.model");
const Room = require("../room_mng/room.model");
const Staff = require("../staff_mng/staff.model");

const StaffDuty = sequelize.define(
    "StaffDuty",
    {
        duty_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Exam, key: "exam_id" }
        },

        staff_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Staff, key: "staff_id" }
        },

        room_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Room, key: "room_id" }
        },

        duty_type: {
            type: DataTypes.ENUM("MAIN", "STANDBY"),
            allowNull: false,
            defaultValue: "MAIN"
        },

        status: {
            type: DataTypes.ENUM("ASSIGNED", "PRESENT", "ABSENT"),
            allowNull: false,
            defaultValue: "ASSIGNED"
        }
    },
    {
        tableName: "staff_duties",
        timestamps: false
    }
);

StaffDuty.belongsTo(Staff, { foreignKey: "staff_id" });
StaffDuty.belongsTo(Room, { foreignKey: "room_id" });
StaffDuty.belongsTo(Exam, { foreignKey: "exam_id" });

module.exports = StaffDuty;
