"use strict";

const { Router } = require("express");
const { body, query, param } = require("express-validator");
const { protect } = require("../middleware/auth");

const { register, login, getMe, updateProfile } = require("../controllers/authController");
const {
  getColleges,
  getCollegeById,
  compareColleges,
  getSavedItems,
  addSavedItem,
  removeSavedItem,
  searchOrFetchCollege,
  getCollegeSummary,
  getCollegeReviewsAI,
  compareCollegesAI,
} = require("../controllers/collegeController");
const { predictColleges, getAvailableExams } = require("../controllers/predictorController");

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.post(
  "/auth/register",
  [
    body("name")
      .trim()
      .notEmpty().withMessage("Name is required")
      .isLength({ min: 2, max: 120 }).withMessage("Name must be 2–120 characters"),
    body("email")
      .trim()
      .notEmpty().withMessage("Email is required")
      .isEmail().withMessage("Must be a valid email"),
    body("password")
      .notEmpty().withMessage("Password is required")
      .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  register
);

router.post(
  "/auth/login",
  [
    body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  login
);

router.get("/auth/me", protect, getMe);

router.put(
  "/auth/me",
  protect,
  [
    body("name").optional().isLength({ max: 120 }).withMessage("Name must be under 120 characters"),
    body("email").optional().isEmail().withMessage("Invalid email"),
  ],
  updateProfile
);




router.get(
  "/colleges/compare-batch",
  [
    query("ids")
      .notEmpty().withMessage("ids query param is required")
      .matches(/^[\d,]+$/).withMessage("ids must be comma-separated integers"),
  ],
  compareColleges
);

// ─── AI College Search ───────────────────────────────────────────────────────
// MUST be before /:id or "search-ai" gets treated as a numeric id (and fails)
router.get(
  "/colleges/search-ai",
  [
    query("name")
      .trim()
      .notEmpty().withMessage("College name is required")
      .isLength({ min: 3, max: 500 }).withMessage("Name or URL must be 3-500 characters"),
  ],
  searchOrFetchCollege
);

router.get(
  "/colleges",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("limit must be 1–50"),
    query("minFee").optional().isFloat({ min: 0 }).withMessage("minFee must be a positive number"),
    query("maxFee").optional().isFloat({ min: 0 }).withMessage("maxFee must be a positive number"),
    query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage("minRating must be 0–5"),
  ],
  getColleges
);

// /:id is always LAST among college routes
router.get(
  "/colleges/:id",
  [param("id").isInt({ min: 1 }).withMessage("College ID must be a positive integer")],
  getCollegeById
);

// ─────────────────────────────────────────────────────────────────────────────
// PREDICTOR ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.get("/predict/exams", getAvailableExams);

router.get("/college/summary", [query("name").trim().notEmpty().withMessage("College name is required")], getCollegeSummary);
router.get("/college/reviews", [query("name").trim().notEmpty().withMessage("College name is required")], getCollegeReviewsAI);
router.post(
  "/college/compare",
  [
    body("college1").trim().notEmpty().withMessage("college1 is required"),
    body("college2").trim().notEmpty().withMessage("college2 is required"),
  ],
  compareCollegesAI
);

router.post(
  "/predict",
  [
    body("exam_name").optional().isString(),
    body("exam").optional().isString(),
    body("rank")
      .notEmpty().withMessage("Rank is required")
      .isInt({ min: 1 }).withMessage("Rank must be a positive integer"),
    body("category")
      .optional()
      .isIn(["General", "OBC", "SC", "ST", "EWS", "PWD"])
      .withMessage("Invalid category"),
  ],
  predictColleges
);

// ─────────────────────────────────────────────────────────────────────────────
// SAVED ITEMS ROUTES  (all protected)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/saved-items", protect, getSavedItems);

router.post(
  "/saved-items",
  protect,
  [
    body("college_id")
      .notEmpty().withMessage("college_id is required")
      .isInt({ min: 1 }).withMessage("college_id must be a positive integer"),
    body("notes").optional().isString().isLength({ max: 500 }),
  ],
  addSavedItem
);

router.delete(
  "/saved-items/:collegeId",
  protect,
  [param("collegeId").isInt({ min: 1 }).withMessage("Invalid college ID")],
  removeSavedItem
);

module.exports = router;
