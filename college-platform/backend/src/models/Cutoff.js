
"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Cutoff = sequelize.define(
  "Cutoff",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    college_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "colleges", key: "id" },
      onDelete: "CASCADE",
    },
    college_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    college_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    exam_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "e.g. JEE Main, JEE Advanced, CAT, NEET, XAT, SNAP",
    },
    course_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Specific course the cutoff applies to",
    },
    degree_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM("General", "OBC", "SC", "ST", "EWS", "PWD"),
      defaultValue: "General",
    },
    opening_rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Opening (best) rank for admission",
    },
    closing_rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Closing rank — last rank admitted this year",
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Counselling round number",
    },
  },
  {
    tableName: "cutoffs",
    indexes: [
      { fields: ["college_id"] },
      { fields: ["exam_name"] },
      { fields: ["closing_rank"] },
      { fields: ["category"] },
    ],
  }
);

module.exports = Cutoff;
