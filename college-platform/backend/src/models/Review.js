
"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Review = sequelize.define(
  "Review",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "colleges", key: "id" },
      onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true, 
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    },
    reviewer_name: {
      type: DataTypes.STRING(120),
      allowNull: false,
      defaultValue: "Anonymous",
    },
    batch_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Rating must be at least 1" },
        max: { args: [5], msg: "Rating cannot exceed 5" },
      },
    },
    infrastructure_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    faculty_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    placement_rating: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    pros: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cons: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "reviews",
    indexes: [{ fields: ["college_id"] }, { fields: ["user_id"] }, { fields: ["rating"] }],
  }
);

module.exports = Review;
