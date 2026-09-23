const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const User = require("../auth/user.model");

const Notification = sequelize.define(
    "Notification",
    {
        notification_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        title: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        message: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        audience: {
            type: DataTypes.ENUM("ALL", "STUDENTS", "STAFF"),
            allowNull: false,
            defaultValue: "ALL"
        },

        type: {
            type: DataTypes.ENUM("INFO", "REMINDER", "ALERT"),
            allowNull: false,
            defaultValue: "INFO"
        },

        sent_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },

        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: User, key: "id" }
        },

        recipient_user_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: User, key: "id" }
        }
    },
    {
        tableName: "notifications",
        timestamps: false
    }
);

const NotificationRead = sequelize.define(
    "NotificationRead",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        notification_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Notification, key: "notification_id" }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" }
        },
        read_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "notification_reads",
        timestamps: false,
        indexes: [
            { unique: true, fields: ["notification_id", "user_id"] }
        ]
    }
);

module.exports = { Notification, NotificationRead };
