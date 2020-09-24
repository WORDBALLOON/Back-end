const router = require("express").Router();
const controller = require("./searchword.controller");

// 검색페이지
router.post("/title", controller.title);

// 카테고리
router.get("/catg/:categoryid", controller.catg);

// 내동영상
router.get("/mylike/:userid", controller.mylike); // 사용자가 좋아요 표시한 영상
router.get("/mywatch/:userid", controller.mywatch); // 사용자가 본 영상

module.exports = router;
