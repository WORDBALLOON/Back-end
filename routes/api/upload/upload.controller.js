const { Pvideo } = require("../../../models");
const { Videokey } = require("../../../models");
const { PythonShell } = require("python-shell");

const express = require("express");
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 업로드 기능
/*
    POST /api/upload/
    {
        videofile,
        inbucket : "ko-KR", "en-US",
        pvideotitle
    }
*/

exports.video = async (req, res, next) => {
  //res.send("video 라우터 작동중");
  // submit 시, enctype="multipart/form-data"

  // video 로컬에 저장
  var videofile = req.file.videofile;
  var inbucket = req.body.inbucket;
  var pvideotitle = req.body.pvideotitle;

  //console.log(videofile);
  console.log(inbucket);
  console.log(pvideotitle);

  let file = req.file;

  // 4. 파일 정보
  let result = {
    originalName: file.originalname,
    size: file.size,
  };

  console.log(file);

  // test용 : res.json(result);

  //썸네일 제작
  // 제작된 썸네일 이름 : tn
  ffmpeg("upload/" + file.filename).screenshots({
    // 썸네일 제작 시, 영상의 20%를 가져와서 만든다.
    count: 1,
    filename: pvideotitle + ".png",
    folder: "upload/",
  });

  //S3에 동영상이랑 썸네일 업로드

  //파이썬 STT연결 --> S3 업로드

  var options = {
    mode: "text",
    pythonPath: "",
    pythonOptions: ["-u"],
    scriptPath: "../server/stt",
    args: [inbucket, pvideotitle],
  };

  // inbucket="en-us", "ko-kr"

  PythonShell.run("translatevideo.py", options, function (err, results) {
    if (err) console.log("err msg : ", err);
    console.log("stt 전송 finished: %j", results);
  });

  //TextRank

  var csv_filename = pvideotitle + "_sentence.csv";

  var options = {
    mode: "text",
    pythonPath: "",
    pythonOptions: ["-u"],
    scriptPath: "../server/STT/Text_Rank",
    args: csv_filename, // pvideotitle_sentence.csv
  };
  console.log("전달한 파일 이름" + csv_filename);

  // 만약 영어 text-rank 돌려야 한다면
  if (inbucket == "en-us") {
    PythonShell.run("tr_eng.py", options, function (err, results) {
      if (err) console.log("err msg : ", err);
      console.log(results);
    });
  }

  // 값이 안와요

  //TextRank 값, STT Script 링크, 영상 링크, 썸네일 링크 데이터베이스에 저장

  //res: 이미지 링크로 전송, textrank 리스크 값으로 전송
};
