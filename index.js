import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// import bodyParser from "body-parser";
import { analyzeMessage } from "./gemini.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
// app.use(bodyParser.json());

app.post("/analyze", async (req, res) => {
    const { message, source, context } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message field is required." });
    }

    try {
        const result = await analyzeMessage(message, source, context);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
