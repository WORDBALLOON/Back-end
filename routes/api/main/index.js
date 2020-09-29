const router = require("express").Router();
const controller = require("./main.controller");

router.post("/viewtop", controller.viewtop);

module.exports = router;
