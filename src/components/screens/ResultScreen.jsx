// src/components/screens/ResultScreen.jsx

import React, { useState, useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';
import { getAllFilteredRecommendations } from '../../logic/productUtils';
import ProductCard from '../shared/ProductCard';

const ResultScreen = () => {
    // PULL THE NEW STATE 'vibeMatchDetails' from the context hook
    const { isDarkTheme, quizAnswers, navigate, showMessageModal, startNewSession, outfitKeywords, outfitRefImageUrl, vibeMatchDetails } = useVibe();
    const [recommendations, setRecommendations] = useState([]);
    const [offset, setOffset] = useState(0);
    const batchSize = 4;

    // Use the dynamic match details from the context, which is set by the backend or client-side fallback
    const match = vibeMatchDetails; 

    // --- Recommendation Logic (Uses outfitKeywords for the ultimate match) ---
    const generateRecommendations = (answers, keywords) => {
        return getAllFilteredRecommendations(answers, keywords);
    };
    
    const loadNextBatch = (allProducts) => {
        // 1. Calculate the next batch slice based on the current offset in state
        const nextBatch = allProducts.slice(offset, offset + batchSize);
        
        // 2. Update the offset state by adding the length of the batch loaded
        setOffset(prev => prev + nextBatch.length);
        
        // 3. Return the batch so the caller can handle appending the results
        return nextBatch;
    };

    useEffect(() => {
        // Generate initial recommendations only once when screen loads (offset should be 0)
        // If match details are null, wait, as they contain the best data/metal match
        if (vibeMatchDetails === null) return; 

        const allProducts = generateRecommendations(quizAnswers, outfitKeywords); 
        
        // Fetch the initial batch
        const initialBatch = allProducts.slice(0, batchSize);
        
        // Set initial state for recommendations and offset
        setRecommendations(initialBatch);
        setOffset(initialBatch.length);
    }, [outfitKeywords, vibeMatchDetails]); // Re-run if AI or fallback data changes

    const handleShowMore = () => {
        // 1. Regenerate all filtered products (the full list, correctly filtered by category)
        const allProducts = generateRecommendations(quizAnswers, outfitKeywords); 
        
        // 2. Get the next slice and update the offset via the function
        const nextBatch = loadNextBatch(allProducts);
        
        // 3. Append the new batch to the existing list
        if (nextBatch.length > 0) {
            setRecommendations(prev => [...prev, ...nextBatch]);
        }
        
        // 4. Check the count and show the custom modal if nothing was loaded
        if (nextBatch.length === 0) {
            showMessageModal("That's all the vibe matches we found for you! Try the 'Browse All Products' feature or restart the quiz.");
        }
    };
    
    // Dynamic Class Logic
    // Only apply card border/shadow if outfit context is NOT present, so the cards look continuous
    const isVibeMatchTopCard = !outfitKeywords;
    const recommendationCardClass = isDarkTheme ? 
        `card-bg p-6 md:p-10 rounded-2xl shadow-xl w-full mb-6 ${isVibeMatchTopCard ? 'border-t-8 border-accent-platinum' : ''}` : 
        `bg-light-card-bg p-6 md:p-10 rounded-2xl shadow-xl w-full mb-6 ${isVibeMatchTopCard ? 'border-t-8 border-accent-platinum' : ''}`;
    
    const styleSubtitleClass = isDarkTheme ? 'text-F5F5F5' : 'text-gray-700';

    if (!match) {
        return (
            <div id="loadingScreen" className="screen flex-col">
                <div className="spinner mb-6"></div>
                <p className="text-2xl md:text-4xl font-serif font-semibold text-text-light">Calculating your perfect match...</p>
                <p className="text-lg md:text-xl mt-2 text-B1B1B1 font-sans">Connecting to our styling expert AI.</p>
            </div>
        );
    }

    return (
        <div id="resultScreen" className="screen flex-col flex">
            <div className="w-full max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light text-center mb-8">
                    Your Vibe Match is Ready!
                </h2>

                <div className="w-full flex flex-col md:flex-row md:space-x-8 items-start">
                    {/* VIBE MATCH PANELS (LEFT COLUMN) */}
                    <div className="md:w-1/2 w-full">
                        
                        {/* --- OUTFIT CONTEXT CARD (Dynamic AI Metal Match) --- */}
                        {outfitKeywords && (
                            <div className="card-bg p-6 rounded-2xl shadow-xl border-t-8 border-accent-platinum w-full mb-6">
                                <p className="font-bold text-lg text-accent-platinum mb-2 font-sans">
                                    Outfit Context Analysis
                                </p>
                                <h3 className="text-xl font-serif font-extrabold text-accent-platinum mb-2">
                                    Suggested Metal: {outfitKeywords.metal_match}
                                </h3>
                                <p className="text-base mt-1 text-B1B1B1 font-sans">
                                    {outfitKeywords.description}
                                </p>
                                
                                {/* Display the reference image if available */}
                                {outfitRefImageUrl && outfitRefImageUrl.includes('http') && (
                                    <img 
                                        src={outfitRefImageUrl} 
                                        alt="Outfit Reference from Web Search" 
                                        className="mt-4 w-full h-auto object-cover rounded-lg shadow-md border-2 border-B1B1B1/30" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/B1B1B1/111111?text=Image+Unavailable'; }}
                                    />
                                )}
                            </div>
                        )}
                        {/* --- END OUTFIT CONTEXT CARD --- */}

                        <div id="recommendationCard" className={recommendationCardClass}>
                            {/* VIBE MATCH FROM QUIZ (Icon/Title/Subtitle is now taken from match object) */}
                            <p id="styleMatchText" className="text-lg text-accent-platinum mb-2 font-sans">
                                Here’s your signature style (from quiz):
                            </p>
                            <h3 id="styleIcon" className="text-3xl md:text-5xl font-serif font-extrabold text-accent-platinum">
                                {match.icon}
                            </h3>
                            <p id="styleSubtitle" className={`text-xl mt-4 font-sans font-semibold ${styleSubtitleClass}`}>
                                {match.subtitle}
                            </p>
                            <p className="text-base mt-2 text-B1B1B1 font-sans">Explore pieces that bring this look to life.</p>
                        </div>
                        
                        {/* CELEBRITY AND MOVIE PANELS (Now Dynamic) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="card-bg rounded-xl shadow-lg overflow-hidden border border-B1B1B1/30">
                                <div className="h-40 bg-111111 flex items-center justify-center text-text-light text-lg">
                                    <img 
                                        id="celebImage" 
                                        // Use match.celebrityImage (set by backend or fallback)
                                        src={match.celebrityImage} 
                                        alt={match.icon} 
                                        className="w-full h-full object-cover opacity-80" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/8B2E2E/F5F5F5?text=Image+Error'; }}
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="font-bold text-sm text-B1B1B1 font-sans">Celebrity Inspiration</p>
                                    {/* Use match.icon as the title */}
                                    <p className="text-lg font-semibold text-text-light font-sans">{match.icon}</p>
                                </div>
                            </div>
                            <div className="card-bg rounded-xl shadow-lg overflow-hidden border border-B1B1B1/30">
                                <div className="h-40 bg-111111 flex items-center justify-center text-text-light text-lg">
                                    <img 
                                        // Use match.movieImage (set by backend or fallback)
                                        src={match.movieImage} 
                                        alt={match.movieScene} 
                                        className="w-full h-full object-cover opacity-80" 
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x200/0E5C4E/F5F5F5?text=Image+Error'; }}
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="font-bold text-sm text-B1B1B1 font-sans">Movie Inspo Scene</p>
                                    {/* Use match.movieScene as the title */}
                                    <p className="text-lg font-semibold text-text-light font-sans">{match.movieScene}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* NEW: Image Search Button */}
                        <button
                            onClick={() => navigate('imagesearch')}
                            className="w-full py-4 text-lg font-sans rounded-xl shadow-lg primary-cta mt-6"
                        >
                            ✨ Shop the Look: Upload a Photo
                        </button>
                    </div>

                    {/* RECOMMENDED PRODUCTS (RIGHT COLUMN) */}
                    <div className="md:w-1/2 w-full mt-8 md:mt-0">
                        <h3 className="text-2xl md:text-3xl font-serif font-semibold mb-6 text-center md:text-left text-text-light">
                            Recommended Products
                        </h3>
                        <div id="productGrid" className="grid grid-cols-2 gap-4 md:gap-6">
                            {recommendations.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                        <button 
                            onClick={handleShowMore}
                            className="mt-6 w-full py-3 text-lg font-sans rounded-xl shadow-md secondary-cta"
                        >
                            Show More Matches
                        </button>
                    </div>
                </div>
                
                {/* BOTTOM BUTTONS - ADDING RESTART QUIZ HERE */}
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 max-w-xl mx-auto mt-10">
                    <button 
                        onClick={startNewSession} // <-- RESTART QUIZ BUTTON
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg secondary-cta"
                    >
                        Restart Quiz
                    </button>
                    <button 
                        onClick={() => navigate('allproducts')}
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg secondary-cta"
                    >
                        Browse All Products
                    </button>
                    <button 
                        onClick={() => navigate('leadcapture')}
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                    >
                        Save Look to Phone & Offer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultScreen;
