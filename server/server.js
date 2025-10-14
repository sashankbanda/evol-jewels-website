// server.js - THE ACTUAL SECURE NODE/EXPRESS BACKEND (Converted to ES Modules)

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai'; // Gemini SDK
import { google } from 'googleapis'; // Google APIs client for Custom Search

// Load environment variables from .env file
dotenv.config({ path: 'server/.env' });

const app = express();
const PORT = 3001; // Use port 3001 for the backend

// --- 1. MIDDLEWARE & SETUP ---
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini AI (Key is loaded from process.env)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GOOGLE_SEARCH_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
const CUSTOM_SEARCH_ENGINE_ID = process.env.CUSTOM_SEARCH_ENGINE_ID;

// Safety check for keys
if (!GEMINI_API_KEY || !GOOGLE_SEARCH_API_KEY || !CUSTOM_SEARCH_ENGINE_ID) {
    console.error("FATAL: One or more API keys are missing or invalid. Check your server/.env file.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const customsearch = google.customsearch('v1');

// Helper function to quickly get the match key for backend fallback if AI search fails
const getVibeMatchDetailsFromMock = (quizKey) => {
    // This replicates the logic from productUtils's fallback, used here if the whole AI call fails
    const mockMatches = {
        'Party/Celebration_Classic_Polished Gold': { icon: 'Zendaya: Effortlessly Chic', subtitle: 'Polished gold and bold silhouettes made for a standout evening look.' },
        'Work_Modern_Matte Silver': { icon: 'Amal Clooney: Power Minimalist', subtitle: 'Sleek, geometric pieces that mean business — in cool matte silver.' },
        'Casual_Relaxed_Mixed Metals': { icon: 'Gigi Hadid: Relaxed Luxury', subtitle: 'Layered mixed metals that keep it casual yet elevated.' },
        'Work_Classic_Polished Gold': { icon: 'Priyanka Chopra: Classic Edge', subtitle: 'Polished gold with structured lines — timeless and sharp.' },
        'Party/Celebration_Modern_Mixed Metals': { icon: 'Rihanna: Bold & Fearless', subtitle: 'Contrasting metals and standout shapes for fearless energy.' },
        'Casual_Classic_Polished Gold': { icon: 'Audrey Hepburn: Timeless Grace', subtitle: 'Elegant, refined, and forever in style.' },
        'default': { icon: 'Default Vibe: Classic Look', subtitle: 'The core pieces matched to your quiz answers.' }
    };
    return mockMatches[quizKey] || mockMatches['default'];
}


// --- 2. API ENDPOINT LOGIC ---
// Your React frontend will call this endpoint: http://localhost:3001/api/analyze-outfit
app.post('/api/analyze-outfit', async (req, res) => {
    // Receive the outfit text (can be empty) and the combined quiz result key
    const { outfitText, quizKey } = req.body; 

    if (!quizKey) {
        return res.status(400).json({ error: "Missing quizKey in request body." });
    }

    // Determine if the user provided an outfit description
    const hasOutfitText = outfitText && outfitText.trim() !== '';

    const outfitPromptPart = hasOutfitText ?
        `The user is wearing the following outfit for extra context: "${outfitText}". Analyze this to recommend the BEST jewelry metal.` :
        `The user skipped the outfit input. Base the metal match on the quiz answer for metal preference (the last word in the Vibe Match Style).`;

    // The AI will now generate ALL the necessary dynamic data in one go
    const prompt = `
        You are a highly skilled jewelry stylist.
        The user completed a quiz with this final Vibe Match Style: "${quizKey}".
        ${outfitPromptPart}

        Based on the combined Vibe Match Style and the presence of the outfit text, perform these tasks:

        TASK 1: JEWELRY RECOMMENDATION (Primary Result)
        Suggest the BEST jewelry metal match: (Polished Gold, Matte Silver, or Mixed Metals).
        Provide a short 1-sentence description for why this metal/style combo works.
        ${hasOutfitText ? "Provide a precise search query for a photo illustrating the recommended jewelry aesthetic for the user's outfit." : ""}

        TASK 2: CELEBRITY INSPIRATION (Must be a real, known celebrity)
        Find a real, well-known celebrity who embodies the core style of the Vibe Match.
        Provide a concise name/style description (e.g., "Audrey Hepburn: Timeless Grace").
        Provide a very precise search term to find a high-quality, relevant image of that celebrity in that style.

        TASK 3: MOVIE INSPIRATION (Must be a real movie)
        Find a real, well-known movie scene or movie poster that captures the aesthetic of the Vibe Match.
        Provide a concise name/scene description (e.g., "Breakfast at Tiffany's: Opening Scene").
        Provide a very precise search term to find a high-quality, relevant image of that movie scene/poster.

        Return only a single JSON object. Do not include any explanation or markdown tags.

        JSON Schema to follow strictly:
        {
          "metal_match": "Polished Gold" | "Matte Silver" | "Mixed Metals",
          "description": "The description for the metal/style match.",
          ${hasOutfitText ? `"outfit_search_query": "A precise query for the outfit aesthetic image.",` : ''}
          "celebrity_match": "The celebrity name and style title.",
          "celebrity_search_query": "A precise query for the celebrity image.",
          "movie_match": "The movie scene name and collection hint.",
          "movie_search_query": "A precise query for the movie scene image."
        }
    `;

    let aiData;
    let outfitImageUrl = '';
    let celebImageUrl = '';
    let movieImageUrl = '';

    try {
        // 1. CALL GEMINI (Text Analysis for all components)
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                maxOutputTokens: 2048 
            }
        });

        // Parse the JSON data returned from the AI
        aiData = JSON.parse(geminiResponse.text.trim());

        // --- 2. CALL GOOGLE CUSTOM SEARCH API (Image Retrieval for all 3 images) ---

        // A. Outfit Reference Image (Only if user provided text and AI gave a query)
        if (hasOutfitText && aiData.outfit_search_query) { 
            const searchResult = await customsearch.cse.list({
                auth: GOOGLE_SEARCH_API_KEY,
                cx: CUSTOM_SEARCH_ENGINE_ID,
                q: aiData.outfit_search_query,
                searchType: 'image',
                num: 1,
            });
            if (searchResult.data.items && searchResult.data.items.length > 0) {
                outfitImageUrl = searchResult.data.items[0].link;
            }
        }

        // B. Celebrity Image (ALWAYS generated)
        if (aiData.celebrity_search_query) {
            const celebResult = await customsearch.cse.list({
                auth: GOOGLE_SEARCH_API_KEY,
                cx: CUSTOM_SEARCH_ENGINE_ID,
                q: aiData.celebrity_search_query,
                searchType: 'image',
                num: 1,
            });
            if (celebResult.data.items && celebResult.data.items.length > 0) {
                celebImageUrl = celebResult.data.items[0].link;
            }
        }

        // C. Movie Image (ALWAYS generated)
        if (aiData.movie_search_query) {
            const movieResult = await customsearch.cse.list({
                auth: GOOGLE_SEARCH_API_KEY,
                cx: CUSTOM_SEARCH_ENGINE_ID,
                q: aiData.movie_search_query,
                searchType: 'image',
                num: 1,
            });
            if (movieResult.data.items && movieResult.data.items.length > 0) {
                movieImageUrl = movieResult.data.items[0].link;
            }
        }

        // 3. Send final structured response back to the React frontend
        res.json({
            // keywords is always sent for filtering recommendations
            keywords: { 
                metal_match: aiData.metal_match,
                description: aiData.description
            },
            // vibeMatch is always sent (Celebrity & Movie details are always generated by AI)
            vibeMatch: { 
                icon: aiData.celebrity_match, 
                subtitle: aiData.description,
                celebrityImage: celebImageUrl || 'https://placehold.co/400x200/8B2E2E/F5F5F5?text=Image+Error',
                movieScene: aiData.movie_match,
                movieImage: movieImageUrl || 'https://placehold.co/400x200/0E5C4E/F5F5F5?text=Image+Error'
            },
            // outfitImageUrl is only returned if outfitText was provided and searched successfully
            outfitImageUrl: outfitImageUrl 
        });

    } catch (error) {
        console.error("Full Pipeline Error:", error.message);

        // Secure Fallback for API Failures
        const fallbackKeywords = aiData ? {
            metal_match: aiData.metal_match || 'Polished Gold',
            description: aiData.description || 'Analysis complete but imagery failed.',
        } : {
            // Default to quiz metal if AI failed entirely
            metal_match: quizKey.split('_')[2] || 'Polished Gold',
            description: 'Could not connect to the styling service. Showing default match.',
        };
        const defaultVibe = getVibeMatchDetailsFromMock(quizKey); 

        res.status(500).json({
            error: "Failed to fetch one or more dynamic images.",
            keywords: fallbackKeywords,
            vibeMatch: {
                icon: defaultVibe.icon,
                subtitle: defaultVibe.subtitle,
                celebrityImage: 'https://placehold.co/400x200/8B2E2E/F5F5F5?text=Image+Error',
                movieScene: 'Default Movie Vibe',
                movieImage: 'https://placehold.co/400x200/0E5C4E/F5F5F5?text=Image+Error'
            },
            outfitImageUrl: hasOutfitText ? 'https://placehold.co/400x200/B1B1B1/111111?text=Service+Error+-+No+Outfit+Image' : ''
        });
    }
});

// --- 3. START SERVER ---
app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
    console.log(`Don't forget to run 'npm run dev' in another terminal for the frontend!`);
});
