// This module exposes two route trees mounted at different prefixes by
// server.js: /exams (CRUD) and /timetable (view + generate).
module.exports = {
    examRoutes: require("./exam.routes"),
    timetableRoutes: require("./timetable.routes")
};
