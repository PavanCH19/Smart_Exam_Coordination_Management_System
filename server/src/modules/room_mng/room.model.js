const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Room = sequelize.define(
    "Room",
    {
        room_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        room_number: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true
        },

        building: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        floor: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        capacity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        room_type: {
            type: DataTypes.ENUM("Classroom", "Hall", "Laboratory", "Auditorium", "Seminar Hall"),
            allowNull: false,
            defaultValue: "Classroom"
        },

        status: {
            type: DataTypes.ENUM("AVAILABLE", "UNAVAILABLE", "MAINTENANCE"),
            allowNull: false,
            defaultValue: "AVAILABLE"
        }
    },
    {
        tableName: "rooms",
        timestamps: false
    }
);

module.exports = Room;
