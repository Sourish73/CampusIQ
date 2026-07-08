const SEARCH_ALIASES = {
  vit: ["Vellore Institute of Technology", "VIT"],
  vitv: ["Vellore Institute of Technology"],
  srm: ["SRM Institute of Science and Technology", "SRM University"],
  aiim: ["All India Institute of Medical Sciences", "AIIMS Delhi"],
  aiims: ["All India Institute of Medical Sciences", "AIIMS Delhi"],
  kiit: ["Kalinga Institute of Industrial Technology", "KIIT"],
  iit: ["Indian Institute of Technology"],
  iitb: ["Indian Institute of Technology Bombay", "IIT Bombay"],
  iitm: ["Indian Institute of Technology Madras", "IIT Madras"],
  iitd: ["Indian Institute of Technology Delhi", "IIT Delhi"],
  nit: ["National Institute of Technology"],
  iiit: ["Indian Institute of Information Technology"],
  anna: ["Anna University"],
  dtu: ["Delhi Technological University"],
  nsut: ["Netaji Subhas University of Technology"],
  iima: ["Indian Institute of Management Ahmedabad", "IIM Ahmedabad"],
  iim: ["Indian Institute of Management"]
};

const expandSearchTerms = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const compact = normalized.replace(/\s+/g, "");
  
  const terms = new Set([trimmed, ...(SEARCH_ALIASES[compact] || []), ...(SEARCH_ALIASES[normalized] || [])]);

  const upper = value.toUpperCase();
  if (upper.includes("IIT ")) terms.add(upper.replace("IIT ", "INDIAN INSTITUTE OF TECHNOLOGY "));
  if (upper.includes("NIT ")) terms.add(upper.replace("NIT ", "NATIONAL INSTITUTE OF TECHNOLOGY "));
  if (upper.includes("IIIT ")) terms.add(upper.replace("IIIT ", "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY "));
  if (upper.includes("IIM ")) terms.add(upper.replace("IIM ", "INDIAN INSTITUTE OF MANAGEMENT "));
  if (upper.includes("AIIMS ")) terms.add(upper.replace("AIIMS ", "ALL INDIA INSTITUTE OF MEDICAL SCIENCES "));
  
  return Array.from(terms);
};
const { pool } = require('./src/config/database');

async function testQuery(queryStr) {
  const terms = expandSearchTerms(queryStr);
  console.log(`\nQuery: "${queryStr}" -> Terms:`, terms);
  
  if (terms.length === 0) return;
  
  const conditions = terms.map(t => `name ILIKE '%${t.replace(/'/g, "''")}%'`).join(' OR ');
  const sql = `SELECT id, name FROM colleges WHERE ${conditions}`;
  const res = await pool.query(sql);
  console.log("Matches:", res.rows);
}

async function run() {
  await testQuery("iit delhi");
  await testQuery("vit");
  await testQuery("srm");
  await testQuery("kkit");
  await testQuery("kiit");
  process.exit(0);
}
run();
