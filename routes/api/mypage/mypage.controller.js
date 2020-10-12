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

// 1. 워드클라우드
/*
    POST /api/mypage/wordcloud/
    req
    {
        userid
    }
    res
    {
        wordcloud img
    }
*/

exports.wordcloud = async (req, res, next) => {
  var userid = req.body.userid;

  // 사용자가 본 영상 불러오기
  const videolist = await History.findAll({
    attributes: ["videoid"],
    where: {
      userid: userid,
    },
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

  // 영상의 키워드 불러오기
  const keywordlist = await Pvideo.findAll({
    attributes: ["keyword"],
    where: {
      videoid: { [Op.in]: videolist },
    },
  })
    .then((result) => {
      var keyword_list = [];
      for (var i = 0; i < result.length; i++) {
        keyword_list[i] = result[i].dataValues.keyword;
      }
      console.log(keyword_list);
      return keyword_list;
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

  // 키워드를 이용하여 워드클라우드 실행
  var options = {
    mode: "text",
    pythonPath: "",
    pythonOptions: ["-u"],
    scriptPath: "../server/routes/api/mypage",
    args: [keywordlist],
  };

  PythonShell.run("startwordcloud.py", options, function (err, results) {
    if (err) console.log("err msg : ", err);
    console.log("워드클라우드 파일 저장");

    // 워드클라우드 파일 전송
    var filename = "./upload/wordcloud.jpg";
    fs.readFile(
      filename, //파일 읽기
      function (err, data) {
        //http의 헤더정보를 클라이언트쪽으로 출력
        //image/jpg : jpg 이미지 파일을 전송한다
        //write 로 보낼 내용을 입력
        res.writeHead(200, { "Context-Type": "image/jpg" }); //보낼 헤더를 만듬
        res.write(data); //본문을 만들고
        res.end(); //클라이언트에게 응답을 전송한다.
        console.log("워드클라우드 파일 전송 완료");
      }
    );
  });
};

// 2. 업로드한 영상
/*
    POST /api/mypage/uploader/
    req
    {
        userid
    }
    res
    {
        videolink,
        videotitle,
        categoryname
    }
*/

exports.uploader = async (req, res, next) => {
  var userid = req.body.userid;

  await Pvideo.findAll({
    attributes: [
      "videolink",
      "videotitle",
      "categoryname",
      "thumbnail",
      "view",
      "videolike",
    ],
    where: {
      uploader: userid,
    },
  })
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
