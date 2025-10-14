// src/logic/productUtils.js

import { productData } from '../data/productData'; // Removed vibeMatches

// Utility 1: Price Formatting
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
};

// Utility 2: Find Product
export const getProductById = (id) => {
    return productData.find(p => p.id === id);
};

// Utility 3: Vibe Matching Logic (Scoring)
// ADD outfitKeywords as a parameter
export const getAllFilteredRecommendations = (answers, outfitKeywords = null) => {
    const primaryCategory = answers.q2;
    const occasion = answers.q1;
    const outfitStyle = answers.q3;
    const metal = answers.q4;
    
    // --- NEW: Extract AI Metal Match ---
    let aiMetalMatch = null;
    if (outfitKeywords && outfitKeywords.metal_match) {
        // Use the metal suggested by the AI based on the user's text
        aiMetalMatch = outfitKeywords.metal_match;
    }
    // ------------------------------------

    // --- STEP 1: Apply mandatory Category Filter ---
    let filteredProducts = productData.filter(product => {
        const productCategory = product.category === 'Pendant' ? 'Necklace' : product.category;
        return productCategory === primaryCategory;
    });
    
    // --- STEP 2: Score products based on Quiz and AI context ---
    let scoredRecommendations = filteredProducts.map(product => {
        let score = 0;
        const productCategory = product.category === 'Pendant' ? 'Necklace' : product.category;
        const productCollection = product.collection || '';
        
        // Base Quiz Scores
        if (productCategory === primaryCategory) { score += 3; }
        if (product.tags.includes(metal)) { score += 2; }
        if (product.tags.includes(occasion)) { score += 1.5; }
        if (productCollection.includes(outfitStyle) || product.tags.includes(outfitStyle)) { score += 1; }
        
        // --- NEW: CONTEXTUAL AI BONUS (Applies if user provided text) ---
        // Boost product score significantly if it matches the metal suggested by the AI
        if (aiMetalMatch && product.tags.includes(aiMetalMatch)) {
            score += 3.5;
        }
        // -----------------------------------
        
        // Price proximity scoring
        const PRICE_TARGET = 100000;
        const price_diff = Math.abs(product.price - PRICE_TARGET);
        const price_bonus = 0.5 * (1 - Math.min(price_diff / 500000, 1));
        score += price_bonus;

        return { ...product, score };
    });

    scoredRecommendations.sort((a, b) => b.score - a.score);
    return scoredRecommendations;
};

// Utility 4: Get Vibe Match Details (Client-Side Fallback Only)
// This is used if the user skips the outfit text input or the backend call fails.
export const getVibeMatchDetails = (answers) => {
    // Hardcoded Vibe Matches (Client-side fallback data with placeholder images)
    const vibeMatchesFallback = {
        // NOTE: The 'celebrityImage' and 'movieImage' links below are simple placeholders 
        // that match the style of the old application structure, used only if AI generation is skipped/fails.
        'Party/Celebration_Classic_Polished Gold': { 
            icon: 'Zendaya: Effortlessly Chic', 
            subtitle: 'Polished gold and bold silhouettes made for a standout evening look.', 
            celebrityImage: 'https://placehold.co/400x200/ff69b4/F5F5F5?text=Zendaya+Statement+Gold', 
            movieScene: 'Golden Age Gala', 
            movieImage: 'https://placehold.co/400x200/9400D3/F5F5F5?text=Gatsby+Ballroom' 
        },
        'Work_Modern_Matte Silver': { 
            icon: 'Amal Clooney: Power Minimalist', 
            subtitle: 'Sleek, geometric pieces that mean business — in cool matte silver.', 
            celebrityImage: 'https://placehold.co/400x200/3c8dbc/F5F5F5?text=Amal+Clooney+Geometric', 
            movieScene: 'The Devil Wears Prada Office', 
            movieImage: 'https://placehold.co/400x200/000080/F5F5F5?text=Corporate+Modern' 
        },
        'Casual_Relaxed_Mixed Metals': { 
            icon: 'Gigi Hadid: Relaxed Luxury', 
            subtitle: 'Layered mixed metals that keep it casual yet elevated.', 
            celebrityImage: 'https://placehold.co/400x200/ffa500/F5F5F5?text=Gigi+Hadid+Casual+Layers', 
            movieScene: 'Bohemian Festival Look', 
            movieImage: 'https://placehold.co/400x200/808000/F5F5F5?text=Woodstock+Vibe' 
        },
        'Work_Classic_Polished Gold': { 
            icon: 'Priyanka Chopra: Classic Edge', 
            subtitle: 'Polished gold with structured lines — timeless and sharp.', 
            celebrityImage: 'https://placehold.co/400x200/9932CC/F5F5F5?text=Priyanka+Gold+Elegance', 
            movieScene: 'Old Money Manhattan', 
            movieImage: 'https://placehold.co/400x200/A52A2A/F5F5F5?text=Succession+Vibe' 
        },
        'Party/Celebration_Modern_Mixed Metals': { 
            icon: 'Rihanna: Bold & Fearless', 
            subtitle: 'Contrasting metals and standout shapes for fearless energy.', 
            celebrityImage: 'https://placehold.co/400x200/CC0000/F5F5F5?text=Rihanna+Bold+Mix', 
            movieScene: 'Cyberpunk Nightclub', 
            movieImage: 'https://placehold.co/400x200/000000/F5F5F5?text=Matrix+Look' 
        },
        'default': { 
            icon: 'Audrey Hepburn: Timeless Grace', 
            subtitle: 'Elegant, refined, and forever in style.', 
            celebrityImage: 'https://placehold.co/400x200/4CAF50/F5F5F5?text=Audrey+Hepburn+Classic', 
            movieScene: "Breakfast at Tiffany's", 
            movieImage: 'https://placehold.co/400x200/0E5C4E/F5F5F5?text=Classic+Movie+Inspo' 
        }
    };
    
    // Construct the key from the answers passed
    const key = `${answers.q1}_${answers.q3}_${answers.q4}`;
    
    // Check if a direct match exists, otherwise return the default for a cohesive look
    return vibeMatchesFallback[key] || vibeMatchesFallback['default'];
};
