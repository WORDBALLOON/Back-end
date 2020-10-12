const router = require("express").Router();
const controller = require("./main.controller");

router.get("/viewtop", controller.viewtop);

module.exports = router;
