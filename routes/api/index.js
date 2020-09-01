const router = require("express").Router();
const auth = require("./auth");
var express = require("express");
var app = express();

router.use("/auth", auth);

module.exports = router;
