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
export const getAllFilteredRecommendations = (answers) => {
    const primaryCategory = answers.q2; // e.g., 'Ring'
    const occasion = answers.q1;
    const outfitStyle = answers.q3;
    const metal = answers.q4;

    // --- NEW STEP: Apply mandatory Category Filter ---
    let filteredProducts = productData.filter(product => {
        // Normalize 'Pendant' to 'Necklace' for the filter
        const productCategory = product.category === 'Pendant' ? 'Necklace' : product.category;
        
        // ONLY keep products that match the user's chosen category (q2)
        return productCategory === primaryCategory;
    });
    
    // --- OLD SCORING LOGIC (Now applied only to the filtered list) ---
    let scoredRecommendations = filteredProducts.map(product => { // <-- Change: Use filteredProducts
        let score = 0;
        const productCategory = product.category === 'Pendant' ? 'Necklace' : product.category;
        const productCollection = product.collection || '';
        
        // Match Scoring Logic (copied from prototype)
        // NOTE: The category match is already guaranteed here, but keeping scoring logic for context:
        if (productCategory === primaryCategory) { score += 3; } 
        if (product.tags.includes(metal)) { score += 2; }
        if (product.tags.includes(occasion)) { score += 1.5; }
        if (productCollection.includes(outfitStyle) || product.tags.includes(outfitStyle)) { score += 1; }
        
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
