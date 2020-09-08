const router = require("express").Router();
const auth = require("./auth");
const upload = require("./upload");
var express = require("express");
var app = express();

router.use("/auth", auth);
router.use("/upload", upload);

module.exports = router;
