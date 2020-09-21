const { Pvideo } = require("../../../models");
const { PythonShell } = require("python-shell");

const AWS = require("aws-sdk"); //s3에 접근     npm install aws-sdk
const fs = require("fs"); //파일 읽어옴
const express = require("express");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 관리자 페이지1 기능 : list
/*
    GET /api/list/
    {
        videoid
        categoryname
        videotitle
    }
*/

exports.list = async (req, res, next) => {};

// 관리자 페이지2 기능 : edit
/*
    POST /api/edit/$videoid
    {
        videoid
        convertflag=1
    }
    res : {
        videotitle
        videolink
        subtitle(csv파일)
    }
*/

exports.edit = async (req, res, next) => {};

// 관리자 페이지3 기능 : change
/*
    POST /api/change/$videoid
    {
        subtitle(csv파일)
        videoid
        convertflag=2
    }
    프론트 : 변환중, 백 : 영상처리
    res : {
        message : 변환완료
        convertflag=3
    }
*/

exports.change = async (req, res, next) => {};

// 관리자 페이지4 기능 : confirm
/*
    POST /api/confirm/#$videoid
    {
        videoid
    }
    res : {
        videotitle
        videolink
    }
*/

exports.confirm = async (req, res, next) => {};

// 관리자 페이지4 기능 : complete
/*
    GET /api/complete/$videoid
    {
        convertflag=4
        message : 동영상이 게시되었습니다.
    }
*/

exports.complete = async (req, res, next) => {};
