const {
  Pvideo,
  Sequelize: { Op },
} = require("../../../models");
const { PythonShell } = require("python-shell");

const AWS = require("aws-sdk"); //s3에 접근     npm install aws-sdk
const fs = require("fs"); //파일 읽어옴
const express = require("express");

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: "ap-northeast-2",
});

var vl;

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 관리자 페이지1 기능: list --> convertflag = 0 인 영상 불러오기
/*
  POST /api/list/
  res
  {
      videoid,
      categoryname,
      videotitle,
      uploader
  }
*/

exports.list = async (req, res, next) => {
  //convertflag = 0 인 영상 불러오기
  Pvideo.findAll({
    attributes: ["videoid", "categoryname", "videotitle", "uploader"],
    where: {
      convertflag: 0,
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

// 관리자 페이지2 기능: edit
/*
  GET /api/edit/$videoid
  req
  {
      videoid
  }
  res
  {
      convertflag = 1,
      videotitle,
      videolink,
      subtitle
  }
*/

exports.edit = async (req, res, next) => {
  var videoid = req.params.videoid;

  console.log("videoid : " + videoid);

  Pvideo.Update(
    {
      convertflag: 1,
    },
    {
      where: { videoid: videoid },
    }
  );

  Pvideo.findAll({
    attributes: ["videotitle", "videolink", "subtitle"],
    where: {
      videoid: videoid,
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

// 관리자 페이지3 기능: change
/*
  POST /api/change
  req
  {
      videoid,
      subtitle(csv),
      converflag = 2
  }
  프론트 : 변환 중, 백 : 영상처리
  res
  {
      message : 변환완료,
      converflag = 3
  }
*/

exports.change = async (req, res, next) => {
  var subtitle = req.body.subtitle;
  var videoid = req.body.videoid;

  // 동영상 이름 찾기
  var videotitle = await Pvideo.findOne({
    attributes: ["videotitle"],
    where: { videoid: videoid },
  });
  videoname = videotitle.dataValues.videotitle;
  videotitle = videotitle.dataValues.videotitle + ".mp4";

  // 동영상 국가 찾기
  var categoryname = await Pvideo.findOne({
    attributes: ["categoryname"],
    where: { videoid: videoid },
  });
  categoryname = categoryname.dataValues.categoryname;

  if (categoryname == "english") {
    categoryname = "en-us/";
  }
  if (categoryname == "korean") {
    categoryname = "ko-kr/";
  }

  let file = req.file;
  var filename = file.originalname;

  console.log("subtitle : " + subtitle);
  console.log("videoid : " + videoid);

  //var csv=req.file.buffer.toString('utf8');

  // convertflag 값 1을 2로 변환
  Pvideo.update(
    {
      convertflag: 2,
    },
    {
      where: { videoid: videoid },
    }
  );
  /*
  //s3에 올린 subtitle 파일 다운로드 받아서 upload 폴더에 저장

  async function downloadS3(s3, filename, videotitle, categoryname) {
    // 1. 수정된 csv 자막 파일 s3에서 받아오기
    const csvdownload = {
      Bucket: "wordballooncsv",
      Key: filename,
    };

    s3.getObject(csvdownload, function (err, data) {
      if (err) {
        throw err;
      }
      fs.writeFileSync("./upload/" + filename, data.Body.toString());
    });

    //2. 동영상 s3에서 받아오기
    var fileStream = fs.createWriteStream("./upload/" + videotitle);
    var s3Stream = s3
      .getObject({ Bucket: "wordballoon", Key: categoryname + videotitle })
      .createReadStream();

    s3Stream.on("error", function (err) {
      // NoSuchKey: The specified key does not exist
      console.error(err);
    });

    s3Stream
      .pipe(fileStream)
      .on("error", function (err) {
        // capture any errors that occur when writing data to the file
        console.error("File Stream:", err);
      })
      .on("close", function () {
        console.log("Done.");
      });
    console.log("1. downloadS3 완료(upload폴더에 csv, mp4)");
  }
*/
  // 영상처리 파이썬 연결
  async function opencvFunc(videoname) {
    videoname = videoname;
    video = videoname + ".mp4";
    csv = videoname + ".csv";
    var options1 = {
      mode: "text",
      pythonPath: "",
      pythonOptions: ["-u"],
      scriptPath: "../server/opencv",
      args: [video, csv],
    };

    await PythonShell.run("pil_final.py", options1, function (err, results) {
      if (err) console.log("err msg : ", err);
      console.log("영상처리 완료", results);
    });

    // mp3 추출, m03+mp4 합체, 파일 저장(로컬)
    // 1. mp3 추출
    var options2 = {
      mode: "text",
      pythonPath: "",
      pythonOptions: ["-u"],
      scriptPath: "../server/opencv",
      args: videoname,
    };

    await PythonShell.run("mp4_to_mp3.py", options2, function (err, results) {
      if (err) console.log("err msg : ", err);
      console.log("mp3 완료", results);
    });

    /*
    // 2. mp3+mp4 합체해서 파일 저장
    var options3 = {
      mode: "text",
      pythonPath: "",
      pythonOptions: ["-u"],
      scriptPath: "../server/opencv",
      args: videoname,
    };

    await PythonShell.run("save.py", options3, function (err, results) {
      if (err) console.log("err msg : ", err);
      console.log("완성 파일 저장 완료", results);
    });
    console.log("2. 영상처리 파이썬 연결)");
  }

  async function uploadVideo(videotitle, categoryname) {
    // 영상 처리 후 s3 저장
    const videoupload = {
      Bucket: "wordballoon",
      Key: categoryname + videotitle,
      ACL: "public-read",
      Body: fs.createReadStream("./upload/" + videotitle),
      ContentType: "video/mp4",
    };

    s3.upload(videoupload, function (err, data) {
      if (err) {
        console.log("s3 video upload err: ", err);
      }
      console.log("video upload complete");
      console.log("data: ", data);
      vl = data.Location;
    });
    console.log("3. 비디오 업로드)");
  }

  async function sendFunc() {
    // convertflag=3으로 변경 후, res.status(200).send('success')
    Pvideo.update(
      {
        convertflag: 3,
        // 비디오 s3에 저장한 링크(videolink) 받아서 db 갱신
        videolink: vl,
      },
      {
        where: { videoid: videoid },
      }
    )
      .then((result) => {
        res.status(200).send("Success");
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
    console.log("4. 전송 완료)");
  }

  downloadS3(s3, filename, videotitle, categoryname); //csv, 동영상 다운로드
  opencvFunc(videoname); //opencv, mp3, mp4
  uploadVideo(videotitle, categoryname); //동영상 업로드
  sendFunc();
  */
  }

  // 관리자 페이지4 기능: confirm
  /*
  GET /api/confirm/$videoid
  {
      videoid
  }
  res : {
      videotitle,
      videolink
  }
*/
  opencvFunc(videoname);
};

exports.confirm = async (req, res, next) => {
  var videoid = req.params.videoid;

  Pvideo.findOne({
    attributes: ["videotitle", "videolink"],
    where: {
      videoid: videoid,
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

// 관리자 페이지 4 기능 : complete
/*
  GET /api/complete/$videoid
  req
  {
      videoid
  }
  res
  {
      converflag = 4,
      message : 동영상이 게시되었습니다.
  }
  
*/
exports.complete = async (req, res, next) => {
  var videoid = req.params.videoid;

  // convertflag 값을 4로 변환
  Pvideo.update(
    {
      convertflag: 4,
    },
    {
      where: { videoid: videoid },
    }
  )
    .then((result) => {
      res.send("동영상이 게시되었습니다.");
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
