const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const cors = require("cors");
const passport = require("passport");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

const { sequelize } = require("./models");
const passportConfig = require("./routes/api/common/passport");

const app = express();
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
  var json = JSON.parse(JSON.stringify(res));
  //res.send(res);
  res.send(json);
});
//app.use("/test", require("./routes/api/common/passport/localStrategy"));
app.use("/api", require("./routes/api"));

/** PORT LISTENING */
app.listen(5050, () => {
  console.log("Backend 5050포트에서 동작중");
});
module.exports = app;
