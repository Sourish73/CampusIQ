require("dotenv").config();
const { College, Course, Placement, Cutoff, Review } = require("./src/models");
const { Op } = require("sequelize");
const { expandSearchTerms } = require("./src/controllers/collegeController");

const fullCollegeIncludes = [
  { model: Course, as: "courses", attributes: { exclude: ["createdAt", "updatedAt"] } },
  { model: Placement, as: "placements", attributes: { exclude: ["createdAt", "updatedAt"] }, separate: true, order: [["year", "DESC"]] },
];

async function test() {
  const rawQuery = "IIT Bombay";
  const conditions = [];
  const searchTerms = expandSearchTerms(rawQuery);

  for (const term of searchTerms) {
    const trimmed = term.trim();
    if (!trimmed) continue;

    conditions.push({ name: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ location: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ state: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ affiliation: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ website: { [Op.iLike]: `%${trimmed}%` } });
  }

  const existing = await College.findOne({
    where: { [Op.or]: conditions },
    include: fullCollegeIncludes,
  });

  console.log("Existing found?", existing ? existing.name : "NULL");
  process.exit(0);
}
test();
