// Two route trees, mounted at different prefixes by server.js:
//   admitcardRoutes     -> /admit-cards         (admin)
//   admitcardSelfRoutes -> /student/admit-card  (the logged-in student's own)
module.exports = {
    admitcardRoutes: require("./admitcard.routes"),
    admitcardSelfRoutes: require("./admitcard.self.routes")
};
