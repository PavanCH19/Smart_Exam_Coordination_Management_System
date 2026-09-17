const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Staff = sequelize.define(
    "Staff",
    {
        staff_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        employee_id: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },

        department: {
            type: DataTypes.STRING(100),
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

        designation: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        availability: {
            type: DataTypes.ENUM("AVAILABLE", "UNAVAILABLE", "ON_LEAVE"),
            allowNull: false,
            defaultValue: "AVAILABLE"
        }
    },
    {
        tableName: "staff",
        timestamps: false
    }
);

module.exports = Staff;
