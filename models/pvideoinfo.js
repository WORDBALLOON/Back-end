"use strict";
module.exports = (sequelize, DataTypes) => {
  var pvideoinfo = sequelize.define("pvideoinfo", {
    pvideoid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pcategoryid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pcategoryname: {
      type: DataTypes.STRING(8),
      allowNull: true,
    },
    pvideotitle: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    pvideolink: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pthumbnail: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    //수정할 수도 있음 : 파일 변환 가능
    psubtitle: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    pview: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pvideolike: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    convertflag: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return pvideoinfo;
};
