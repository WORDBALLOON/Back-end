const router = require("express").Router();
const express = require("express");
const controller = require("./admin.controller");

router.get("/list", controller.list);

router.post("/edit", controller.edit);

router.post("/change", controller.change);

router.post("/confirm", controller.confirm);

router.get("/complete", controller.complete);

module.exports = router;
