const router = require("express").Router();
const controller = require("./mypage.controller");

router.post("/wordcloud", controller.wordcloud);
router.post("/uploader", controller.uploader); // 사용자가 업로드한 영상 보여주기

module.exports = router;
