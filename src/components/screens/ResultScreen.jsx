// src/components/screens/ResultScreen.jsx

import React, { useState, useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';
import { getAllFilteredRecommendations, getVibeMatchDetails } from '../../logic/productUtils';
import ProductCard from '../shared/ProductCard';

const ResultScreen = () => {
    const { isDarkTheme, quizAnswers, navigate } = useVibe();
    const [recommendations, setRecommendations] = useState([]);
    const [offset, setOffset] = useState(0);
    const batchSize = 4;

    const match = getVibeMatchDetails(quizAnswers);
    
    // Combined logic for generating recommendations and fetching batches
    const loadNextBatch = (allProducts) => {
        const nextBatch = allProducts.slice(offset, offset + batchSize);
        setRecommendations(nextBatch);
        setOffset(prev => prev + nextBatch.length);
        return nextBatch.length;
    };

    useEffect(() => {
        // Generate initial recommendations only once when screen loads
        const allProducts = getAllFilteredRecommendations(quizAnswers);
        loadNextBatch(allProducts);
        // Note: In a real app, you'd store allProducts in state/context to reuse it for "Show More"
    }, []);

    const handleShowMore = () => {
        const allProducts = getAllFilteredRecommendations(quizAnswers); // Regenerate/refetch all if necessary
        const addedCount = loadNextBatch(allProducts);
        if (addedCount === 0) {
             alert("That's all the vibe matches we found for you! Try the 'Browse All Products' feature or restart the quiz.");
        }
    };
    
    // Dynamic Class Logic
    const recommendationCardClass = isDarkTheme ? 'card-bg p-6 md:p-10 rounded-2xl shadow-xl border-t-8 border-accent-platinum w-full mb-6' : 'bg-light-card-bg p-6 md:p-10 rounded-2xl shadow-xl border-t-8 border-accent-platinum w-full mb-6';
    const styleSubtitleClass = isDarkTheme ? 'text-F5F5F5' : 'text-gray-700';

    return (
        <div id="resultScreen" className="screen flex-col flex pt-24">
            <div className="w-full max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light text-center mb-8">
                    Your Vibe Match is Ready!
                </h2>

                <div className="w-full flex flex-col md:flex-row md:space-x-8 items-start">
                    {/* VIBE MATCH CARD */}
                    <div className="md:w-1/2 w-full">
                        <div id="recommendationCard" className={recommendationCardClass}>
                            <p id="styleMatchText" className="text-lg text-DAD5C1 mb-2 font-sans">Your style matches:</p>
                            <h3 id="styleIcon" className="text-3xl md:text-5xl font-serif font-extrabold text-accent-platinum">
                                {match.icon}
                            </h3>
                            <p id="styleSubtitle" className={`text-xl mt-4 font-sans font-semibold ${styleSubtitleClass}`}>
                                {match.subtitle}
                            </p>
                            <p className="text-base mt-2 text-B1B1B1 font-sans">Find the perfect pieces that capture this iconic look.</p>
                        </div>
                        
                        {/* CELEBRITY AND MOVIE PANELS (Static placeholders) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="card-bg rounded-xl shadow-lg overflow-hidden border border-B1B1B1/30">
                                <div className="h-40 bg-111111 flex items-center justify-center text-text-light text-lg">
                                    <img id="celebImage" src={match.celebrityImage} alt={match.icon} className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="font-bold text-sm text-B1B1B1 font-sans">Celebrity Vibe</p>
                                    <p className="text-lg font-semibold text-text-light font-sans">Iconic Jewelry Match</p>
                                </div>
                            </div>
                            <div className="card-bg rounded-xl shadow-lg overflow-hidden border border-B1B1B1/30">
                                <div className="h-40 bg-111111 flex items-center justify-center text-text-light text-lg">
                                    <img src="https://placehold.co/400x200/0E5C4E/F5F5F5?text=Movie+Inspo+Scene" alt="Movie Scene Reference" className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="font-bold text-sm text-B1B1B1 font-sans">Collection Hint</p>
                                    <p className="text-lg font-semibold text-text-light font-sans">Geometric & Classic pieces</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RECOMMENDED PRODUCTS */}
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
                            Refine & Show More Vibe Matches
                        </button>
                    </div>
                </div>
                
                {/* BOTTOM BUTTONS */}
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 max-w-xl mx-auto mt-10">
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