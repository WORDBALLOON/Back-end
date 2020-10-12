const {
  Pvideo,
  Sequelize: { Op },
} = require("../../../models");
const { User } = require("../../../models");
const { History } = require("../../../models");
const { PythonShell } = require("python-shell");

const express = require("express");
const fs = require("fs"); //파일 읽어옴

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 1. 조회수 탑
/*
   GET /api/main/viewtop
    res
    {
        videoid
        videotitle
        videolink
        thumbnail
    }
*/

exports.viewtop = async (req, res, next) => {
  await Pvideo.findAll({
    attributes: ["videoid", "videotitle", "videolink", "thumbnail"],
    order: [["view", "DESC"]],
    limit: 6,
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
