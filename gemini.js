import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

export const analyzeMessage = async (message, source, context) => {
    try {
        let prompt = `Analyze the following message for scam or fraud likelihood:\n\nMessage: "${message}"\n`;

        if (source) {
            prompt += `Source: ${source}\n`;
        }
        if (context) {
            prompt += `Knows Sender: ${context.knows_sender}\nContact Duration: ${context.contact_duration}\n`;
        }

        prompt += `
        \nRespond ONLY in raw JSON format, without any markdown, explanation, or extra text:
        {
            "scam_likelihood": 0-100,
            "reasons": ["Brief explanation 1", "Brief explanation 2", "Brief explanation 3"]
        }`;

        const response = await axios.post(
            `${GEMINI_API_URL}?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );

        let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Remove accidental Markdown formatting (if any)
        rawText = rawText.replace(/```json|```/g, "").trim();

        const jsonResponse = JSON.parse(rawText);
        return jsonResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error.response?.data || error.message);
        return { scam_likelihood: null, reasons: ["Error processing the request."] };
    }
};
