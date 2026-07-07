

"use strict";

const User = require("./User");
const College = require("./College");
const Course = require("./Course");
const Placement = require("./Placement");
const Cutoff = require("./Cutoff");
const Review = require("./Review");
const SavedItem = require("./SavedItem");

// ─── Associations ──────────────────────────────────────────────────────────────

// College → Courses  (1:N)
College.hasMany(Course, { foreignKey: "college_id", as: "courses", onDelete: "CASCADE" });
Course.belongsTo(College, { foreignKey: "college_id", as: "college" });

// College → Placements  (1:N — yearly records)
College.hasMany(Placement, { foreignKey: "college_id", as: "placements", onDelete: "CASCADE" });
Placement.belongsTo(College, { foreignKey: "college_id", as: "college" });

// College → Cutoffs  (1:N — per exam/category)
College.hasMany(Cutoff, { foreignKey: "college_id", as: "cutoffs", onDelete: "CASCADE" });
Cutoff.belongsTo(College, { foreignKey: "college_id", as: "college" });

// College → Reviews  (1:N)
College.hasMany(Review, { foreignKey: "college_id", as: "reviews", onDelete: "CASCADE" });
Review.belongsTo(College, { foreignKey: "college_id", as: "college" });

// User → Reviews  (1:N)
User.hasMany(Review, { foreignKey: "user_id", as: "reviews", onDelete: "SET NULL" });
Review.belongsTo(User, { foreignKey: "user_id", as: "author" });

// User ↔ College via SavedItems  (N:M through junction table)
User.hasMany(SavedItem, { foreignKey: "user_id", as: "savedItems", onDelete: "CASCADE" });
SavedItem.belongsTo(User, { foreignKey: "user_id", as: "user" });

College.hasMany(SavedItem, { foreignKey: "college_id", as: "savedByUsers", onDelete: "CASCADE" });
SavedItem.belongsTo(College, { foreignKey: "college_id", as: "college" });

// Convenience N:M accessor
User.belongsToMany(College, {
  through: SavedItem,
  foreignKey: "user_id",
  otherKey: "college_id",
  as: "savedColleges",
});
College.belongsToMany(User, {
  through: SavedItem,
  foreignKey: "college_id",
  otherKey: "user_id",
  as: "savedByUsers_many",
});

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  User,
  College,
  Course,
  Placement,
  Cutoff,
  Review,
  SavedItem,
};
