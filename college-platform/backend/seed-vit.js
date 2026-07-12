const { sequelize } = require('./src/config/database');
const College = require('./src/models/College');
const Cutoff = require('./src/models/Cutoff');
const Course = require('./src/models/Course');

const vitVelloreData = [
  { course: 'CSE', c1: 548, c2: 1520, c3: 8006, c4: 14200, c5: 18300 },
  { course: 'CSE (Data Science)', c1: 650, c2: 1450, c3: 8100, c4: 14900, c5: 19400 },
  { course: 'Information Technology', c1: 700, c2: 1600, c3: 9050, c4: 15300, c5: 19300 },
  { course: 'CSE (AI and Data Engineering)', c1: 720, c2: 1800, c3: 9150, c4: 15500, c5: 20200 },
  { course: 'CSE (AI and Machine Learning)', c1: 790, c2: 1900, c3: 9300, c4: 15800, c5: 20540 },
  { course: 'CSE (Cyber Security)', c1: 800, c2: 2200, c3: 9550, c4: 16000, c5: 20600 },
  { course: 'CSE (Information Security)', c1: 1200, c2: 3250, c3: 9800, c4: 16500, c5: 20750 },
  { course: 'CSE (Internet of Things)', c1: 1500, c2: 3500, c3: 8700, c4: 17110, c5: 20900 },
  { course: 'CSE and Business Systems', c1: 1580, c2: 3600, c3: 10350, c4: 17300, c5: 21300 },
  { course: 'CSE (Block Chain Technology)', c1: 1600, c2: 3750, c3: 10420, c4: 17800, c5: 21400 },
  { course: 'CSE (Bioinformatics)', c1: 700, c2: 2950, c3: 8600, c4: 13400, c5: 18500 },
  { course: 'Electronics and Communication Engineering', c1: 7200, c2: 10500, c3: 19800, c4: 23000, c5: 34500 },
  { course: 'ECE (Biomedical Engineering)', c1: 6500, c2: 9000, c3: 17000, c4: 18400, c5: 21500 },
  { course: 'Electronics Engineering (VLSI Design)', c1: 10100, c2: 14500, c3: 23200, c4: 26400, c5: 37300 },
  { course: 'Electrical and Computer Science Eng.', c1: 14800, c2: 17500, c3: 26600, c4: 30100, c5: 38500 },
  { course: 'Electrical and Electronics Engineering', c1: 19500, c2: 22500, c3: 31000, c4: 37800, c5: 41400 },
  { course: 'Electronics and Instrumentation Eng.', c1: 24200, c2: 23500, c3: 33400, c4: 37500, c5: 45300 },
  { course: 'Health Science Technology', c1: 13100, c2: 16300, c3: 22000, c4: 26000, c5: 29000 },
  { course: 'Biotechnology', c1: 14200, c2: 19300, c3: 26500, c4: 37300, c5: 48000 },
  { course: 'Mechanical Engineering', c1: 40000, c2: 79000, c3: 86000, c4: 88300, c5: 93400 },
  { course: 'Mechanical Engineering (Electric Vehicles)', c1: 51000, c2: 83000, c3: 87000, c4: 93000, c5: 94500 },
  { course: 'Mechanical Eng. (Manufacturing Eng.)', c1: 74000, c2: 88000, c3: 91000, c4: 96000, c5: 99000 },
  { course: 'Chemical Engineering', c1: 53000, c2: 82000, c3: 88000, c4: 92520, c5: 97000 },
  { course: 'Civil Engineering', c1: 54000, c2: 86000, c3: 89000, c4: 93000, c5: 98000 }
];

