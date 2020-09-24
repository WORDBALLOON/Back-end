const router = require("express").Router();
const controller = require("./mypage.controller");

router.post("/wordcloud", controller.wordcloud);
router.post("/uploader", controller.uploader); // 사용자가 업로드한 영상 보여주기
//router.post("/like", controller.like); // 사용자가 좋아요 표시한 영상
//router.post("/watch", controller.watch); // 사용자가 본 영상

module.exports = router;
