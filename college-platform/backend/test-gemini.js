require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
  console.log("Testing Gemini API Key...");
  const key = process.env.GEMINI_API_KEY;
  if (!key) return;
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    const textModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
    console.log("Available Text Models:");
    console.log(textModels);
  } catch (err) {
    console.error(err);
  }
}

test();