const vitChennaiData = [
  { course: 'Computer Science and Engineering', c1: 5000, c2: 8000, c3: 13000, c4: 21900, c5: 22500 },
  { course: 'CSE (AI and Machine Learning)', c1: 5500, c2: 13500, c3: 17500, c4: 23000, c5: 24000 },
  { course: 'CSE (AI and Robotics)', c1: 6300, c2: 14500, c3: 18500, c4: 24000, c5: 25000 },
  { course: 'CSE (Data Science)', c1: 8500, c2: 15500, c3: 19500, c4: 23000, c5: 24000 },
  { course: 'CSE (Cyber Physical Systems)', c1: 11500, c2: 16500, c3: 22500, c4: 24500, c5: 25500 },
  { course: 'CSE (Cyber Security)', c1: 9800, c2: 15800, c3: 21500, c4: 23500, c5: 24500 },
  { course: 'Electronics & Communication (ECE)', c1: 28500, c2: 34000, c3: 39500, c4: 42000, c5: 47000 },
  { course: 'Electronics and Computer Eng.', c1: 17000, c2: 31000, c3: 37000, c4: 41000, c5: 46000 },
  { course: 'Electronics Eng. (VLSI Design)', c1: 37500, c2: 41000, c3: 43500, c4: 45500, c5: 49000 },
  { course: 'Electrical & Computer Science Eng.', c1: 36000, c2: 43000, c3: 47500, c4: 52000, c5: 60000 },
  { course: 'Electrical & Electronics (EEE)', c1: 59000, c2: 64500, c3: 71400, c4: 77500, c5: 86000 },
  { course: 'Mechanical Engineering', c1: 80000, c2: 85600, c3: 88300, c4: 92400, c5: 95000 },
  { course: 'Mechatronics and Automation', c1: 83000, c2: 88000, c3: 91500, c4: 93400, c5: 94000 },
  { course: 'Mechanical Eng. (Electric Vehicles)', c1: 85000, c2: 89500, c3: 91000, c4: 93500, c5: 95500 },
  { course: 'Civil Engineering', c1: 85000, c2: 88500, c3: 91400, c4: 94000, c5: 97000 },
  { course: 'Fashion Technology', c1: 81000, c2: 84500, c3: 85500, c4: 91400, c5: 96500 }
];

