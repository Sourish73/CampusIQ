

"use strict";

const { Op } = require("sequelize");
const { College, Course, Placement, Cutoff, Review, SavedItem, User } = require("../models");
const {
  fetchCollegeFromGemini,
  fetchCollegeSummary,
  fetchCollegeReviews,
  fetchCollegeComparison,
  isLikelyUrl,
  normalizeUrl,
  normalizeCollegeQuery,
  buildFallbackCollegeProfile,
  mergeCollegeProfiles,
} = require("../services/geminiService");
const { validationResult } = require("express-validator");


const buildPaginationMeta = (total, page, limit) => ({
  total,
  page: parseInt(page, 10),
  limit: parseInt(limit, 10),
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});


const safeInt = (val, fallback) => {
  const n = parseInt(val, 10);
  return isNaN(n) ? fallback : n;
};

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
  iim: ["Indian Institute of Management"],
  bits: ["BITS Pilani", "Birla Institute of Technology and Science"],
  manipal: ["Manipal Institute of Technology"],
  delhi: ["Delhi", "New Delhi", "Delhi Technological University", "Netaji Subhas University of Technology"],
};

const expandSearchTerms = (value = "") => {
  const trimmed = value.trim();
  if (!trimmed) return [];

  const normalized = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const compact = normalized.replace(/\s+/g, "");
  const aliases = SEARCH_ALIASES[compact] || SEARCH_ALIASES[normalized] || [];

  return Array.from(new Set([trimmed, ...aliases]));
};


const getColleges = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      sortBy = "rating",
      sortOrder = "DESC",
    } = req.query;

    const { sequelize } = require("../config/database");

    // ── Build WHERE clause ───────────────────────────────────────────────────
    const where = {
      rating: { [Op.gt]: 0 }, // Only show valid colleges
      [Op.and]: [
        sequelize.literal('EXISTS (SELECT 1 FROM courses WHERE courses.college_id = "College".id)'),
        sequelize.literal('EXISTS (SELECT 1 FROM placements WHERE placements.college_id = "College".id)')
      ]
    };

    // ── Search Logic (Name, Location, State, Affiliation) ─────────────────────
    const searchTerms = expandSearchTerms(search);
    if (searchTerms.length) {
      where[Op.or] = searchTerms.flatMap((term) => [
        { name: { [Op.iLike]: `%${term}%` } },
        { location: { [Op.iLike]: `%${term}%` } },
        { state: { [Op.iLike]: `%${term}%` } },
        { affiliation: { [Op.iLike]: `%${term}%` } },
      ]);
    }

    // ── Pagination ───────────────────────────────────────────────────────────
    const pageNum = Math.max(1, safeInt(page, 1));
    const limitNum = Math.min(50, Math.max(1, safeInt(limit, 10))); // cap at 50 results
    const offset = (pageNum - 1) * limitNum;



    // ── Query Database ────────────────────────────────────────────────────────
    const { count, rows } = await College.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "name", "fees", "duration", "degree_type"],
          separate: false,
        },
        {
          model: Placement,
          as: "placements",
          attributes: ["year", "average_ctc", "highest_ctc", "placement_percentage"],
          limit: 1,
          order: [["year", "DESC"]],
          separate: true, 
        },
      ],
      limit: limitNum,
      offset,
      
      distinct: true, 
    });

    return res.status(200).json({
      success: true,
      data: {
        colleges: rows,
        pagination: buildPaginationMeta(count, pageNum, limitNum),
      },
    });
  } catch (error) {
    console.error("[CollegeController.getColleges]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch colleges." });
  }
};
// ─── GET /api/colleges/:id ────────────────────────────────────────────────────

 
const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    const includeList = [
      {
        model: Course,
        as: "courses",
        attributes: { exclude: ["createdAt", "updatedAt"] },
      },
      {
        model: Placement,
        as: "placements",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        order: [["year", "DESC"]],
      },
      {
        model: Cutoff,
        as: "cutoffs",
        attributes: { exclude: ["createdAt", "updatedAt"] },
        order: [["year", "DESC"], ["exam_name", "ASC"]],
      },
      {
        model: Review,
        as: "reviews",
        attributes: { exclude: ["updatedAt"] },
        order: [["createdAt", "DESC"]],
        limit: 20,
      },
    ];

    let college = await College.findByPk(id, {
      include: includeList,
    });

    if (!college) {
      return res.status(404).json({ success: false, message: "College not found." });
    }

    // Dynamic enrichment if database details are missing
    if ((!college.courses || college.courses.length === 0) && (!college.placements || college.placements.length === 0)) {
      console.log(`[Dynamic Enrichment] College "${college.name}" (ID: ${college.id}) is missing details. Querying Gemini...`);
      try {
        let collegeData = null;
        try {
          collegeData = await withTimeout(
            fetchCollegeFromGemini(college.name),
            15000,
            "AI dynamic college lookup timed out"
          );
        } catch (aiError) {
          console.warn("[Dynamic Enrichment] Gemini lookup failed, using fallback:", aiError.message);
          collegeData = await buildFallbackCollegeProfile({
            query: college.name,
            sourceUrl: college.website || "",
          });
        }

        await saveGeminiCollege(collegeData, college.id);
        
        // Reload with the newly saved details
        college = await College.findByPk(id, {
          include: includeList,
        });
      } catch (enrichError) {
        console.error("[Dynamic Enrichment] Failed to enrich college:", enrichError);
      }
    }

    return res.status(200).json({ success: true, data: { college } });
  } catch (error) {
    console.error("[CollegeController.getCollegeById]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch college details." });
  }
};

