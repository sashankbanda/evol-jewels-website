// src/components/screens/ResultScreen.jsx

import React, { useState, useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';
import { getAllFilteredRecommendations, getVibeMatchDetails } from '../../logic/productUtils';
import ProductCard from '../shared/ProductCard';

const ResultScreen = () => {
    // NOTE: startNewSession is pulled from useVibe()
    const { isDarkTheme, quizAnswers, navigate, showMessageModal, startNewSession } = useVibe(); 
    const [recommendations, setRecommendations] = useState([]);
    const [offset, setOffset] = useState(0);
    const batchSize = 4;

    const match = getVibeMatchDetails(quizAnswers);
    
    // Combined logic for generating recommendations and fetching batches
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
        const allProducts = getAllFilteredRecommendations(quizAnswers);
        
        // Fetch the initial batch
        const initialBatch = allProducts.slice(0, batchSize);
        
        // Set initial state for recommendations and offset
        setRecommendations(initialBatch); 
        setOffset(initialBatch.length); 
    }, []); // Dependency array remains empty, runs only on mount

    const handleShowMore = () => {
        // 1. Regenerate all filtered products (the full list, correctly filtered by category)
        const allProducts = getAllFilteredRecommendations(quizAnswers);
        
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
    const recommendationCardClass = isDarkTheme ? 'card-bg p-6 md:p-10 rounded-2xl shadow-xl border-t-8 border-accent-platinum w-full mb-6' : 'bg-light-card-bg p-6 md:p-10 rounded-2xl shadow-xl border-t-8 border-accent-platinum w-full mb-6';
    const styleSubtitleClass = isDarkTheme ? 'text-F5F5F5' : 'text-gray-700';

    return (
        <div id="resultScreen" className="screen flex-col flex">
            <div className="w-full max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light text-center mb-8">
                    Your Vibe Match is Ready!
                </h2>

                <div className="w-full flex flex-col md:flex-row md:space-x-8 items-start">
                    {/* VIBE MATCH CARD */}
                    <div className="md:w-1/2 w-full">
                        <div id="recommendationCard" className={recommendationCardClass}>
                            <p id="styleMatchText" className="text-lg text-DAD5C1 mb-2 font-sans">Here’s your signature style:</p>
                            <h3 id="styleIcon" className="text-3xl md:text-5xl font-serif font-extrabold text-accent-platinum">
                                {match.icon}
                            </h3>
                            <p id="styleSubtitle" className={`text-xl mt-4 font-sans font-semibold ${styleSubtitleClass}`}>
                                {match.subtitle}
                            </p>
                            <p className="text-base mt-2 text-B1B1B1 font-sans">Explore pieces that bring this look to life.</p>
                        </div>
                        
                        {/* CELEBRITY AND MOVIE PANELS (Static placeholders) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="card-bg rounded-xl shadow-lg overflow-hidden border border-B1B1B1/30">
                                <div className="h-40 bg-111111 flex items-center justify-center text-text-light text-lg">
                                    <img id="celebImage" src={match.celebrityImage} alt={match.icon} className="w-full h-full object-cover opacity-80" />
                                </div>
                                <div className="p-4 text-center">
                                    <p className="font-bold text-sm text-B1B1B1 font-sans">Celebrity Inspiration</p>
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