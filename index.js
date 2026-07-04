import express from 'express';
import cors from 'cors';
import { HfInference } from '@huggingface/inference';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_TOKEN);

app.post('/api/get-craving', async (req, res) => {
    const { emotion_text } = req.body;

    const systemPrompt = `You are a food expert. Translate the user's feelings into a list of specific foods. 
    Respond ONLY with a valid JSON format like this: {"search_query": "pizza, burger"}`;

    try {
        console.log("Asking Gemma...");
        // Trying the lightweight 2B model which crashes less on the free tier
        const response = await hf.chatCompletion({
            model: 'google/gemma-2b-it', 
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `User feeling: "${emotion_text}"` }
            ],
            max_tokens: 50,
            temperature: 0.1
        });

        const rawOutput = response.choices[0].message.content.trim();
        const jsonMatch = rawOutput.match(/\{.*\}/s); 
        
        if (!jsonMatch) throw new Error("AI did not return JSON");
        
        const parsedData = JSON.parse(jsonMatch[0]);
        res.json({ success: true, api_payload: parsedData });

    } catch (error) {
        console.log("Hugging Face API failed, using Safety Net data...");
        
        // THE FAIL-SAFE: If the API fails, send this back so the UI still works!
        const fallbackData = {
            search_query: "spicy chicken roll, mutton biryani, chili chicken"
        };
        
        res.json({ success: true, api_payload: fallbackData, note: "using_fallback" });
    }
});

app.listen(3000, () => console.log('The Brain is running on port 3000!')); 