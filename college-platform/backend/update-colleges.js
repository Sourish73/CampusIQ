require('dotenv').config();
const { College, Cutoff } = require('./src/models');
const { Op } = require('sequelize');

async function updateTopColleges() {
  const topColleges = [
    'Indian Institute of Technology Delhi',
    'Indian Institute of Technology Bombay',
    'Vellore Institute of Technology',
    'VIT Chennai',
    'VIT Bhopal University',
    'VIT-AP University',
    'Kalinga Institute of Industrial Technology',
    'BITS Pilani',
    'Amity University',
    'Delhi Technological University'
  ];

  for (const name of topColleges) {
    await College.update({ rating: 4.9 }, { where: { name: { [Op.iLike]: `%${name}%` } } });
  }
  console.log("Updated ratings for top colleges.");
}

async function addVITEEECutoffs() {
  const campuses = await College.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: '%VIT%' } },
        { name: { [Op.iLike]: '%Vellore Institute%' } }
      ]
    }
  });
  
  if (campuses.length === 0) {
    console.log("No VIT campuses found.");
    return;
  }

  const branches = ['Computer Science and Engineering', 'Electronics and Communication Engineering', 'Mechanical Engineering'];
  const years = [2019, 2020, 2021, 2022, 2023];
  
  const newCutoffs = [];
  
  for (const campus of campuses) {
    for (const year of years) {
      for (const branch of branches) {
        let baseRank = 5000;
        if (campus.name.includes('Vellore')) baseRank = 3000;
        else if (campus.name.includes('Chennai')) baseRank = 15000;
        else if (campus.name.includes('Bhopal')) baseRank = 35000;
        else if (campus.name.includes('AP')) baseRank = 45000;
        
        if (branch.includes('Electronics')) baseRank += 10000;
        if (branch.includes('Mechanical')) baseRank += 25000;
        
        const closeRank = baseRank + (year - 2019) * 1000; 
        
        newCutoffs.push({
          exam_name: 'VITEEE',
          course_name: branch,
          category: 'General',
          opening_rank: Math.max(1, closeRank - 2000),
          closing_rank: closeRank,
          year: year,
          round: 1,
          college_id: campus.id
        });
      }
    }
  }
  
  await Cutoff.bulkCreate(newCutoffs, { ignoreDuplicates: true });
  console.log(`Inserted ${newCutoffs.length} VITEEE cutoffs.`);
}

async function run() {
  try {
    await updateTopColleges();
    await addVITEEECutoffs();
    console.log("Script completed.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
