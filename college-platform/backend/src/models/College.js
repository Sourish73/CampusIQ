

"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const College = sequelize.define(
  "College",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "College name is required" },
      },
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0.0,
      validate: {
        min: { args: [0], msg: "Rating cannot be negative" },
        max: { args: [5], msg: "Rating cannot exceed 5" },
      },
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    established_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    college_type: {
      type: DataTypes.ENUM("government", "private", "deemed", "central"),
      defaultValue: "private",
    },
    affiliation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    naac_grade: {
      type: DataTypes.STRING(5),
      allowNull: true,
      comment: "NAAC Accreditation Grade (A++, A+, A, B++, B+, B, C, D)",
    },
    nirf_rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    total_intake: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "colleges",
    indexes: [
      { fields: ["name"] },
      { fields: ["location"] },
      { fields: ["state"] },
      { fields: ["rating"] },
      { fields: ["college_type"] },
    ],
  }
);

module.exports = College;
