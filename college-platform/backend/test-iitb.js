const { pool } = require('./src/config/database.js');
pool.query(`SELECT id, name FROM colleges WHERE name ILIKE '%Bombay%' OR name ILIKE '%IIT%'`).then(res => {
  console.log("Matches:", res.rows);
  process.exit(0);
}).catch(console.error);
