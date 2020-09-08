const path = require("path");
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = require("./userinfo")(sequelize, Sequelize);
db.Pvideo = require("./pvideoinfo")(sequelize, Sequelize);
db.Videokey = require("./videokey")(sequelize, Sequelize);

db.Pvideo.hasMany(db.Videokey);
db.Videokey.belongsTo(db.Pvideo);

module.exports = db;