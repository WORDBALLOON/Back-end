const { Pvideo } = require("../../../models");
const { PythonShell } = require("python-shell");

const AWS = require("aws-sdk"); //s3에 접근     npm install aws-sdk
const fs = require("fs"); //파일 읽어옴
const express = require("express");
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");
var iconv = require("iconv-lite");
//const { PassThrough } = require("stream");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 업로드 기능
/*
    POST /api/upload/
    {
        videofile,
        inbucket : "ko-kr", "en-us",
        pvideotitle
    }
*/

exports.video = async (req, res, next) => {
  // res.send("video 라우터 작동중");
  // submit 시, enctype="multipart/form-data"

  // video 로컬에 저장
  var videofile = req.file.videofile;
  var inbucket = req.body.inbucket;
  var pvideotitle = req.body.pvideotitle;

  //console.log(videofile);
  console.log(inbucket);
  console.log(pvideotitle);

  let file = req.file;

  // 파일 정보
  let result = {
    originalName: file.originalname,
    size: file.size,
  };

  function rename(result) {
    fs.rename(
      "./upload/" + result.originalName,
      "./upload/" + pvideotitle + ".mp4",
      function (err) {
        if (err) throw err;
        console.log("File Renamed");
      }
    );
  }

  console.log(file);

  // test용 : res.json(result);

  // 1. 썸네일 제작, 제작된 썸네일 이름 : tn
  // 썸네일 제작 시, 영상의 20%를 가져와서 만든다.
  function thumbFunc() {
    ffmpeg("upload/" + pvideotitle + ".mp4").screenshots({
      // 썸네일 제작 시, 영상의 20%를 가져와서 만든다.
      count: 1,
      filename: pvideotitle + ".png",
      folder: "upload/",
      size: "800x480",
    });
    console.log("1. 썸네일 제작 완료");
  }

  // 썸네일 제작 함수 불러오기
  //thumbFunc(file);

  // s3객체 생성
  const s3 = new AWS.S3({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: "ap-northeast-2",
  });

  // 2. S3에 동영상이랑 썸네일 업로드
  var vl; // 동영상 링크
  var tl; // 썸네일 링크

  function uploadS3(s3) {
    // s3 썸네일 업로드
    const thumbnailload = {
      Bucket: "wordballoon",
      Key: inbucket + "/" + pvideotitle + ".png",
      ACL: "public-read",
      Body: fs.createReadStream("./upload/" + pvideotitle + ".png"),
      ContentType: "image/png",
    };

    // s3에 동영상 업로드를 위해 객체 생성
    const videoupload = {
      Bucket: "wordballoon",
      Key: inbucket + "/" + pvideotitle + ".mp4",
      ACL: "public-read",
      Body: fs.createReadStream("./upload/" + pvideotitle + ".mp4"),
      ContentType: "video/mp4",
    };

    s3.upload(thumbnailload, function (err, data) {
      if (err) {
        console.log("s3 thumbnail upload err: ", err);
      }
      console.log("thumbnail upload complete");
      console.log("data: ", data);
      tl = data.Location;
    });

    // s3에 동영상 업로드
    s3.upload(videoupload, function (err, data) {
      if (err) {
        console.log("s3 video upload err: ", err);
      }
      console.log("video upload complete");
      console.log("data: ", data);
      vl = data.Location;
    });

    console.log("2. 썸네일, 영상 업로드 완료");
  }
  // 업로드 함수
  //uploadS3(s3);

  // stt s3 업로드 준비
  function sttFunc() {
    // 3. 파이썬 STT연결 --> S3 업로드
    var options = {
      mode: "text",
      pythonPath: "",
      pythonOptions: ["-u"],
      scriptPath: "../server/stt",
      args: [inbucket, pvideotitle],
    };

    PythonShell.run("translatevideo.py", options, function (err, results) {
      if (err) console.log("err msg : ", err);
      console.log("stt 전송 finished: %j", results);
    });
    console.log("3. stt 완료");
  }

  //sttFunc();

  // 4. TextRank

  function trFunc(pvideotitle) {
    var csv_filename = pvideotitle + "_sentence.csv";

    var options = {
      mode: "text",
      pythonPath: "",
      pythonOptions: ["-u"],
      scriptPath: "../server/stt/Text_Rank",
      args: csv_filename, // pvideotitle_sentence.csv
    };
    console.log("전달한 파일 이름" + csv_filename);

    var results = new Array();
    // 만약 영어 text-rank 돌려야 한다면
    if (inbucket == "en-us") {
      PythonShell.run("tr_eng.py", options, function (err, results) {
        if (err) {
          console.log("err msg : ", err);
        }
        console.log("result: " + results);
        //keyword
        keyword = results.join("/");

        //db 접근
        //videoid
        //var d = new now()
        //videoid = d.getTime()
        videoid = count + 1;

        //categoryid
        categoryid = 0; // inbuket = "en-us"

        //categoryname
        categoryname = "english";

        //videotitle
        videotitle = pvideotitle;

        //videolink
        videolink = vl;
        console.log("videolink: " + videolink);

        //thumbnail
        thumbnail = tl;
        console.log("thumbnail: " + thumbnail);

        //subtitle
        subtitle =
          "https://wordballooncsv.s3.ap-northeast-2.amazonaws.com/" +
          csv_filename;

        //view
        view = 0;

        //videolike
        videolike = 0;

        //convertflag
        convertflag = 0;

        Pvideo.create({
          videoid: videoid,
          categoryid: categoryid,
          categoryname: categoryname,
          videotitle: videotitle,
          videolink: videolink,
          thumbnail: thumbnail,
          subtitle: subtitle,
          view: view,
          videolike: videolike,
          convertflag: convertflag,
          keyword: keyword,
        }).then((result) => {
          if (!result) {
            console.log("db 저장 실패");
            res.json({
              status: 500,
              success: false,
              message: "db 저장 실패",
            });
            return;
          } else {
            console.log("db 저장 성공");
            res.json({
              status: 200,
              success: true,
              message: "db 저장 성공",
              thumbnail: thumbnail,
              keyword: keyword,
            });
            return;
            // 전달해야할 것이 있을 때에는
            //console.log(result.dataValues);
          }
        });
      });

      //console.log("result = " + results);
    } else {
      PythonShell.run("tr_kr.py", options, function (err, results) {
        if (err) {
          console.log("err msg : ", err);
        }
        console.log("result: " + results);
        //keyword = result;

        // 한글 깨짐 방지 위해 utf-8디코딩
        keyword = results.join("/");
        keyword = iconv.encode(keyword, "utf-8").toString();
        console.log("인코딩후" + keyword);

        //db 접근
        //videoid
        //var d = new now()
        //videoid = d.getTime()
        videoid = count + 1;

        //categoryid
        categoryid = 1; // inbuket = "ko-kr"

        //categoryname
        categoryname = "korean";

        //videotitle
        videotitle = pvideotitle;

        //videolink
        videolink = vl;
        console.log("videolink: " + videolink);

        //thumbnail
        thumbnail = tl;
        console.log("thumbnail: " + thumbnail);

        //subtitle
        subtitle =
          "https://wordballooncsv.s3.ap-northeast-2.amazonaws.com/" +
          csv_filename;

        //view
        view = 0;

        //videolike
        videolike = 0;

        //convertflag
        convertflag = 0;

        Pvideo.create({
          videoid: videoid,
          categoryid: categoryid,
          categoryname: categoryname,
          videotitle: videotitle,
          videolink: videolink,
          thumbnail: thumbnail,
          subtitle: subtitle,
          view: view,
          videolike: videolike,
          convertflag: convertflag,
          keyword: keyword,
        }).then((result) => {
          if (!result) {
            console.log("db 저장 실패");
            res.json({
              status: 500,
              success: false,
              message: "db 저장 실패",
            });
            return;
          } else {
            console.log("db 저장 성공");
            res.json({
              status: 200,
              success: true,
              message: "db 저장 성공",
              thumbnail: thumbnail,
              keyword: keyword,
            });
            return;
            // 전달해야할 것이 있을 때에는
            //console.log(result.dataValues);
          }
        });
      });

      //console.log("result = " + results);
    }

    console.log("4. 텍스트랭크 완료");
  }

  Pvideo.count().then((c) => {
    console.log("count: " + c);
    count = c;
  });

  setTimeout(rename, 2000, result);
  setTimeout(thumbFunc, 4000);
  setTimeout(uploadS3, 10000, s3);
  setTimeout(sttFunc, 20000);
  setTimeout(trFunc, 90000, pvideotitle);

  // 5. TextRank 값, STT Script 링크, 영상 링크, 썸네일 링크 데이터베이스에 저장

  // res: 이미지 링크로 전송, textrank 리스크 값으로 전송
};