// ─── GET /api/colleges/compare-batch ─────────────────────────────────────────


const compareColleges = async (req, res) => {
  try {  
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({
        success: false,
        message: "Query param `ids` is required (comma-separated college IDs).",
      });
    }

    const idArray = ids
      .split(",")
      .map((id) => parseInt(id.trim(), 10))
      .filter((id) => !isNaN(id) && id > 0);

    if (idArray.length < 1) {
      return res.status(400).json({
        success: false,
        message: "At least 1 college ID is required for comparison.",
      });
    }

    if (idArray.length > 3) {
      return res.status(400).json({
        success: false,
        message: "Maximum 3 colleges can be compared at a time.",
      });
    }

    const colleges = await College.findAll({
      where: { id: { [Op.in]: idArray } },
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["name", "fees", "duration", "degree_type"],
          separate: true,
          limit: 5,
        },
        {
          model: Placement,
          as: "placements",
          attributes: ["year", "average_ctc", "highest_ctc", "placement_percentage", "top_recruiters"],
          separate: true,
          limit: 1,
          order: [["year", "DESC"]],
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: { colleges },
    });
  } catch (error) {
    console.error("[CollegeController.compareColleges]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch comparison data." });
  }
};


// ─── Saved Items ──────────────────────────────────────────────────────────────


const getSavedItems = async (req, res) => {
  try {
    const savedItems = await SavedItem.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: College,
          as: "college",
          attributes: ["id", "name", "location", "state", "rating", "college_type", "image_url", "naac_grade"],
          include: [
            {
              model: Placement,
              as: "placements",
              attributes: ["average_ctc", "highest_ctc", "placement_percentage", "year"],
              separate: true,
              limit: 1,
              order: [["year", "DESC"]],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, data: { savedItems } });
  } catch (error) {
    console.error("[CollegeController.getSavedItems]", error);
    return res.status(500).json({ success: false, message: "Failed to fetch saved colleges." });
  }
};


