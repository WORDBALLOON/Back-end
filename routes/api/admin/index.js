const router = require("express").Router();
const express = require("express");
const controller = require("./admin.controller");
const path = require("path");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
require("dotenv").config({ path: __dirname + "\\" + ".env" });

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: "wordballooncsv",
    key(req, file, cb) {
      cb(null, `${path.basename(file.originalname)}`);
    },
  }),
});

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

router.get("/list", controller.list);

router.get("/edit/:videoid", controller.edit);

router.post("/change", upload.single("subtitle"), controller.change);

router.get("/confirm/:videoid", controller.confirm);

router.get("/complete/:videoid", controller.complete);

module.exports = router;
