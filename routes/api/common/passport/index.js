const local = require("./localStrategy");
const { User } = require("../../../../models");

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.userid);
  });

  passport.deserializeUser((userid, done) => {
    User.findOne({ where: { userid } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });

  local(passport);
};
