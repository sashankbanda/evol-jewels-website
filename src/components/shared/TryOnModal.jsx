// src/components/shared/TryOnModal.jsx

import React, { useState, useEffect } from 'react';
import { useVibe } from '../../context/VibeContext';

const TryOnModal = () => {
    const { isDarkTheme, tryOnProduct, handleTryOnFeedback } = useVibe();
    const [engagementStatus, setEngagementStatus] = useState("Detecting Engagement...");

    // Close the modal if the product is null
    if (!tryOnProduct) return null;

    // Simulate engagement detection
    useEffect(() => {
        const timer = setTimeout(() => {
            setEngagementStatus("Engagement: Confirmed (Active View)");
        }, 1000);
        return () => clearTimeout(timer);
    }, [tryOnProduct]); 
    
    const product = tryOnProduct;

    // Dynamic Class Logic
    const modalBg = isDarkTheme ? 'rgba(17, 17, 17, 0.9)' : 'rgba(0, 0, 0, 0.7)';
    const modalContentClass = isDarkTheme ? 'card-bg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center border border-DAD5C1/30' : 'bg-light-card-bg p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-xl text-center border border-gray-100';
    const arViewClass = `h-64 ${isDarkTheme ? 'bg-111111' : 'bg-gray-100'} border-4 border-dashed ${isDarkTheme ? 'border-accent-platinum' : 'border-light-primary'} rounded-xl flex items-center justify-center mb-8 relative`;
    const emotionDetectorClass = `absolute top-4 left-4 text-sm font-bold px-3 py-1 rounded-full shadow-lg ${isDarkTheme ? 'bg-0E5C4E text-F5F5F5' : 'bg-light-primary text-white'}`;
    const closeBtnTextClass = isDarkTheme ? 'text-B1B1B1 hover:text-F5F5F5' : 'text-gray-500 hover:text-gray-700';


    return (
        <div id="feedbackModal" className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: modalBg }}>
            <div className={modalContentClass}>
                <h4 className="text-3xl font-serif font-bold mb-4 text-text-light">Virtual Try-On</h4>
                <p id="modalProductName" className="text-xl text-accent-platinum font-sans font-semibold mb-6">
                    {product.name}
                </p>

                <div className={arViewClass}>
                    <span className="text-B1B1B1 text-lg font-sans">Simulated AR View: Item on Model</span>
                    <div id="emotionDetector" className={emotionDetectorClass}>
                        {engagementStatus}
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button 
                        onClick={() => handleTryOnFeedback('love', product)}
                        className="flex-1 py-4 text-lg font-sans rounded-xl shadow-md primary-cta">
                        Keep This Vibe (Add to Cart)
                    </button>
                    <button 
                        onClick={() => handleTryOnFeedback('dislike', product)}
                        className="flex-1 py-4 text-lg font-sans rounded-xl shadow-md tertiary-cta">
                        Refine Look (Try Again)
                    </button>
                </div>

               <button 
                   onClick={() => handleTryOnFeedback('cancel')} // 'cancel' action to just close the modal
                   className={`mt-4 w-full py-2 text-sm font-sans transition duration-200 ${closeBtnTextClass}`}>
                    Cancel / Back to Looks
                </button>
            </div>
        </div>
    );
};

export default TryOnModal;