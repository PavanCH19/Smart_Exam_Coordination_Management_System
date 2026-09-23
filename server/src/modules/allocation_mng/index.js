// Two route trees, mounted at different prefixes by server.js:
//   allocationRoutes      -> /exams/:examId/room-allocations  (list, create)
//   allocationItemRoutes  -> /room-allocations                (update, delete)
module.exports = {
    allocationRoutes: require("./allocation.routes"),
    allocationItemRoutes: require("./allocation.item.routes")
};
