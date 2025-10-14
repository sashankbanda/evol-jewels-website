import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---

// Load environment variables from .env file
dotenv.config({ path: 'server/.env' });

// Load pre-processed features for KNN search
let productFeatures = [];
const FEATURES_FILE = path.join(process.cwd(), 'server', 'product_features.json');
try {
    const data = fs.readFileSync(FEATURES_FILE, 'utf8');
    productFeatures = JSON.parse(data);
    console.log(`Loaded ${productFeatures.length} product feature vectors for KNN search.`);
} catch (error) {
    console.error("FATAL: Could not load product_features.json. Run 'npm run extract-features' first.");
}

const app = express();
const PORT = 3001;

// --- 1. MIDDLEWARE & SETUP ---
app.use(cors());
// FIX: Increase body parser limit to 50MB to handle large Base64 image payloads
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Initialize Google Services
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

// --- KNN CALCULATION UTILITIES ---

// 1. Cosine Similarity Calculation (Higher score = More similar)
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    // Ensure vectors are of the same length
    if (vecA.length !== vecB.length) return 0; 
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;

    return dotProduct / (magnitudeA * magnitudeB);
};

// 2. Local KNN Search Implementation
const findSimilarProducts = (queryVector, k = 3) => {
    if (productFeatures.length === 0) return [];

    const similarities = productFeatures.map(item => ({
        id: item.id,
        // The similarity score is the cosine similarity between the query and the stored feature vector
        score: cosineSimilarity(queryVector, item.featureVector)
    }));

    // Sort in descending order by score (most similar first)
    similarities.sort((a, b) => b.score - a.score);

    // Return only the top K IDs
    return similarities.slice(0, k).map(item => item.id);
};

// --- 2. API ENDPOINT LOGIC ---

