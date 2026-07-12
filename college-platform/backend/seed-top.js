const { sequelize } = require("./src/config/database");
const College = require("./src/models/College");
const Course = require("./src/models/Course");
const Placement = require("./src/models/Placement");
const Cutoff = require("./src/models/Cutoff");

const colleges = [
  {
    name: "Indian Institute of Technology Bombay",
    location: "Mumbai",
    state: "Maharashtra",
    rating: 4.9,
    college_type: "government",
    established_year: 1958,
    affiliation: "Autonomous",
    naac_grade: "A++",
    nirf_rank: 3,
    total_intake: 1200,
    website: "https://www.iitb.ac.in",
    image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/1/1d/Indian_Institute_of_Technology_Bombay_Logo.svg/1200px-Indian_Institute_of_Technology_Bombay_Logo.svg.png",
    overview: "IIT Bombay is a globally recognized engineering and research institution located in Powai, Mumbai. It is known for its rigorous academic programs, cutting-edge research facilities, and exceptional placement records.",
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 Years", fees: 900000, fees_per_year: 225000, degree_type: "UG", specialisation: "Computer Science", seats_available: 171 },
      { name: "B.Tech Electrical Engineering", duration: "4 Years", fees: 900000, fees_per_year: 225000, degree_type: "UG", specialisation: "Electrical", seats_available: 154 }
    ],
    placements: [
      { year: 2024, average_ctc: 21.8, median_ctc: 19.6, highest_ctc: 367.0, placement_percentage: 82, top_recruiters: "Google, Microsoft, Apple, Jane Street", total_offers: 1340 }
    ],
    cutoffs: [
      { exam_name: "JEE Advanced", course_name: "CSE", category: "General", opening_rank: 1, closing_rank: 68, year: 2024, round: 6 }
    ]
  },
  {
    name: "Vellore Institute of Technology",
    location: "Vellore",
    state: "Tamil Nadu",
    rating: 4.5,
    college_type: "deemed",
    established_year: 1984,
    affiliation: "Deemed University",
    naac_grade: "A++",
    nirf_rank: 11,
    total_intake: 5000,
    website: "https://vit.ac.in",
    image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c5/Vellore_Institute_of_Technology_seal_2017.svg/1200px-Vellore_Institute_of_Technology_seal_2017.svg.png",
    overview: "VIT Vellore is one of India's premier private engineering institutions, famous for its flexible credit system (FFCS) and massive placement drives.",
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 Years", fees: 1980000, fees_per_year: 495000, degree_type: "UG", specialisation: "Computer Science", seats_available: 1080 }
    ],
    placements: [
      { year: 2024, average_ctc: 9.2, median_ctc: 8.0, highest_ctc: 102.0, placement_percentage: 90, top_recruiters: "TCS, Cognizant, Wipro, Microsoft, Amazon", total_offers: 14345 }
    ],
    cutoffs: [
      { exam_name: "VITEEE", course_name: "CSE", category: "General", opening_rank: 1, closing_rank: 8000, year: 2024, round: 1 }
    ]
  },
  {
    name: "SRM Institute of Science and Technology",
    location: "Chennai",
    state: "Tamil Nadu",
    rating: 4.2,
    college_type: "deemed",
    established_year: 1985,
    affiliation: "Deemed University",
    naac_grade: "A++",
    nirf_rank: 18,
    total_intake: 6000,
    website: "https://www.srmist.edu.in",
    image_url: "https://upload.wikimedia.org/wikipedia/en/thumb/f/fe/Srmseal.png/220px-Srmseal.png",
    overview: "SRM Institute of Science and Technology is a top-ranking private university in India, offering a wide range of undergraduate and postgraduate programs with robust industry connections.",
    courses: [
      { name: "B.Tech Computer Science and Engineering", duration: "4 Years", fees: 1800000, fees_per_year: 450000, degree_type: "UG", specialisation: "Computer Science", seats_available: 1200 }
    ],
    placements: [
      { year: 2024, average_ctc: 7.5, median_ctc: 6.5, highest_ctc: 52.0, placement_percentage: 85, top_recruiters: "Amazon, TCS, Wipro, Infosys", total_offers: 8500 }
    ],
    cutoffs: [
      { exam_name: "SRMJEEE", course_name: "CSE", category: "General", opening_rank: 1, closing_rank: 10000, year: 2024, round: 1 }
    ]
  }
];

async function seed() {
  await sequelize.sync();
  for (const c of colleges) {
    await College.destroy({ where: { name: c.name } });
    const college = await College.create(c);
    
    for (const crs of c.courses) {
      await Course.create({ ...crs, college_id: college.id });
    }
    for (const pl of c.placements) {
      await Placement.create({ ...pl, college_id: college.id });
    }
    for (const cut of c.cutoffs) {
      await Cutoff.create({ ...cut, college_id: college.id });
    }
  }
  console.log("Top colleges fully seeded!");
  process.exit(0);
}

seed();
