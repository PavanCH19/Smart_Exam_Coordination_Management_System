const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");
const Student = require("../std_mng/students.model");

const AdmitCard = sequelize.define(
    "AdmitCard",
    {
        student_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: Student, key: "student_id" }
        },

        admit_card_status: {
            type: DataTypes.ENUM("PENDING", "READY"),
            allowNull: false,
            defaultValue: "PENDING"
        },

        generated_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        tableName: "admit_cards",
        timestamps: false
    }
);

AdmitCard.belongsTo(Student, { foreignKey: "student_id" });

module.exports = AdmitCard;
