"use strict";
module.exports = (sequelize, DataTypes) => {
  var pvideoinfo = sequelize.define(
    "pvideoinfo",
    {
      videoid: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      categoryid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      categoryname: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      videotitle: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      videolink: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      thumbnail: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      //수정할 수도 있음 : 파일 변환 가능
      subtitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      view: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      videolike: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      convertflag: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      keyword: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return pvideoinfo;
};
