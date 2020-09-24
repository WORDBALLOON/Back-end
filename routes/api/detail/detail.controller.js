const {
  Pvideo,
  Sequelize: { Op },
} = require("../../../models");
const { User } = require("../../../models");
const { History } = require("../../../models");

const express = require("express");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 1. 뷰 페이지
/*
    POST /api/view
    req
    {
        videoid,
        userid
    }
    res
    {
       videotitle,
       videolink,
       categoryname,
       thumbnail,
       view,
       videolike,
       keyword
    }
*/

exports.view = async (req, res, next) => {
  var videoid = req.body.videoid;
  var userid = req.body.userid;

  // 해당 비디오 아이디의 뷰 수를 받아온다.
  const views = await Pvideo.findOne({
    attributes: ["view"],
    where: {
      videoid: videoid,
    },
  })
    .then((result) => {
      return result.dataValues.view;
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

  // 뷰수를 증가한다.
  new_views = views + 1;

  // userhistory에 시청 기록 추가
  History.create({
    userid: userid,
    videoid: videoid,
    userlike: 0,
  });

  // 증가한 뷰수를 다시 db에 업데이트한 후 데이터 보낸다.
  const view_db = await Pvideo.update(
    {
      view: new_views,
    },
    {
      where: { videoid: videoid },
    }
  )
    .then((result) => {
      Pvideo.findOne({
        attributes: [
          "videotitle",
          "videolink",
          "categoryname",
          "thumbnail",
          "view",
          "videolike",
          "keyword",
        ],
        where: {
          videoid: videoid,
        },
      })
        .then((results) => {
          res.json(results);
        })
        .catch((errs) => {
          console.log(errs);
          next(errs);
        });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

// 2. 뷰페이지-좋아요 눌렀을 때
/*
    POST /api/like
    req
    {
        videoid,
        userid
    }
    res
    {
        message : 좋아요 눌렀습니다.
    }
    */

exports.like = async (req, res, next) => {
  var videoid = req.body.videoid;
  var userid = req.body.userid;

  // 뷰페이지의 좋아요 수 빼오기
  const likes = await Pvideo.findOne({
    attributes: ["videolike"],
    where: {
      videoid: videoid,
    },
  })
    .then((result) => {
      return result.dataValues.videolike;
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

  // 좋아요수 증가
  new_likes = likes + 1;

  // 사용자의 영상 좋아요수 증가
  await Pvideo.update(
    {
      videolike: new_likes,
    },
    {
      where: { videoid: videoid },
    }
  )
    .then((result) => {
      res.send("좋아요 눌렀습니다.");
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

  //userhistory 좋아요
  await History.update(
    {
      userlike: 1,
    },
    {
      where: { userid: userid, videoid: videoid },
    }
  )
    .then((result) => {
      console.log(result);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
