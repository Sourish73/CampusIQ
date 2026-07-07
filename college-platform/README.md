# CampusIQ Fullstack

Simple placement-project app for college rank prediction, college discovery, Gemini summaries/reviews, and college comparison.

## Tech Stack

- Backend: Node.js, Express, PostgreSQL, `pg`, Sequelize models for existing auth/details routes
- Frontend: React, Vite, Tailwind CSS, Axios
- AI: Google Gemini using `gemini-1.5-flash`

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=postgres://postgres:your_password@localhost:5432/college_platform
JWT_SECRET=replace_with_a_long_secret
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash

CLIENT_URL=http://localhost:5173
COLLEGES_CSV_PATH=C:\Users\sinha\Downloads\colleges_2025_final.csv
CUTOFFS_CSV_PATH=C:\Users\sinha\Downloads\cutoffs_2025_final (1).csv
```

Create the database in PostgreSQL:

```sql
CREATE DATABASE college_platform;
```

### 3. Seed CSV Data

```bash
cd backend
npm run seed
```

The seed script imports both CSV files, creates required tables/columns, and uses `ON CONFLICT DO NOTHING` so rerunning it will not duplicate rows.

### 4. Start Backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5000`.

### 5. Start Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Main API

Base URLs both work:

- `http://localhost:5000/api`
- `http://localhost:5000`

### POST `/predict`

```json
{
  "rank": 12000,
  "exam_name": "JEE Main",
  "category": "General",
  "filters": {
    "state": "Karnataka",
    "course_name": "Computer",
    "college_type": "private"
  }
}
```

Supported exams: `JEE Main`, `JEE Advanced`, `NEET UG`, `COMEDK`, `VITEEE`.

Returns matched cutoff rows using a case-insensitive `LEFT JOIN` to `colleges`. If a cutoff college is missing from `colleges`, the result still appears with null enrichment fields.

### GET `/college/summary?name=...`

Returns Gemini-generated summary JSON. If Gemini fails, the route still returns a graceful fallback body.

### GET `/college/reviews?name=...`

Returns Gemini-generated review sentiment JSON. If Gemini fails, the route still returns fallback review content.

### POST `/college/compare`

```json
{
  "college1": "IIT Bombay",
  "college2": "VIT Vellore"
}
```

Returns a Gemini-generated structured comparison with fallback JSON on errors/timeouts.

## Notes

- CORS allows `http://localhost:3000` and `http://localhost:5173`.
- Rank `0` or negative rank returns `400`.
- Missing category defaults to `General`.
- All predictor SQL uses parameterized `$1`, `$2` queries.
- Gemini defaults to `gemini-1.5-flash`.
