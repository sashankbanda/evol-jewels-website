// src/logic/productUtils.js

import { productData, vibeMatches } from '../data/productData';

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

// Utility 4: Get Vibe Match Details
export const getVibeMatchDetails = (answers) => {
    const key = `${answers.q1}_${answers.q3}_${answers.q4}`;
    return vibeMatches[key] || vibeMatches['default'];
};