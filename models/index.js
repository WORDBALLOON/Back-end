const path = require("path");
const Sequelize = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
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
db.History = require("./userhistory")(sequelize, Sequelize);

// 관계 형성
db.User.hasMany(db.Pvideo, { foreignKey: "uploader", sourceKey: "userid" });
db.Pvideo.belongsTo(db.User, { foreignKey: "uploader", targetKey: "userid" });

// history 관계 형성
db.History.belongsTo(db.User, { foreignKey: "userid" });
db.History.belongsTo(db.Pvideo, { foreignKey: "videoid" });
module.exports = db;
