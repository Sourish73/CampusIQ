const { pool } = require('./src/config/database');

async function clearDB() {
  try {
    console.log("Clearing colleges...");
    await pool.query('DELETE FROM cutoffs');
    await pool.query('DELETE FROM placements');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM courses');
    await pool.query('DELETE FROM saved_items');
    await pool.query('DELETE FROM colleges'); // Delete all to start fresh
    console.log("Database cleared successfully!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clearDB();
