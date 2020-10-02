const router = require("express").Router();
const controller = require("./auth.controller");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", controller.logout);
// 정보변경
router.post("/update", controller.update);

module.exports = router;
