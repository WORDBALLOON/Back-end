const { 
    Pvideo, 
    Sequelize: {Op} 
} = require("../../../models");
const { User } = require("../../../models");
const { History } = require("../../../models");
const { PythonShell } = require("python-shell");

const express = require("express");
const fs = require("fs"); //파일 읽어옴

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 1. 검색 페이지
/*
    POST /api/searchword/title
    req
    {
        searchword : 검색 요청 단어
    }
    res
    {
        videoid,
        videotitle,
        videolink,
        thumbnail,
        view,
        uploader
    }
*/

exports.title = async (req, res, next) => {
    var searchword = req.body.searchword;

    await Pvideo.findAll({
        attributes: ["videotitle", "videolink", "thumbnail", "videoid", "view", "uploader",],
        where:{
            [Op.or]: [
                {
                    videotitle: {
                        [Op.like]: "%" + searchword + "%"
                    }
                },
                {
                    keyword: {
                        [Op.like]: "%" + searchword + "%"
                    }
                }
            ]
        }
    })
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });
};

// 2. 카테고리
/*
    GET /api/searchword/catg/:categoryid
    res
    {
        videoid,
        videotitle,
        videolink,
        thumbnail,
        view,
        videolike,
        uploader,
    }
*/

exports.catg = async (req, res, next) => {
    const categoryid = req.params.categoryid;

    await Pvideo.findAll({
        attributes: ["videotitle", "videolink", "thumbnail", "videoid", "view", "videolike", "uploader"],
        where:{
            categoryid : categoryid
        }
    })
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });
};

// 3. 내동영상 : 사용자가 좋아요 표시한 영상
/*
  GET /api/searchword/mylike/:userid
  res
  {
      videoid,
      videotitle,
      videolink,
      thumbnail,
      view,
      videolike,
      uploader,
  }
*/
exports.mylike = async (req, res, next) => {
    const userid = req.params.userid;
    
    const vid = await History.findAll({
        attributes: [ "videoid" ],
        where: {
            userid: userid,
            userlike: 1,
        }
    })
    .then((result) => {  
        var videoid_list = [];
        for (var i = 0; i < result.length; i++) {
            videoid_list[i] = result[i].videoid;
        }
        console.log(videoid_list);
        return videoid_list;
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });

    await Pvideo.findAll({
        attributes: [ "videoid", "videotitle", "videolink", "thumbnail", "view", "videolike", "uploader" ],
        where: {
            videoid: { [Op.in]: vid },
        }
    })
    .then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });
};

// 4. 내동영상 : 사용자가 최근 본 영상
/*
    GET /api/searchword/mywatch/:userid
    res
    {
        videoid,
        videotitle,
        videolink,
        thumbnail,
        view,
        videolike,
        uploader,
    }
*/
exports.mywatch = async (req, res, next) => {
    const userid = req.params.userid;
  
    const vid = await History.findAll({
        attributes: ["videoid"],
        where: {
            userid: userid,
        },
    })
    .then((result) => {
        var videoid_list = [];
        for (var i = 0; i < result.length; i++) {
            videoid_list[i] = result[i].dataValues.videoid;
        }
        console.log(videoid_list);
        return videoid_list;
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });
  
    await Pvideo.findAll({
        attributes: ["videoid", "videotitle", "videolink", "thumbnail", "view", "videolike", "uploader"],
        where: {
            videoid: { [Op.in]: vid },
        },
        limit: 3,
        order : [["videotitle", "DESC"]],
    }).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        console.log(err);
        next(err);
    });
  };