import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent";
const API_KEY = process.env.GEMINI_API_KEY;

export const analyzeMessage = async (message, source, context) => {
    try {
        let prompt = `You are an advanced AI trained to detect scam or fraudulent messages. 

        Analyze the following message and assess its likelihood of being a scam. Assign a scam likelihood score (0-100) and provide reasons.

        Message: "${message}"`;

        if (source) {
            prompt += `\nSource: ${source}`;
        }
        if (context) {
            prompt += `\nKnows Sender: ${context.knows_sender}\nContact Duration: ${context.contact_duration}`;
        }

        prompt += `\n\n### Important Instructions:  
        - Respond **ONLY** with a valid JSON object.  
        - No explanations, no extra text, no markdown, no formatting errors.  
        - "scam_likelihood" should be an integer between 0 and 100.  
        - "reasons" must contain exactly **3 reasons**, each a brief but clear phrase.  
        - "category" should classify the scam type (e.g., "Phishing", "Impersonation", "Investment Fraud").

        Respond strictly in this JSON format:
        {
            "scam_likelihood": 0-100,
            "reasons": ["Brief explanation 1", "Brief explanation 2", "Brief explanation 3"],
            "category": "Scam type (if applicable)"
        }`;

        // Making API request
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: prompt }] }]
            }
        );

        let rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

        // Ensure clean JSON (removing Markdown if present)
        rawText = rawText.replace(/```json|```/g, "").trim();

        const jsonResponse = JSON.parse(rawText);
        return jsonResponse;

    } catch (error) {
        console.error("Error calling Gemini API:", error.response?.data || error.message);
        return { scam_likelihood: null, reasons: ["Error processing the request."] };
    }
};
