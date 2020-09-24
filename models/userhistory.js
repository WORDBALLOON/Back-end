module.exports = (sequelize, DataTypes) => {
  var userhistory = sequelize.define(
    "userhistory",
    {
      userid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      videoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      userlike: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  return userhistory;
};
