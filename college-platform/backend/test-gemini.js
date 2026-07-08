require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  console.log("Testing Gemini API Key...");
  const key = process.env.GEMINI_API_KEY;
  if (!key) return;
  
  try {
    const genAI = new (require("@google/generative-ai").GoogleGenerativeAI)(key);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const result = await model.generateContent("Hello, say 'API is working' if you can read this.");
    console.log("Success! Gemini 2.0 Flash responded:");
    console.log(result.response.text());
  } catch (error) {
    console.log("ERROR! Gemini 2.0 Flash failed:");
    console.error(error.message);
  }
}

test();