async function seedVit() {
  await sequelize.sync();

  // VIT Vellore
  let vitVellore = await College.findOne({ where: { name: 'Vellore Institute of Technology' } });
  if (!vitVellore) {
    vitVellore = await College.create({
      name: 'Vellore Institute of Technology',
      location: 'Vellore',
      state: 'Tamil Nadu',
      rating: 4.8,
      overview: 'VIT Vellore is one of the top private engineering institutions in India.',
      established_year: 1984,
      college_type: 'Private',
      affiliation: 'Deemed University',
      website: 'https://vit.ac.in',
      naac_grade: 'A++',
      nirf_rank: 11
    });
  }

  // VIT Chennai
  let vitChennai = await College.findOne({ where: { name: 'VIT Chennai' } });
  if (!vitChennai) {
    vitChennai = await College.create({
      name: 'VIT Chennai',
      location: 'Chennai',
      state: 'Tamil Nadu',
      rating: 4.6,
      overview: 'VIT Chennai is a prominent campus of the VIT group offering excellent engineering programs.',
      established_year: 2010,
      college_type: 'Private',
      affiliation: 'Deemed University',
      website: 'https://chennai.vit.ac.in',
      naac_grade: 'A++',
      nirf_rank: null
    });
  }
  
  // VIT AP
  let vitAP = await College.findOne({ where: { name: 'VIT AP' } });
  if (!vitAP) {
    vitAP = await College.create({
      name: 'VIT AP',
      location: 'Amaravati',
      state: 'Andhra Pradesh',
      rating: 4.3,
      overview: 'VIT AP provides dynamic engineering education with strong industry collaborations.',
      established_year: 2017,
      college_type: 'Private',
      affiliation: 'Deemed University',
      website: 'https://vitap.ac.in',
      naac_grade: 'A',
      nirf_rank: null
    });
    // Add generic CSE cutoffs for AP
    await Cutoff.create({ college_id: vitAP.id, college_name: 'VIT AP', exam_name: 'VITEEE', course_name: 'CSE', category: 'General', opening_rank: 40000, closing_rank: 95000, year: 2024, round: 1 });
  }

  // VIT Bhopal
  let vitBhopal = await College.findOne({ where: { name: 'VIT Bhopal' } });
  if (!vitBhopal) {
    vitBhopal = await College.create({
      name: 'VIT Bhopal',
      location: 'Bhopal',
      state: 'Madhya Pradesh',
      rating: 4.2,
      overview: 'VIT Bhopal focuses on future-ready technology and immersive learning.',
      established_year: 2017,
      college_type: 'Private',
      affiliation: 'Deemed University',
      website: 'https://vitbhopal.ac.in',
      naac_grade: 'A',
      nirf_rank: null
    });
    // Add generic CSE cutoffs for Bhopal
    await Cutoff.create({ college_id: vitBhopal.id, college_name: 'VIT Bhopal', exam_name: 'VITEEE', course_name: 'CSE', category: 'General', opening_rank: 40000, closing_rank: 95000, year: 2024, round: 1 });
  }

  // Delete old VIT Vellore cutoffs to prevent duplicates
  await Cutoff.destroy({ where: { college_id: vitVellore.id, exam_name: 'VITEEE' } });
  await Cutoff.destroy({ where: { college_id: vitChennai.id, exam_name: 'VITEEE' } });

  console.log('Seeding VIT Vellore cutoffs...');
  for (const item of vitVelloreData) {
    await Cutoff.create({ college_id: vitVellore.id, college_name: 'Vellore Institute of Technology', exam_name: 'VITEEE', course_name: item.course, category: 'General', opening_rank: 1, closing_rank: item.c1, year: 2024, round: 1 });
    await Cutoff.create({ college_id: vitVellore.id, college_name: 'Vellore Institute of Technology', exam_name: 'VITEEE', course_name: item.course, category: 'Category 2', opening_rank: item.c1 + 1, closing_rank: item.c2, year: 2024, round: 2 });
    await Cutoff.create({ college_id: vitVellore.id, college_name: 'Vellore Institute of Technology', exam_name: 'VITEEE', course_name: item.course, category: 'Category 3', opening_rank: item.c2 + 1, closing_rank: item.c3, year: 2024, round: 3 });
    await Cutoff.create({ college_id: vitVellore.id, college_name: 'Vellore Institute of Technology', exam_name: 'VITEEE', course_name: item.course, category: 'Category 4', opening_rank: item.c3 + 1, closing_rank: item.c4, year: 2024, round: 4 });
    await Cutoff.create({ college_id: vitVellore.id, college_name: 'Vellore Institute of Technology', exam_name: 'VITEEE', course_name: item.course, category: 'Category 5', opening_rank: item.c4 + 1, closing_rank: item.c5, year: 2024, round: 5 });
  }

  console.log('Seeding VIT Chennai cutoffs...');
  for (const item of vitChennaiData) {
    await Cutoff.create({ college_id: vitChennai.id, college_name: 'VIT Chennai', exam_name: 'VITEEE', course_name: item.course, category: 'General', opening_rank: 1, closing_rank: item.c1, year: 2024, round: 1 });
    await Cutoff.create({ college_id: vitChennai.id, college_name: 'VIT Chennai', exam_name: 'VITEEE', course_name: item.course, category: 'Category 2', opening_rank: item.c1 + 1, closing_rank: item.c2, year: 2024, round: 2 });
    await Cutoff.create({ college_id: vitChennai.id, college_name: 'VIT Chennai', exam_name: 'VITEEE', course_name: item.course, category: 'Category 3', opening_rank: item.c2 + 1, closing_rank: item.c3, year: 2024, round: 3 });
    await Cutoff.create({ college_id: vitChennai.id, college_name: 'VIT Chennai', exam_name: 'VITEEE', course_name: item.course, category: 'Category 4', opening_rank: item.c3 + 1, closing_rank: item.c4, year: 2024, round: 4 });
    await Cutoff.create({ college_id: vitChennai.id, college_name: 'VIT Chennai', exam_name: 'VITEEE', course_name: item.course, category: 'Category 5', opening_rank: item.c4 + 1, closing_rank: item.c5, year: 2024, round: 5 });
  }

  console.log('VIT Seeding Complete!');
  process.exit(0);
}

seedVit();
