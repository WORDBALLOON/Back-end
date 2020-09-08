const router = require("express").Router();
const controller = require("./upload.controller");

router.post("/video", controller.video);

module.exports = router;