const { Pvideo } = require("../../../models");
const { PythonShell } = require("python-shell");

const AWS = require("aws-sdk"); //s3에 접근     npm install aws-sdk
const fs = require("fs"); //파일 읽어옴
const express = require("express");
const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 업로드 기능
/*
    POST /api/upload/
    req
    {
        videofile,
        inbucket : "ko-kr", "en-us",
        pvideotitle,
        uploader
    }
    res
    {
      thumbnail,
      keyword
    }
*/

exports.video = async (req, res, next) => {
  // res.send("video 라우터 작동중");
  // submit 시, enctype="multipart/form-data"

  // video 로컬에 저장
  var videofile = req.file.videofile;
  var inbucket = req.body.inbucket;
  var pvideotitle = req.body.pvideotitle;
  var uploader = req.body.uploader;

  //console.log(videofile);
  console.log("inbucket : " + inbucket);
  console.log("pvideotitle : " + pvideotitle);
  console.log("uploader : " + uploader);

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
        return pvideotitle + ".mp4";
      }
    );
  }

  console.log(file);

  // test용 : res.json(result);

  // 1. 썸네일 제작, 제작된 썸네일 이름 : tn
  // 썸네일 제작 시, 영상의 20%를 가져와서 만든다.
  async function thumbFunc(rename) {
    var process = new ffmpeg("upload/" + rename);
    process.screenshots({
      // 썸네일 제작 시, 영상의 20%를 가져와서 만든다.
      count: 1,
      filename: pvideotitle + ".png",
      folder: "upload/",
      size: "800x480",
    });
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

  async function uploadS3(s3, filename) {
    // s3 썸네일 업로드
    const thumbnailload = {
      Bucket: "wordballoon",
      Key: inbucket + "/" + filename,
      ACL: "public-read",
      Body: fs.createReadStream("./upload/" + filename),
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
    })
      .then((result) => {
        console.log("1. 썸네일 업로드 완료");
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });

    // s3에 동영상 업로드
    s3.upload(videoupload, function (err, data) {
      if (err) {
        console.log("s3 video upload err: ", err);
      }
      console.log("video upload complete");
      console.log("data: ", data);
      vl = data.Location;
    })
      .then((result) => {
        console.log("2. 동영상 업로드 완료");
        return "s3 finish";
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }
  // 업로드 함수
  //uploadS3(s3);

  // stt s3 업로드 준비
  async function sttFunc(s3result) {
    // 3. 파이썬 STT연결 --> S3 업로드
    s3result = s3result;
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
    })
      .then((result) => {
        console.log("3. stt 완료");
        return "stt done";
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  }

  //sttFunc();

  // 4. TextRank

  async function trFunc(pvideotitle, sttresult) {
    sttresult = sttresult;
    var csv_filename = pvideotitle + ".csv";

    var options = {
      mode: "text",
      pythonPath: "",
      pythonOptions: ["-u"],
      scriptPath: "../server/stt/Text_Rank",
      args: csv_filename, // pvideotitle.csv
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
          uploader: uploader,
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
        keyword = result;
        keyword = results.join("/");

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
          uploader: uploader,
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

  // setTimeout(rename, 2000, result);
  // setTimeout(thumbFunc, 4000);
  // setTimeout(uploadS3, 10000, s3);
  // setTimeout(sttFunc, 20000);
  // setTimeout(trFunc, 90000, pvideotitle);

  const rename2 = await rename(result);
  const filename = await thumbFunc(rename2);
  const s3result = await uploadS3(s3, filename);
  const sttresult = await sttFunc(s3result);
  await trFunc(pvideotitle, sttresult);

  // 5. TextRank 값, STT Script 링크, 영상 링크, 썸네일 링크 데이터베이스에 저장

  // res: 이미지 링크로 전송, textrank 리스크 값으로 전송
};
