const express = require("express");
const errorHandler = require("./shared/middleware/errorHandler");
const sequelize = require("./config/database");
require("dotenv").config();

const authRoutes = require("./modules/auth");
const studentsRoute = require("./modules/std_mng")

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/students", studentsRoute);

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ success: true, message: "OK" });
});

app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected successfully");

        await sequelize.sync();
        console.log("Database synced");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    start();
}

module.exports = app;
