"use strict";

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

const defaultCollegeCsv = path.join(process.env.USERPROFILE || "", "Downloads", "colleges_2025_final.csv");
const defaultCutoffCsv = path.join(process.env.USERPROFILE || "", "Downloads", "cutoffs_2025_final (1).csv");

const collegeCsvPath = process.env.COLLEGES_CSV_PATH || defaultCollegeCsv;
const cutoffCsvPath = process.env.CUTOFFS_CSV_PATH || defaultCutoffCsv;

const parseCsv = (text) => {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value);
  if (row.some((cell) => cell !== "")) rows.push(row);

  const headers = rows.shift().map((header) => header.trim());
  return rows.map((cells) =>
    Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()]))
  );
};

const intOrNull = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const numberOrNull = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const textOrNull = (value) => {
  const trimmed = String(value || "").trim();
  return trimmed || null;
};

const normalizeCollegeType = (value) => {
  const cleaned = String(value || "private").trim().toLowerCase();
  return ["government", "private", "deemed", "central"].includes(cleaned) ? cleaned : "private";
};

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS colleges (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      location VARCHAR(150),
      state VARCHAR(100),
      rating DECIMAL(3,1) DEFAULT 0,
      overview TEXT,
      established_year INTEGER,
      college_type VARCHAR(50) DEFAULT 'private',
      affiliation VARCHAR(255),
      website VARCHAR(255),
      naac_grade VARCHAR(20),
      nirf_rank INTEGER,
      total_intake INTEGER,
      image_url VARCHAR(500),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cutoffs (
      id SERIAL PRIMARY KEY,
      college_id INTEGER NULL REFERENCES colleges(id) ON DELETE SET NULL,
      college_name VARCHAR(255),
      location VARCHAR(150),
      state VARCHAR(100),
      college_type VARCHAR(50),
      exam_name VARCHAR(50) NOT NULL,
      course_name VARCHAR(255),
      degree_type VARCHAR(50),
      category VARCHAR(20) DEFAULT 'General',
      opening_rank INTEGER,
      closing_rank INTEGER NOT NULL,
      year INTEGER NOT NULL,
      round INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    ALTER TABLE cutoffs ADD COLUMN IF NOT EXISTS college_name VARCHAR(255);
    ALTER TABLE cutoffs ADD COLUMN IF NOT EXISTS location VARCHAR(150);
    ALTER TABLE cutoffs ADD COLUMN IF NOT EXISTS state VARCHAR(100);
    ALTER TABLE cutoffs ADD COLUMN IF NOT EXISTS college_type VARCHAR(50);
    ALTER TABLE cutoffs ADD COLUMN IF NOT EXISTS degree_type VARCHAR(50);
    ALTER TABLE cutoffs ALTER COLUMN college_id DROP NOT NULL;
    ALTER TABLE cutoffs ALTER COLUMN category TYPE VARCHAR(20) USING category::text;
    ALTER TABLE colleges ALTER COLUMN college_type TYPE VARCHAR(50) USING college_type::text;
    ALTER TABLE cutoffs ALTER COLUMN exam_name TYPE VARCHAR(120);
    ALTER TABLE cutoffs ALTER COLUMN college_type TYPE VARCHAR(120);
    ALTER TABLE cutoffs ALTER COLUMN degree_type TYPE VARCHAR(120);
    ALTER TABLE cutoffs ALTER COLUMN category TYPE VARCHAR(120);
    ALTER TABLE colleges ALTER COLUMN college_type TYPE VARCHAR(120);

    CREATE UNIQUE INDEX IF NOT EXISTS colleges_name_unique_idx ON colleges (LOWER(TRIM(name)));
    CREATE UNIQUE INDEX IF NOT EXISTS cutoffs_natural_unique_idx
      ON cutoffs (LOWER(TRIM(COALESCE(college_name, ''))), exam_name, COALESCE(course_name, ''), category, COALESCE(opening_rank, 0), closing_rank, year);
  `);
}

async function seedColleges(rows) {
  let inserted = 0;
  for (const row of rows) {
    const result = await pool.query(
      `
        INSERT INTO colleges (
          id, name, location, state, college_type, rating, established_year,
          affiliation, naac_grade, nirf_rank, website, overview, created_at, updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())
        ON CONFLICT DO NOTHING
      `,
      [
        intOrNull(row.college_id),
        textOrNull(row.college_name),
        textOrNull(row.location),
        textOrNull(row.state),
        normalizeCollegeType(row.college_type),
        numberOrNull(row.rating),
        intOrNull(row.established_year),
        textOrNull(row.affiliation),
        textOrNull(row.naac_grade),
        intOrNull(row.nirf_rank),
        textOrNull(row.website),
        textOrNull(row.overview),
      ]
    );
    inserted += result.rowCount;
  }
  return inserted;
}

async function seedCutoffs(rows) {
  let inserted = 0;
  for (const row of rows) {
    const result = await pool.query(
      `
        INSERT INTO cutoffs (
          id, college_id, college_name, location, state, college_type,
          exam_name, course_name, degree_type, category, opening_rank, closing_rank, year, created_at, updated_at
        )
        VALUES (
          $1,
          (SELECT id FROM colleges WHERE LOWER(TRIM(name)) = LOWER(TRIM($2)) LIMIT 1),
          $2,$3,$4,$5,$6,$7,$8,COALESCE($9, 'General'),$10,$11,$12,NOW(),NOW()
        )
        ON CONFLICT DO NOTHING
      `,
      [
        intOrNull(row.cutoff_id),
        textOrNull(row.college_name),
        textOrNull(row.location),
        textOrNull(row.state),
        normalizeCollegeType(row.college_type),
        textOrNull(row.exam_name),
        textOrNull(row.course_name),
        textOrNull(row.degree_type),
        textOrNull(row.category),
        intOrNull(row.opening_rank),
        intOrNull(row.closing_rank),
        intOrNull(row.year) || 2025,
      ]
    );
    inserted += result.rowCount;
  }
  return inserted;
}

async function seed() {
  try {
    await ensureSchema();

    const colleges = parseCsv(fs.readFileSync(collegeCsvPath, "utf8"));
    const cutoffs = parseCsv(fs.readFileSync(cutoffCsvPath, "utf8"));

    const collegeCount = await pool.query("SELECT COUNT(*)::int AS count FROM colleges");
    const cutoffCount = await pool.query("SELECT COUNT(*)::int AS count FROM cutoffs");

    const insertedColleges = await seedColleges(colleges);
    const insertedCutoffs = await seedCutoffs(cutoffs);

    console.log(`Colleges before: ${collegeCount.rows[0].count}, inserted: ${insertedColleges}`);
    console.log(`Cutoffs before: ${cutoffCount.rows[0].count}, inserted: ${insertedCutoffs}`);

    // Reset auto-increment sequences so Sequelize bulkCreate won't violate unique constraints
    await pool.query("SELECT setval(pg_get_serial_sequence('colleges', 'id'), COALESCE(max(id), 1)) FROM colleges");
    await pool.query("SELECT setval(pg_get_serial_sequence('cutoffs', 'id'), COALESCE(max(id), 1)) FROM cutoffs");
    console.log("Database ID sequences synchronised successfully.");
    console.log("Seed completed safely. Re-running will not duplicate rows.");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

seed();
