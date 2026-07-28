"use strict";

const pool = require("../config/db");



const EXAMS = ["JEE Main", "JEE Advanced", "NEET UG", "VITEEE"];
const EXAM_ALIASES = new Map([
  ["jee main", "JEE Main"],
  ["jee mains", "JEE Main"],
  ["jee advanced", "JEE Advanced"],
  ["jee advance", "JEE Advanced"],
  ["neet", "NEET UG"],
  ["neet ug", "NEET UG"],
  ["viteee", "VITEEE"],
]);

const normalizeExamName = (value = "") => {
  const key = String(value).trim().toLowerCase().replace(/\s+/g, " ");
  return EXAM_ALIASES.get(key) || null;
};

const predictColleges = async (req, res) => {
  
  const rank = Number.parseInt(req.body.rank, 10);

  if (!Number.isFinite(rank) || rank <= 0) {
    return res.status(400).json({
      success: false,
      message: "Rank must be a positive number greater than 0.",
    });
  }

  const exam = normalizeExamName(req.body.exam_name || req.body.exam);
  if (!exam) {
    return res.status(400).json({
      success: false,
      message: `Unrecognized exam_name. Use one of: ${EXAMS.join(", ")}.`,
    });
  }

  const category = String(req.body.category || "General").trim() || "General";
  const params = [exam, category, rank];
  const clauses = [
    "c.exam_name = $1",
    "c.category = $2",
    "c.closing_rank >= $3",
  ];

  const sql = `
    SELECT
      c.id AS cutoff_id,
      c.college_name AS cutoff_college_name,
      c.exam_name,
      c.course_name,
      c.degree_type,
      c.category,
      c.opening_rank,
      c.closing_rank,
      c.year,
      c.round,
      COALESCE(co.name, c.college_name) AS college_name,
      co.id AS college_id,
      COALESCE(co.location, c.location) AS location,
      COALESCE(co.state, c.state) AS state,
      COALESCE(co.college_type, c.college_type) AS college_type,
      co.rating,
      co.established_year,
      co.affiliation,
      co.naac_grade,
      co.nirf_rank,
      co.website,
      co.overview,
      co.image_url
    FROM cutoffs c
    LEFT JOIN colleges co
      ON co.id = c.college_id OR (c.college_name IS NOT NULL AND LOWER(TRIM(co.name)) = LOWER(TRIM(c.college_name)))
    WHERE ${clauses.join(" AND ")}
    ORDER BY c.closing_rank ASC, c.year DESC
    LIMIT 50
  `;

  try {
    const { rows } = await pool.query(sql, params);
    let results = rows.map((row) => ({
      id: `cutoff-${row.cutoff_id}`,
      source: row.college_id ? "database" : "cutoff_only",
      exam_name: row.exam_name,
      course_name: row.course_name,
      degree_type: row.degree_type,
      category: row.category,
      opening_rank: row.opening_rank,
      closing_rank: row.closing_rank,
      year: row.year,
      round: row.round,
      rankBuffer: row.closing_rank - rank,

      college: {
        id: row.college_id,
        name: row.college_name,
        location: row.location,
        state: row.state,
        college_type: row.college_type,
        rating: row.rating,
        established_year: row.established_year,
        affiliation: row.affiliation,
        naac_grade: row.naac_grade,
        nirf_rank: row.nirf_rank,
        website: row.website,
        overview: row.overview,
        image_url: row.image_url,
      },
    }));



    return res.status(200).json({
      success: true,
      message: results.length ? "Matched colleges found." : "No colleges match this rank and filters.",
      data: {
        results,
        query: { exam_name: exam, rank, category },
      },
    });
  } catch (error) {
    console.error("[PredictorController.predictColleges]", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch rank predictions.",
    });
  }
};

const getAvailableExams = async (_req, res) => {
  res.json({ success: true, data: { exams: EXAMS } });
};

module.exports = { predictColleges, getAvailableExams, normalizeExamName };
  

