

"use strict";

const { Sequelize } = require("sequelize");
const pool = require("./db");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging:
      process.env.NODE_ENV === "development"
        ? (msg) => console.log(`[SQL] ${msg}`)
        : false,
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      timestamps: true,
      freezeTableName: false,
    },
  });

module.exports = { sequelize, Sequelize, pool };
