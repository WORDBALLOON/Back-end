const router = require("express").Router();
const auth = require("./auth");
const upload = require("./upload");
const admin = require("./admin");
var express = require("express");
var app = express();

router.use("/auth", auth);
router.use("/upload", upload);
router.use("/admin", admin);

module.exports = router;
