const { User } = require("../../../models");
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");

require("dotenv").config({ path: __dirname + "\\" + ".env" });

// 회원가입 기능
/*
    POST /api/auth/register
    {
        username,
        password
    }

*/
exports.register = async (req, res, next) => {
  //res.send("register 작동");
  //var now=newDate();
  // 확인차
  //console.log(await req.body);

  //const { userid, password, name, birth } = await req.body; //isadmin은 0
  var userid = req.body.userid;
  var password = req.body.password;
  var name = req.body.name;
  var birth = req.body.birth;

  console.log(userid);
  console.log(password);

  try {
    const exUser = await User.findOne({ where: { userid } });
    if (exUser) {
      console.log("이미 가입된 아이디입니다.");
      return res.redirect("/register");
    }

    const hash = await bcrypt.hash(password, 12);
    await User.create({
      userid: userid,
      password: hash,
      name: name,
      birth: birth,
      isadmin: 0,
    }).then((result) => {
      if (!result) {
        console.log("저장 실패");
        res.json({
          status: 500,
          success: false,
          message: "db 저장 실패",
        });
      } else {
        console.log("저장성공");
        res.json({
          status: 200,
          success: true,
          message: "db 저장 성공",
        });
        // 전달해야할 것이 있을 때에는
        //console.log(result.dataValues);
      }
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

/*
    POST /api/auth/login
    {
        email,
        password
    }
*/

exports.login = async (req, res, next) => {
  res.send("login 라우터 작동중");
  console.log(req.body);
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash("loginError", info.message);
      return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect("/");
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
};
