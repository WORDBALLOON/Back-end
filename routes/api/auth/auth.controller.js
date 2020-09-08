const { User } = require("../../../models");
const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");

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
  // 중복확인
  if (name == "") {
    const many = await User.findOne({ where: { userid } });
    if (many) {
      res.json({
        status: 202,
        success: false,
        message: "사용 불가능",
      });
      //return res.redirect("/register");}
      return;
    } else {
      res.json({
        status: 201,
        success: true,
        message: "사용 가능",
      });
      return;
    }
  } else {
    try {
      const exUser = await User.findOne({ where: { userid } });
      console.log(exUser);
      /*
    // 만약에 name이 0값이라면, 데이터 저장하지 말고 res.json({message : "사용가능아이디"})
    if (exUsername == 0) {
      res.json({
        status: 202,
        success: false,
        message: "사용 가능 아이디",
      });
      return;
    }
    */

      if (exUser) {
        console.log("이미 가입된 아이디입니다.");
        res.json({
          status: 202,
          success: false,
          message: "이미 가입된 아이디임",
        });
        //return res.redirect("/register");
        return;
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
          return;
        } else {
          console.log("저장성공");
          res.json({
            status: 200,
            success: true,
            message: "db 저장 성공",
          });
          return;
          // 전달해야할 것이 있을 때에는
          //console.log(result.dataValues);
        }
      });
      return res.redirect("/");
    } catch (error) {
      console.error(error);
      return next(error);
    }
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
  //res.send("login 라우터 작동중");
  console.log(req.body);
  passport.authenticate("local", (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      // user 아니라면,
      res.status(202).json({ message: info.message });
      //res.send(info.message);
      return;
      //req.flash("loginError", info.message);
      //return res.redirect("/");
    }
    return req.login(user, (loginError) => {
      console.log("여기까지 오기는 하는걸까");
      console.log(user);
      //res.send(user); // 프론트로 user 정보 전달
      if (loginError) {
        console.error(loginError);
        res.send(loginError);
        return;
        //return next(loginError);
      }
      // 로그인 성공 시, 유저 데이터 프론트로 전송
      var json = JSON.parse(JSON.stringify(user));
      return res.send(json);
      //return res.redirect("/");
    });
  })(req, res, next);
};

exports.logout = async (req, res) => {
  console.log("logout이 되었어");
  req.logout();
  req.session.destroy(function (err) {
    if (err) {
      res.json({
        status: 400,
        success: false,
        message: "로그아웃 실패",
      });
      return;
    }
    res.json({
      status: 200,
      success: true,
      message: "로그아웃 성공",
    });
    return;
  });
  //res.redirect("/");
};
