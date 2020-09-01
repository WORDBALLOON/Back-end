"use strict";
module.exports = (sequelize, DataTypes) => {
  var videoinfo = sequelize.define("videoinfo", {
    videoid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryid: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    categoryname: {
      type: DataTypes.STRING(8),
      allowNull: false,
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
      allowNull: true,
    },
    videolike: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    sharurl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  });
  return videoinfo;
};
