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