// --- 2a. VIBE ANALYSIS ENDPOINT (Uses Gemini + Google Search) ---
app.post('/api/analyze-outfit', async (req, res) => {
    const { outfitText, quizKey } = req.body; 

    if (!quizKey) {
        return res.status(400).json({ error: "Missing quizKey in request body." });
    }

    const hasOutfitText = outfitText && outfitText.trim() !== '';

    const outfitPromptPart = hasOutfitText ?
        `The user is wearing the following outfit for extra context: "${outfitText}". Analyze this to recommend the BEST jewelry metal.` :
        `The user skipped the outfit input. Base the metal match on the quiz answer for metal preference (the last word in the Vibe Match Style).`;

    const prompt = `
        You are a highly skilled jewelry stylist.
        The user completed a quiz with this final Vibe Match Style: "${quizKey}".
        ${outfitPromptPart}

        [... (REST OF PROMPT LOGIC FOR GEMINI TEXT ANALYSIS) ...]

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
        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", maxOutputTokens: 2048 }
        });

        aiData = JSON.parse(geminiResponse.text.trim());

        // Call Google Custom Search for images (omitted full search logic for brevity, but it is here)
        // ... (Image search calls for outfit, celebrity, movie) ... 
        
        // --- Image Search Call Stubs for Real Production Code ---
        const searchImage = async (query) => {
            if (!query) return '';
            try {
                const searchResult = await customsearch.cse.list({
                    auth: GOOGLE_SEARCH_API_KEY,
                    cx: CUSTOM_SEARCH_ENGINE_ID,
                    q: query,
                    searchType: 'image',
                    num: 1,
                });
                return (searchResult.data.items && searchResult.data.items.length > 0) ? searchResult.data.items[0].link : '';
            } catch (err) {
                console.error("Custom Search Error:", err.message);
                return '';
            }
        };

        if (hasOutfitText && aiData.outfit_search_query) {
            outfitImageUrl = await searchImage(aiData.outfit_search_query);
        }
        if (aiData.celebrity_search_query) {
            celebImageUrl = await searchImage(aiData.celebrity_search_query);
        }
        if (aiData.movie_search_query) {
            movieImageUrl = await searchImage(aiData.movie_search_query);
        }
        // --- End Image Search Call Stubs ---

        res.json({
            keywords: { metal_match: aiData.metal_match, description: aiData.description },
            vibeMatch: { 
                icon: aiData.celebrity_match, 
                subtitle: aiData.description,
                celebrityImage: celebImageUrl || 'https://placehold.co/400x200/8B2E2E/F5F5F5?text=Image+Error',
                movieScene: aiData.movie_match,
                movieImage: movieImageUrl || 'https://placehold.co/400x200/0E5C4E/F5F5F5?text=Image+Error'
            },
            outfitImageUrl: outfitImageUrl 
        });

    } catch (error) {
        console.error("Full Pipeline Error:", error.message);
        // Fallback for API failures
        const fallbackKeywords = aiData ? { metal_match: aiData.metal_match || quizKey.split('_')[2] || 'Polished Gold', description: aiData.description || 'Analysis complete but imagery failed.' } : { metal_match: quizKey.split('_')[2] || 'Polished Gold', description: 'Could not connect to the styling service. Showing default match.' };
        const defaultVibe = getVibeMatchDetailsFromMock(quizKey); 

        res.status(500).json({ error: "Failed to fetch one or more dynamic images.", keywords: fallbackKeywords, vibeMatch: { icon: defaultVibe.icon, subtitle: defaultVibe.subtitle, celebrityImage: 'https://placehold.co/400x200/8B2E2E/F5F5F5?text=Image+Error', movieScene: 'Default Movie Vibe', movieImage: 'https://placehold.co/400x200/0E5C4E/F5F5F5?text=Image+Error' }, outfitImageUrl: hasOutfitText ? 'https://placehold.co/400x200/B1B1B1/111111?text=Service+Error+-+No+Outfit+Image' : '' });
    }
});

// --- 2b. CHATBOT ENDPOINT (Uses Gemini) ---
app.post('/api/product-chat', async (req, res) => {
    const { productDataJson, userQuery } = req.body;

    if (!productDataJson || !userQuery) {
        return res.status(400).json({ error: "Missing data in request body." });
    }

    const systemPrompt = `
        You are the Evol Jewels Product Assistant. Your goal is to answer questions about the jewelry line.
        
        CRITICAL RULE: Always use **Indian Rupee (₹) symbol** for currency. Never use the dollar sign ($) or any other currency symbol.

        PRODUCT KNOWLEDGE: Use ONLY the following JSON data to form your answers.
        If a user asks about a product, you MUST include the **name** and **price** in your response, formatted clearly using Markdown. If you cannot find an answer or a specific product in the data, apologize and suggest they browse the full collection.

        JSON Data: ${productDataJson}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userQuery,
            config: {
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                }
            }
        });

        res.json({ answer: response.text });
        
    } catch (error) {
        console.error("Gemini Chat API Error:", error);
        res.status(500).json({ answer: "My apologies, I am having trouble connecting to my product database right now. Please try again in a moment." });
    }
});

// --- 2c. IMAGE SEARCH ENDPOINT (Uses Local KNN with MobileNet features) ---
app.post('/api/image-search', async (req, res) => {
    // The client sends the feature vector calculated from the uploaded image
    const { queryFeatureVector } = req.body; 

    if (!queryFeatureVector || !Array.isArray(queryFeatureVector) || queryFeatureVector.length === 0) {
        return res.status(400).json({ error: "Missing or invalid query feature vector." });
    }
    
    if (productFeatures.length === 0) {
        return res.status(503).json({ error: "Product features not loaded. Server configuration error." });
    }

    try {
        // Find the top 3 similar product IDs using local KNN logic
        const topMatches = findSimilarProducts(queryFeatureVector, 3);
        
        // Return the array of IDs
        res.json({ productIds: topMatches });

    } catch (error) {
        console.error("Local KNN Search Error:", error);
        // Fallback: return a default set of IDs in case of logic error
        res.status(500).json({ error: "Local image search failed.", productIds: [1, 2, 3] });
    }
});


// --- 3. START SERVER ---
app.listen(PORT, () => {
    console.log(`Backend Server running on http://localhost:${PORT}`);
    console.log(`Don't forget to run 'npm run dev' in another terminal for the frontend!`);
});