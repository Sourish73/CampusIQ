

"use strict";

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Placement = sequelize.define(
  "Placement",
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
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Placement batch year, e.g. 2023",
    },
    average_ctc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Average CTC in LPA (Lakhs Per Annum)",
    },
    median_ctc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    highest_ctc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Highest CTC in LPA",
    },
    placement_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "Percentage of students placed",
      validate: {
        min: { args: [0], msg: "Placement % cannot be negative" },
        max: { args: [100], msg: "Placement % cannot exceed 100" },
      },
    },
    top_recruiters: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Comma-separated list of top recruiting companies",
      get() {
        const raw = this.getDataValue("top_recruiters");
        if (!raw) return [];
        return raw.split(",").map((r) => r.trim());
      },
      set(val) {
        if (Array.isArray(val)) {
          this.setDataValue("top_recruiters", val.join(","));
        } else {
          this.setDataValue("top_recruiters", val);
        }
      },
    },
    total_offers: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "placements",
    indexes: [{ fields: ["college_id"] }, { fields: ["year"] }],
  }
);

module.exports = Placement;
