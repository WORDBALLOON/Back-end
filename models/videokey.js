"use strict";
module.exports = (sequelize, DataTypes) => {
  var videokey = sequelize.define("videokey", {
    keyid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    keyid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    keyid: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
},
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return videokey;
};
