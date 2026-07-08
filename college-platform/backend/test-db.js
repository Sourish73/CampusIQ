require("dotenv").config();
const { pool } = require("./src/config/database");

async function test() {
  const res = await pool.query("SELECT id, name FROM colleges WHERE name ILIKE '%VELLORE%' OR name ILIKE '%VIT%' LIMIT 5");
  console.log(res.rows);
  process.exit(0);
}
test();
