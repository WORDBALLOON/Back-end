const router = require("express").Router();
const auth = require("./auth");
const upload = require("./upload");
const admin = require("./admin");
const mypage = require("./mypage");
const detail = require("./detail");
const searchword = require("./searchword");
var express = require("express");
var app = express();

router.use("/auth", auth);
router.use("/upload", upload);
router.use("/admin", admin);
router.use("/mypage", mypage);
router.use("/detail", detail);
router.use("/searchword", searchword);

module.exports = router;
