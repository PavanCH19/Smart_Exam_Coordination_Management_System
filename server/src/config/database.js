const { Sequelize } = require("sequelize");
require("dotenv").config();

const parseBooleanEnv = (value, variableName) => {
    if (value === undefined || value === "") {
        return false;
    }

    const normalizedValue = value.toLowerCase();
    if (normalizedValue === "true") {
        return true;
    }
    if (normalizedValue === "false") {
        return false;
    }

    throw new Error(`${variableName} must be either true or false`);
};

const ddlMode = (process.env.DB_DDL_AUTO || "none").toLowerCase();
const syncOptionsByMode = {
    create: { force: true },
    update: { alter: true },
    none: {},
};

if (!Object.prototype.hasOwnProperty.call(syncOptionsByMode, ddlMode)) {
    throw new Error("DB_DDL_AUTO must be one of: create, update, none");
}

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "mysql",
        logging: parseBooleanEnv(process.env.DB_SHOW_SQL, "DB_SHOW_SQL")
            ? console.log
            : false,
    }
);

sequelize.syncOptions = syncOptionsByMode[ddlMode];

module.exports = sequelize;