const addSavedItem = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { college_id, notes } = req.body;

    // Verify college exists
    const college = await College.findByPk(college_id, { attributes: ["id", "name"] });
    if (!college) {
      return res.status(404).json({ success: false, message: "College not found." });
    }

    // findOrCreate prevents duplicates (enforced at DB level too)
    const [savedItem, created] = await SavedItem.findOrCreate({
      where: { user_id: req.user.id, college_id },
      defaults: { notes },
    });

    if (!created) {
      return res.status(409).json({
        success: false,
        message: "College is already in your saved list.",
      });
    }

    return res.status(201).json({
      success: true,
      message: `${college.name} added to your saved colleges.`,
      data: { savedItem },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "College already saved." });
    }
    console.error("[CollegeController.addSavedItem]", error);
    return res.status(500).json({ success: false, message: "Failed to save college." });
  }
};


const removeSavedItem = async (req, res) => {
  try {
    const { collegeId } = req.params;

    const deleted = await SavedItem.destroy({
      where: {
        user_id: req.user.id,
        college_id: parseInt(collegeId, 10),
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Saved item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "College removed from your saved list.",
    });
  } catch (error) {
    console.error("[CollegeController.removeSavedItem]", error);
    return res.status(500).json({ success: false, message: "Failed to remove saved college." });
  }
};

const legacySearchOrFetchCollege = async (req, res) => {
  try {
    const { name } = req.query;
 
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query param `name` is required. e.g. ?name=NIT Trichy",
      });
    }
 
    const collegeName = name.trim();
 
    // ── Step 1: Check DB first ────────────────────────────────────────────────
    const existing = await College.findOne({
      where: { name: { [Op.iLike]: `%${collegeName}%` } },
      include: [
        { model: Course, as: "courses", attributes: { exclude: ["createdAt", "updatedAt"] } },
        { model: Placement, as: "placements", attributes: { exclude: ["createdAt", "updatedAt"] }, separate: true, order: [["year", "DESC"]] },
        { model: Cutoff, as: "cutoffs", attributes: { exclude: ["createdAt", "updatedAt"] }, separate: true },
        { model: Review, as: "reviews", attributes: { exclude: ["updatedAt"] }, separate: true, limit: 5 },
      ],
    });
 
    if (existing) {
      return res.status(200).json({
        success: true,
        source: "database",
        data: { college: existing },
      });
    }
 
    // ── Step 2: Not in DB — fetch from Gemini ────────────────────────────────
    console.log(`[AI Lookup] Fetching "${collegeName}" from the model...`);
    const { fetchCollegeFromGemini } = require("../services/geminiService");
    const geminiData = await fetchCollegeFromGemini(collegeName);
 
    // ── Step 3: Save to DB so next search is instant ─────────────────────────
    const { sequelize } = require("../config/database");
 
    const savedCollege = await sequelize.transaction(async (t) => {
      const college = await College.create(
        {
          name: geminiData.name,
          location: geminiData.location,
          state: geminiData.state,
          rating: geminiData.rating || 0,
          college_type: geminiData.college_type || "private",
          established_year: geminiData.established_year,
          affiliation: geminiData.affiliation,
          naac_grade: geminiData.naac_grade,
          nirf_rank: geminiData.nirf_rank,
          total_intake: geminiData.total_intake,
          website: geminiData.website,
          image_url: geminiData.image_url || "",
          overview: geminiData.overview,
        },
        { transaction: t }
      );
 
      // Save courses
      if (geminiData.courses?.length) {
        await Course.bulkCreate(
          geminiData.courses.map((c) => ({ ...c, college_id: college.id })),
          { transaction: t }
        );
      }
 
      // Save placements
      if (geminiData.placements?.length) {
        await Placement.bulkCreate(
          geminiData.placements.map((p) => ({ ...p, college_id: college.id })),
          { transaction: t }
        );
      }
 
      // Save cutoffs
      if (geminiData.cutoffs?.length) {
        await Cutoff.bulkCreate(
          geminiData.cutoffs.map((c) => ({ ...c, college_id: college.id })),
          { transaction: t }
        );
      }
 
      // Save reviews
      if (geminiData.reviews?.length) {
        await Review.bulkCreate(
          geminiData.reviews.map((r) => ({ ...r, college_id: college.id })),
          { transaction: t }
        );
      }
 
      return college.id;
    });
 
    // Fetch the fully populated college back
    const fullCollege = await College.findByPk(savedCollege, {
      include: [
        { model: Course, as: "courses", attributes: { exclude: ["createdAt", "updatedAt"] } },
        { model: Placement, as: "placements", attributes: { exclude: ["createdAt", "updatedAt"] }, separate: true, order: [["year", "DESC"]] },
        { model: Cutoff, as: "cutoffs", attributes: { exclude: ["createdAt", "updatedAt"] }, separate: true },
        { model: Review, as: "reviews", attributes: { exclude: ["updatedAt"] }, separate: true, limit: 5 },
      ],
    });
 
    return res.status(201).json({
      success: true,
      source: "ai_lookup",
      message: `"${geminiData.name}" profile fetched and saved to database.`,
      data: { college: fullCollege },
    });
 
  } catch (error) {
    console.error("[CollegeController.searchOrFetchCollege]", error);
 
    if (error instanceof SyntaxError) {
      return res.status(502).json({
        success: false,
        message: "The model returned invalid data. Try again or rephrase the college name.",
      });
    }
 
    return res.status(500).json({
      success: false,
      message: "College search failed.",
      error: error.message,
    });
  }
};

