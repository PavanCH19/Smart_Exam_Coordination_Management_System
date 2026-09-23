// Three route trees, mounted at different prefixes by server.js:
//   dutyRoutes      -> /exams/:examId/staff-duties  (list, create)
//   dutyItemRoutes   -> /staff-duties                (update, attendance, delete)
//   dutyMyRoutes     -> /staff/duties                (the logged-in staff member's own duties)
module.exports = {
    dutyRoutes: require("./duty.routes"),
    dutyItemRoutes: require("./duty.item.routes"),
    dutyMyRoutes: require("./duty.my.routes")
};
