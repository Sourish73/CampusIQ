require('dotenv').config();
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function run() {
  try {
    const res = await groq.chat.completions.create({
      messages: [{
        role: 'user',
        content: 'Return ONLY valid JSON for this college summary:\n{\n  "summary": "4-5 sentence student-friendly summary",\n  "highlights": ["short point", "short point"]\n}\nCollege: VIT'
      }],
      model: 'llama3-70b-8192',
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });
    console.log(res.choices[0].message.content);
  } catch(e) {
    console.error('GROQ ERROR:', e);
  }
}
run();