const findCollegeInDatabase = async ({ rawQuery = "", requestedUrl = "" }) => {
  const conditions = [];
  const searchTerms = expandSearchTerms(rawQuery);

  if (requestedUrl) {
    const normalizedWebsite = normalizeUrl(requestedUrl);
    const websiteVariants = Array.from(
      new Set([
        requestedUrl,
        normalizedWebsite,
        normalizedWebsite.replace(/^https?:\/\//i, ""),
      ])
    ).filter(Boolean);

    for (const website of websiteVariants) {
      conditions.push({ website: { [Op.iLike]: `%${website}%` } });
      conditions.push({ name: { [Op.iLike]: `%${website}%` } });
    }
  }

  for (const term of searchTerms) {
    const trimmed = term.trim();
    if (!trimmed) continue;

    conditions.push({ name: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ location: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ state: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ affiliation: { [Op.iLike]: `%${trimmed}%` } });
    conditions.push({ website: { [Op.iLike]: `%${trimmed}%` } });
  }

  if (!conditions.length) return null;

  return College.findOne({
    where: { [Op.or]: conditions },
    include: fullCollegeIncludes,
  });
};
 
const fullCollegeIncludes = [
  { model: Course, as: "courses", attributes: { exclude: ["createdAt", "updatedAt"] } },
  {
    model: Placement,
    as: "placements",
    attributes: { exclude: ["createdAt", "updatedAt"] },
    separate: true,
    order: [["year", "DESC"]],
  },
  {
    model: Cutoff,
    as: "cutoffs",
    attributes: { exclude: ["createdAt", "updatedAt"] },
    separate: true,
    order: [["year", "DESC"], ["exam_name", "ASC"]],
  },
  {
    model: Review,
    as: "reviews",
    attributes: { exclude: ["updatedAt"] },
    separate: true,
    limit: 5,
    order: [["createdAt", "DESC"]],
  },
];

const allowedCollegeTypes = new Set(["government", "private", "deemed", "central"]);
const allowedDegreeTypes = new Set(["UG", "PG", "PhD", "Diploma"]);
const allowedCategories = new Set(["General", "OBC", "SC", "ST", "EWS", "PWD"]);

const numberOrNull = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const intOrNull = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

const clampRating = (value) => {
  const parsed = numberOrNull(value);
  if (parsed === null) return 0;
  return Math.min(5, Math.max(0, parsed));
};

const withTimeout = (promise, ms, message) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);

