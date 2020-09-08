const { Pvideo } = require("../../../models");
const { Videokey } = require("../../../models");
const express = require("express");

const multer = require("multer");

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

    var videofile = req.body.videofile;
    var inbucket = req.body.inbucket;
    var pvideotitle = req.body.pvideotitle;

    console.log(videofile);
    console.log(inbucket);
    console.log(pvideotitle);


    // video 로컬에 저장
    let storage = multer.diskStorage({
        destination: (req, file, cb) => {                       //uploads 폴더에 저장
            cb(null, 'uploads/')
        },
        filename: (req, file, cb) => {                          //파일 이름
            cb(null, `${Date.now()}_${file.originalname}`)
        },
        fileFilter: (req, file, cb) => {                        //mp4형식만 가능
            const ext = path.extname(file.originalname)
            if (ext !== '.mp4') {
                return cb(res.status(400).end('only mp4 is allowed'), false);
            }
            cb(null, true)
        }
    })
    
    const upload = multer({ storage: storage }).single("file")

  
    //썸네일 제작 : 혜정


    //S3, 데이터베이스에 동영상이랑 썸네일 업로드


    //파이썬 STT --> S3, 데이터베이스에 업로드 : 수진


    //TextRank


    //TextRank 값, STT Script 링크, 영상 링크, 썸네일 링크 데이터베이스에 저장


    //res: 이미지 링크로 전송, textrank 리스크 값으로 전송


  };