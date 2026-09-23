const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const AuditLog = sequelize.define(
    "AuditLog",
    {
        log_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        action: {
            type: DataTypes.STRING(100),
            allowNull: false
        },

        performed_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        performed_by_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        target: {
            type: DataTypes.STRING(255),
            allowNull: true
        },

        details: {
            type: DataTypes.TEXT,
            allowNull: true
        },

        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        tableName: "audit_logs",
        timestamps: false
    }
);

module.exports = AuditLog;
