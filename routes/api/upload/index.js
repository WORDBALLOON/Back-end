const router = require("express").Router();
const express = require("express");
const controller = require("./upload.controller");
const path = require("path");
const multer = require("multer");

let storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "upload/");
  },
  filename: function (req, file, callback) {
    let extension = path.extname(file.originalname);
    let basename = path.basename(file.originalname, extension);
    callback(null, basename + extension);
  },
});

var upload = multer({ storage: storage });

router.post("/video", upload.single("videofile"), controller.video);
router.post("/stt", controller.stt);
router.post("/textrank", controller.textrank);

module.exports = router;
