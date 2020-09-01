const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const { User } = require("../../../../models");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "userid",
        passwordField: "password",
      },
      async (userid, password, done) => {
        try {
          console.log("로컬" + userid);
          const exUser = await User.findOne({ where: { userid } });
          if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            /* 비교가 제대로 되었는지의 여부 확인
            console.log(result); */
            if (result) {
              done(null, exUser);
              /* user값이 제대로 나오는지, 이제 전달하자
              console.log(exUser);*/
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
