module.exports = (sequelize, DataTypes) => {
  var userinfo = sequelize.define(
    "userinfo",
    {
      userid: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      birth: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      isadmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );
  return userinfo;
};
