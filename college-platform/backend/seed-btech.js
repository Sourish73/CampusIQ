require('dotenv').config();
const { College } = require('./src/models');
const { Op } = require('sequelize');

const btechColleges = [
  // NITs
  { name: 'National Institute of Technology Tiruchirappalli', location: 'Tiruchirappalli, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Government' },
  { name: 'National Institute of Technology Surathkal', location: 'Surathkal, Karnataka', state: 'Karnataka', college_type: 'Government' },
  { name: 'National Institute of Technology Warangal', location: 'Warangal, Telangana', state: 'Telangana', college_type: 'Government' },
  { name: 'National Institute of Technology Rourkela', location: 'Rourkela, Odisha', state: 'Odisha', college_type: 'Government' },
  { name: 'National Institute of Technology Calicut', location: 'Kozhikode, Kerala', state: 'Kerala', college_type: 'Government' },
  { name: 'Malaviya National Institute of Technology Jaipur', location: 'Jaipur, Rajasthan', state: 'Rajasthan', college_type: 'Government' },
  { name: 'Motilal Nehru National Institute of Technology Allahabad', location: 'Prayagraj, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'National Institute of Technology Kurukshetra', location: 'Kurukshetra, Haryana', state: 'Haryana', college_type: 'Government' },
  { name: 'National Institute of Technology Silchar', location: 'Silchar, Assam', state: 'Assam', college_type: 'Government' },
  { name: 'National Institute of Technology Durgapur', location: 'Durgapur, West Bengal', state: 'West Bengal', college_type: 'Government' },
  { name: 'National Institute of Technology Jamshedpur', location: 'Jamshedpur, Jharkhand', state: 'Jharkhand', college_type: 'Government' },
  { name: 'National Institute of Technology Jalandhar', location: 'Jalandhar, Punjab', state: 'Punjab', college_type: 'Government' },
  { name: 'Sardar Vallabhbhai National Institute of Technology Surat', location: 'Surat, Gujarat', state: 'Gujarat', college_type: 'Government' },
  { name: 'National Institute of Technology Raipur', location: 'Raipur, Chhattisgarh', state: 'Chhattisgarh', college_type: 'Government' },
  { name: 'National Institute of Technology Patna', location: 'Patna, Bihar', state: 'Bihar', college_type: 'Government' },
  
  // IIITs
  { name: 'International Institute of Information Technology Hyderabad', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Private' },
  { name: 'Indraprastha Institute of Information Technology Delhi', location: 'New Delhi, Delhi', state: 'Delhi', college_type: 'Government' },
  { name: 'International Institute of Information Technology Bangalore', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Indian Institute of Information Technology Allahabad', location: 'Prayagraj, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'Indian Institute of Information Technology Design and Manufacturing Kancheepuram', location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Government' },
  { name: 'Indian Institute of Information Technology Design and Manufacturing Jabalpur', location: 'Jabalpur, Madhya Pradesh', state: 'Madh Pradesh', college_type: 'Government' },
  { name: 'Indian Institute of Information Technology Guwahati', location: 'Guwahati, Assam', state: 'Assam', college_type: 'Government' },
  { name: 'Indian Institute of Information Technology Pune', location: 'Pune, Maharashtra', state: 'Maharashtra', college_type: 'Government' },
  { name: 'Indian Institute of Information Technology Lucknow', location: 'Lucknow, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'Indian Institute of Information Technology Sri City', location: 'Chittoor, Andhra Pradesh', state: 'Andhra Pradesh', college_type: 'Government' },

  // IITs (Other than main 5 usually already there)
  { name: 'Indian Institute of Technology Roorkee', location: 'Roorkee, Uttarakhand', state: 'Uttarakhand', college_type: 'Government' },
  { name: 'Indian Institute of Technology Guwahati', location: 'Guwahati, Assam', state: 'Assam', college_type: 'Government' },
  { name: 'Indian Institute of Technology Hyderabad', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Government' },
  { name: 'Indian Institute of Technology Indore', location: 'Indore, Madhya Pradesh', state: 'Madhya Pradesh', college_type: 'Government' },
  { name: 'Indian Institute of Technology Varanasi', location: 'Varanasi, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'Indian Institute of Technology Dhanbad', location: 'Dhanbad, Jharkhand', state: 'Jharkhand', college_type: 'Government' },
  { name: 'Indian Institute of Technology Bhubaneswar', location: 'Bhubaneswar, Odisha', state: 'Odisha', college_type: 'Government' },
  { name: 'Indian Institute of Technology Gandhinagar', location: 'Gandhinagar, Gujarat', state: 'Gujarat', college_type: 'Government' },
  { name: 'Indian Institute of Technology Ropar', location: 'Rupnagar, Punjab', state: 'Punjab', college_type: 'Government' },
  { name: 'Indian Institute of Technology Patna', location: 'Patna, Bihar', state: 'Bihar', college_type: 'Government' },
  { name: 'Indian Institute of Technology Mandi', location: 'Mandi, Himachal Pradesh', state: 'Himachal Pradesh', college_type: 'Government' },
  { name: 'Indian Institute of Technology Jodhpur', location: 'Jodhpur, Rajasthan', state: 'Rajasthan', college_type: 'Government' },

  // Top Private & State
  { name: 'Jadavpur University', location: 'Kolkata, West Bengal', state: 'West Bengal', college_type: 'Government' },
  { name: 'College of Engineering Pune', location: 'Pune, Maharashtra', state: 'Maharashtra', college_type: 'Government' },
  { name: 'RV College of Engineering', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'BMS College of Engineering', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'MS Ramaiah Institute of Technology', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Thapar Institute of Engineering and Technology', location: 'Patiala, Punjab', state: 'Punjab', college_type: 'Private' },
  { name: 'Manipal Institute of Technology', location: 'Manipal, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'SRM Institute of Science and Technology', location: 'Kattankulathur, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'PSG College of Technology', location: 'Coimbatore, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'VJTI Mumbai', location: 'Mumbai, Maharashtra', state: 'Maharashtra', college_type: 'Government' },
  { name: 'Sardar Patel Institute of Technology', location: 'Mumbai, Maharashtra', state: 'Maharashtra', college_type: 'Private' },
  { name: 'Netaji Subhas University of Technology', location: 'New Delhi, Delhi', state: 'Delhi', college_type: 'Government' },
  { name: 'Indraprastha Institute of Information Technology', location: 'Delhi, Delhi', state: 'Delhi', college_type: 'Government' },
  { name: 'Punjab Engineering College', location: 'Chandigarh, Chandigarh', state: 'Chandigarh', college_type: 'Government' },
  { name: 'Institute of Chemical Technology', location: 'Mumbai, Maharashtra', state: 'Maharashtra', college_type: 'Government' },
  { name: 'Dhirubhai Ambani Institute of Information and Communication Technology', location: 'Gandhinagar, Gujarat', state: 'Gujarat', college_type: 'Private' },
  { name: 'Nirma University', location: 'Ahmedabad, Gujarat', state: 'Gujarat', college_type: 'Private' },
  { name: 'SASTRA Deemed University', location: 'Thanjavur, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'SSN College of Engineering', location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'Chaitanya Bharathi Institute of Technology', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Private' },
  { name: 'VNR Vignana Jyothi Institute of Engineering and Technology', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Private' },
  { name: 'Pune Institute of Computer Technology', location: 'Pune, Maharashtra', state: 'Maharashtra', college_type: 'Private' },
  { name: 'Cummins College of Engineering for Women', location: 'Pune, Maharashtra', state: 'Maharashtra', college_type: 'Private' },
  { name: 'Walchand College of Engineering', location: 'Sangli, Maharashtra', state: 'Maharashtra', college_type: 'Government' },
  { name: 'KJ Somaiya College of Engineering', location: 'Mumbai, Maharashtra', state: 'Maharashtra', college_type: 'Private' },
  { name: 'Jaypee Institute of Information Technology', location: 'Noida, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Private' },
  { name: 'Shiv Nadar University', location: 'Greater Noida, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Private' },
  { name: 'Chandigarh University', location: 'Chandigarh, Punjab', state: 'Punjab', college_type: 'Private' },
  { name: 'Lovely Professional University', location: 'Phagwara, Punjab', state: 'Punjab', college_type: 'Private' },
  { name: 'Galgotias University', location: 'Greater Noida, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Private' },
  { name: 'Banasthali Vidyapith', location: 'Jaipur, Rajasthan', state: 'Rajasthan', college_type: 'Private' },
  { name: 'Mody University', location: 'Sikar, Rajasthan', state: 'Rajasthan', college_type: 'Private' },
  { name: 'Harcourt Butler Technical University', location: 'Kanpur, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'Madan Mohan Malaviya University of Technology', location: 'Gorakhpur, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'JSS Academy of Technical Education', location: 'Noida, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Private' },
  { name: 'BMS Institute of Technology and Management', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Dayananda Sagar College of Engineering', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'PES University', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Sir M Visvesvaraya Institute of Technology', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Bangalore Institute of Technology', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Nitte Meenakshi Institute of Technology', location: 'Bengaluru, Karnataka', state: 'Karnataka', college_type: 'Private' },
  { name: 'Hindustan Institute of Technology and Science', location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'Sathyabama Institute of Science and Technology', location: 'Chennai, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'Karunya Institute of Technology and Sciences', location: 'Coimbatore, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'Amrita Vishwa Vidyapeetham', location: 'Coimbatore, Tamil Nadu', state: 'Tamil Nadu', college_type: 'Private' },
  { name: 'Gokaraju Rangaraju Institute of Engineering and Technology', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Private' },
  { name: 'Vasavi College of Engineering', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Private' },
  { name: 'Sreenidhi Institute of Science and Technology', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Private' },
  { name: 'Osmania University', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Government' },
  { name: 'JNTU Hyderabad', location: 'Hyderabad, Telangana', state: 'Telangana', college_type: 'Government' },
  { name: 'JNTU Kakinada', location: 'Kakinada, Andhra Pradesh', state: 'Andhra Pradesh', college_type: 'Government' },
  { name: 'JNTU Anantapur', location: 'Anantapur, Andhra Pradesh', state: 'Andhra Pradesh', college_type: 'Government' },
  { name: 'Andhra University College of Engineering', location: 'Visakhapatnam, Andhra Pradesh', state: 'Andhra Pradesh', college_type: 'Government' },
  { name: 'GITAM University', location: 'Visakhapatnam, Andhra Pradesh', state: 'Andhra Pradesh', college_type: 'Private' },
  { name: 'KL University', location: 'Vijayawada, Andhra Pradesh', state: 'Andhra Pradesh', college_type: 'Private' },
  { name: 'Maharaja Sayajirao University of Baroda', location: 'Vadodara, Gujarat', state: 'Gujarat', college_type: 'Government' },
  { name: 'LD College of Engineering', location: 'Ahmedabad, Gujarat', state: 'Gujarat', college_type: 'Government' },
  { name: 'Vishwakarma Government Engineering College', location: 'Ahmedabad, Gujarat', state: 'Gujarat', college_type: 'Government' },
  { name: 'Institute of Infrastructure Technology Research and Management', location: 'Ahmedabad, Gujarat', state: 'Gujarat', college_type: 'Government' },
  { name: 'Government Engineering College Thrissur', location: 'Thrissur, Kerala', state: 'Kerala', college_type: 'Government' },
  { name: 'College of Engineering Trivandrum', location: 'Thiruvananthapuram, Kerala', state: 'Kerala', college_type: 'Government' },
  { name: 'TKM College of Engineering', location: 'Kollam, Kerala', state: 'Kerala', college_type: 'Government' },
  { name: 'NSS College of Engineering', location: 'Palakkad, Kerala', state: 'Kerala', college_type: 'Government' },
  { name: 'Rajagiri School of Engineering and Technology', location: 'Kochi, Kerala', state: 'Kerala', college_type: 'Private' },
  { name: 'Muthoot Institute of Technology and Science', location: 'Kochi, Kerala', state: 'Kerala', college_type: 'Private' },
  { name: 'Heritage Institute of Technology', location: 'Kolkata, West Bengal', state: 'West Bengal', college_type: 'Private' },
  { name: 'Haldia Institute of Technology', location: 'Haldia, West Bengal', state: 'West Bengal', college_type: 'Private' },
  { name: 'Techno Main Salt Lake', location: 'Kolkata, West Bengal', state: 'West Bengal', college_type: 'Private' },
  { name: 'Institute of Engineering and Management', location: 'Kolkata, West Bengal', state: 'West Bengal', college_type: 'Private' },
  { name: 'Dr B C Roy Engineering College', location: 'Durgapur, West Bengal', state: 'West Bengal', college_type: 'Private' },
  { name: 'Asansol Engineering College', location: 'Asansol, West Bengal', state: 'West Bengal', college_type: 'Private' },
  { name: 'Kalyani Government Engineering College', location: 'Kalyani, West Bengal', state: 'West Bengal', college_type: 'Government' },
  { name: 'Jalpaiguri Government Engineering College', location: 'Jalpaiguri, West Bengal', state: 'West Bengal', college_type: 'Government' },
  { name: 'BIT Mesra', location: 'Ranchi, Jharkhand', state: 'Jharkhand', college_type: 'Private' },
  { name: 'NIT Arunachal Pradesh', location: 'Yupia, Arunachal Pradesh', state: 'Arunachal Pradesh', college_type: 'Government' },
  { name: 'NIT Meghalaya', location: 'Shillong, Meghalaya', state: 'Meghalaya', college_type: 'Government' },
  { name: 'NIT Nagaland', location: 'Dimapur, Nagaland', state: 'Nagaland', college_type: 'Government' },
  { name: 'NIT Manipur', location: 'Imphal, Manipur', state: 'Manipur', college_type: 'Government' },
  { name: 'NIT Mizoram', location: 'Aizawl, Mizoram', state: 'Mizoram', college_type: 'Government' },
  { name: 'NIT Sikkim', location: 'Ravangla, Sikkim', state: 'Sikkim', college_type: 'Government' },
  { name: 'NIT Srinagar', location: 'Srinagar, Jammu and Kashmir', state: 'Jammu and Kashmir', college_type: 'Government' },
  { name: 'NIT Uttarakhand', location: 'Srinagar, Uttarakhand', state: 'Uttarakhand', college_type: 'Government' },
  { name: 'NIT Goa', location: 'Ponda, Goa', state: 'Goa', college_type: 'Government' },
  { name: 'NIT Puducherry', location: 'Karaikal, Puducherry', state: 'Puducherry', college_type: 'Government' },
  { name: 'Goa Engineering College', location: 'Ponda, Goa', state: 'Goa', college_type: 'Government' },
  { name: 'Don Bosco College of Engineering', location: 'Margao, Goa', state: 'Goa', college_type: 'Private' },
  { name: 'Padre Conceicao College of Engineering', location: 'Verna, Goa', state: 'Goa', college_type: 'Private' },
  { name: 'Jamia Millia Islamia', location: 'New Delhi, Delhi', state: 'Delhi', college_type: 'Government' },
  { name: 'Aligarh Muslim University', location: 'Aligarh, Uttar Pradesh', state: 'Uttar Pradesh', college_type: 'Government' },
  { name: 'Tezpur University', location: 'Tezpur, Assam', state: 'Assam', college_type: 'Government' },
  { name: 'North Eastern Hill University', location: 'Shillong, Meghalaya', state: 'Meghalaya', college_type: 'Government' },
  { name: 'Pondicherry Engineering College', location: 'Puducherry, Puducherry', state: 'Puducherry', college_type: 'Government' }
];

async function seedBtechColleges() {
  let count = 0;
  for (const college of btechColleges) {
    // Generate some basic random data for rating
    const rating = (3.5 + Math.random() * 1.0).toFixed(1); // 3.5 to 4.5
    
    await College.findOrCreate({
      where: { name: college.name },
      defaults: {
        ...college,
        rating: parseFloat(rating)
      }
    });
    count++;
  }
  console.log(`Finished processing ${count} B.Tech colleges.`);
}

async function run() {
  try {
    await seedBtechColleges();
    console.log("Seeding completed.");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
