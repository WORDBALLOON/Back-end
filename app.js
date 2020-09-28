// pm2 프로세스 종료 : pm2 kill, 서버를 재시작 : pm2 reload all
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

const { sequelize } = require("./models");
const passportConfig = require("./routes/api/common/passport");

const app = express();
// process.env.NODE_ENV는 배포환경인지 개벌환경인지 판단
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined")); // 배포환경
  //app.use(helmet());
  //app.use(hpp());
} else {
  app.use(morgan("dev")); // 개발환경
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// front와 server 사이의 문제 야기 방지
app.use(cors());
/*
var corsOptions = {
  origin: "http://localhost:3000",
};
*/
// use database with sequelize
sequelize.sync();
passportConfig(passport);

// api router
app.get("/", (req, res) => {
  //var json = JSON.parse(JSON.stringify(res));
  //res.send(res);
  //res.send(json);
  res.send("hello world");
});
//app.use("/test", require("./routes/api/common/passport/localStrategy"));
app.use("/api", require("./routes/api"));

/** PORT LISTENING */
app.listen(5050, () => {
  console.log("Backend 5050포트에서 동작중");
});
module.exports = app;