const getExistingCollege = async (queryText, website = "") => {
  const conditions = [];
  for (const term of expandSearchTerms(queryText)) {
    conditions.push({ name: { [Op.iLike]: `%${term}%` } });
    conditions.push({ location: { [Op.iLike]: `%${term}%` } });
    conditions.push({ state: { [Op.iLike]: `%${term}%` } });
  }
  if (website) {
    const withoutProtocol = website.replace(/^https?:\/\//i, "");
    conditions.push({ website: { [Op.iLike]: `%${withoutProtocol}%` } });
  }

  if (!conditions.length) return null;

  return College.findOne({
    where: { [Op.or]: conditions },
    include: fullCollegeIncludes,
  });
};

const saveGeminiCollege = async (geminiData, collegeId = null) => {
  const { sequelize } = require("../config/database");
  const isUpdate = !!collegeId;

  return sequelize.transaction(async (t) => {
    const payload = {
      name: geminiData.name || "Unknown College",
      location: geminiData.location || "Unknown",
      state: geminiData.state || "Unknown",
      rating: clampRating(geminiData.rating),
      college_type: allowedCollegeTypes.has(geminiData.college_type) ? geminiData.college_type : "private",
      established_year: intOrNull(geminiData.established_year),
      affiliation: geminiData.affiliation || null,
      naac_grade: geminiData.naac_grade || null,
      nirf_rank: intOrNull(geminiData.nirf_rank),
      total_intake: intOrNull(geminiData.total_intake),
      website: geminiData.website || null,
      image_url: geminiData.image_url || "",
      overview: geminiData.overview || null,
    };

    let college;
    if (isUpdate) {
      await Promise.all([
        Course.destroy({ where: { college_id: collegeId }, transaction: t }),
        Placement.destroy({ where: { college_id: collegeId }, transaction: t }),
        Cutoff.destroy({ where: { college_id: collegeId }, transaction: t }),
        Review.destroy({ where: { college_id: collegeId }, transaction: t }),
      ]);

      await College.update(payload, { where: { id: collegeId }, transaction: t });
      college = await College.findByPk(collegeId, { transaction: t });
    } else {
      college = await College.create(payload, { transaction: t });
    }

    const college_id = college.id;

    if (Array.isArray(geminiData.courses) && geminiData.courses.length) {
      await Course.bulkCreate(
        geminiData.courses
          .filter((course) => course?.name)
          .map((course) => ({
            name: course.name,
            duration: course.duration || null,
            fees: numberOrNull(course.fees),
            fees_per_year: numberOrNull(course.fees_per_year),
            degree_type: allowedDegreeTypes.has(course.degree_type) ? course.degree_type : "UG",
            specialisation: course.specialisation || null,
            seats_available: intOrNull(course.seats_available),
            college_id,
          })),
        { transaction: t }
      );
    }

    if (Array.isArray(geminiData.placements) && geminiData.placements.length) {
      await Placement.bulkCreate(
        geminiData.placements
          .filter((placement) => intOrNull(placement?.year))
          .map((placement) => ({
            year: intOrNull(placement.year),
            average_ctc: numberOrNull(placement.average_ctc),
            median_ctc: numberOrNull(placement.median_ctc),
            highest_ctc: numberOrNull(placement.highest_ctc),
            placement_percentage: numberOrNull(placement.placement_percentage),
            top_recruiters: Array.isArray(placement.top_recruiters) ? placement.top_recruiters.join(", ") : placement.top_recruiters || null,
            total_offers: intOrNull(placement.total_offers),
            college_id,
          })),
        { transaction: t }
      );
    }

    if (Array.isArray(geminiData.cutoffs) && geminiData.cutoffs.length) {
      await Cutoff.bulkCreate(
        geminiData.cutoffs
          .filter((cutoff) => cutoff?.exam_name && intOrNull(cutoff?.closing_rank))
          .map((cutoff) => ({
            exam_name: cutoff.exam_name,
            course_name: cutoff.course_name || null,
            category: allowedCategories.has(cutoff.category) ? cutoff.category : "General",
            opening_rank: intOrNull(cutoff.opening_rank),
            closing_rank: intOrNull(cutoff.closing_rank),
            year: intOrNull(cutoff.year) || new Date().getFullYear(),
            round: intOrNull(cutoff.round),
            college_id,
          })),
        { transaction: t }
      );
    }

    if (Array.isArray(geminiData.reviews) && geminiData.reviews.length) {
      await Review.bulkCreate(
        geminiData.reviews.map((review) => ({
          reviewer_name: review.reviewer_name || "CampusIQ Research",
          batch_year: intOrNull(review.batch_year),
          rating: clampRating(review.rating),
          infrastructure_rating: clampRating(review.infrastructure_rating),
          faculty_rating: clampRating(review.faculty_rating),
          placement_rating: clampRating(review.placement_rating),
          title: review.title || "Research summary",
          body: review.body || "College information generated from public sources.",
          pros: review.pros || null,
          cons: review.cons || null,
          college_id,
        })),
        { transaction: t }
      );
    }

    return college_id;
  });
};

const searchOrFetchCollege = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Query param `name` is required. Example: ?name=NIT Trichy or ?name=https://www.iitb.ac.in",
      });
    }

    const rawQuery = name.trim();
    const requestedUrl = isLikelyUrl(rawQuery) ? normalizeUrl(rawQuery) : "";
    const queryText = requestedUrl ? rawQuery : normalizeCollegeQuery(rawQuery);

    let collegeData = null;
    let source = "ai_enriched";

    try {
      console.log(`[AI Lookup] Fetching "${queryText}" from Gemini...`);
      collegeData = await withTimeout(
        fetchCollegeFromGemini(queryText),
        15000,
        "AI college lookup timed out"
      );
    } catch (aiError) {
      console.warn("[CollegeController.searchOrFetchCollege] AI lookup failed, checking DB fallback:", aiError.message);
      
      // Fallback 1: Look up database
      const existing = await findCollegeInDatabase({
        rawQuery,
        requestedUrl,
      });

      if (existing && (existing.courses?.length > 0 || existing.placements?.length > 0)) {
        return res.status(200).json({
          success: true,
          source: "database",
          message: `"${existing.name}" loaded from database.`,
          data: { college: existing },
        });
      }

      // Fallback 2: Generate fallback profile with realistic details (NOT N/A or empty/black columns)
      collegeData = await buildFallbackCollegeProfile({
        query: queryText,
        sourceUrl: requestedUrl,
      });
      source = "web_lookup_fallback";
    }

    const matchedCollege = await getExistingCollege(collegeData.name, collegeData.website || requestedUrl);
    const statusCode = matchedCollege ? 200 : 201;
    const savedCollegeId = await saveGeminiCollege(collegeData, matchedCollege?.id || null);

    const fullCollege = await College.findByPk(savedCollegeId, {
      include: fullCollegeIncludes,
    });

    return res.status(statusCode).json({
      success: true,
      source,
      message: `"${fullCollege.name}" profile loaded.`,
      data: { college: fullCollege },
    });
  } catch (error) {
    console.error("[CollegeController.searchOrFetchCollege]", error);

    return res.status(500).json({
      success: false,
      message: "College search failed.",
      error: error.message,
    });
  }
};

const getCollegeSummary = async (req, res) => {
  const name = String(req.query.name || "").trim();
  if (!name) {
    return res.status(400).json({ success: false, message: "College name is required." });
  }

  const summary = await fetchCollegeSummary(name);
  return res.json({ success: true, data: summary });
};

const getCollegeReviewsAI = async (req, res) => {
  const name = String(req.query.name || "").trim();
  if (!name) {
    return res.status(400).json({ success: false, message: "College name is required." });
  }

  const reviews = await fetchCollegeReviews(name);
  return res.json({ success: true, data: reviews });
};

const compareCollegesAI = async (req, res) => {
  const college1 = String(req.body.college1 || "").trim();
  const college2 = String(req.body.college2 || "").trim();
  if (!college1 || !college2) {
    return res.status(400).json({
      success: false,
      message: "Both college1 and college2 are required.",
    });
  }

  const comparison = await fetchCollegeComparison({ college1, college2 });
  return res.json({ success: true, data: comparison });
};

module.exports = {
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
};
