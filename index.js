// 일단 사용하지 말기

const mysql = require("mysql2");
const express = require("express");
const dbconfig = require("./config/database.js");
const connection = mysql.createConnection(dbconfig);
const { User } = require("./models/userinfo");

const app = express();

app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
  res.send("Root");
});

connection.connect();

app.post("api/users/login", (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }
    //요청된 이메일이 데이터베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다.",
        });

      //비밀번호까지 맞다면 토큰을 생성하기
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        //토큰을 저장한다. 쿠키, 로컬스토리지에 저장 가능
        res
          .cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});
/*
const connection = mysql.createConnection({
    host: "wordballoon.clr4stjvntrc.ap-northeast-2.rds.amazonaws.com",
    user: "admin",
    password: "wordballoon20",
    database: "wordballoon",
  });

app.post("api/users/login", (req, res)=> {

})
// app.get("/users", (req, res));

/*
const connection = mysql.createConnection({
  host: "wordballoon.clr4stjvntrc.ap-northeast-2.rds.amazonaws.com",
  user: "admin",
  password: "wordballoon20",
  database: "wordballoon",
});

connection.connect();

connection.query("SELECT * FROM userinfo", (error, rows, fields) => {
  if (error) throw error;
  console.log("User info is : ", rows);
});

connection.end();
*/
