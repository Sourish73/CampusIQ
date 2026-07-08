require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    await model.generateContent("Say hi");
    console.log("2.5 worked!");
  } catch (err) {
    console.log("2.5 failed:", err.message);
    if (err.message.includes("429")) {
      console.log("Falling back to gemini-1.5-flash...");
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      try {
        const res = await fallbackModel.generateContent("Say hi");
        console.log("1.5 worked!", res.response.text());
      } catch (err2) {
        console.log("1.5 failed too:", err2.message);
      }
    }
  }
}
test();
