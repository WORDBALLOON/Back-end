const router = require("express").Router();
const controller = require("./detail.controller");

// 뷰페이지
router.post("/view/", controller.view);
// 좋아요 하트 눌렀을 때
router.post("/like/", controller.like);

module.exports = router;
