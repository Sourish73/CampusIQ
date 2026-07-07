

"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Course = sequelize.define(
  "Course",
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: { notEmpty: { msg: "Course name is required" } },
    },
    duration: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "e.g. '4 Years', '2 Years'",
    },
    fees: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: "Total course fees in INR",
      validate: {
        min: { args: [0], msg: "Fees cannot be negative" },
      },
    },
    fees_per_year: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: "Annual fee component in INR",
    },
    degree_type: {
      type: DataTypes.ENUM("UG", "PG", "PhD", "Diploma", "Certificate"),
      defaultValue: "UG",
    },
    specialisation: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    seats_available: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "courses",
    indexes: [{ fields: ["college_id"] }, { fields: ["fees"] }, { fields: ["degree_type"] }],
  }
);

module.exports = Course;
