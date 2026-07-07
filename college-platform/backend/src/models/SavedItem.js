

"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const SavedItem = sequelize.define(
  "SavedItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "colleges", key: "id" },
      onDelete: "CASCADE",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Optional personal notes on this saved college",
    },
  },
  {
    tableName: "saved_items",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "college_id"],
        name: "unique_user_college",
      },
    ],
  }
);

module.exports = SavedItem;
