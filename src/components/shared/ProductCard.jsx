// src/components/shared/ProductCard.jsx

import React, { useState } from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils';
import ZoomModal from './ZoomModal'; // Import the new component

const ProductCard = ({ product }) => {
    const { isDarkTheme, showTryOnModal } = useVibe();
    
    // NEW STATE: To control the image zoom modal
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    
    // State to track hover for the subtle zoom effect (kept from last revision)
    const [isHovered, setIsHovered] = useState(false); 
    
    // Dynamic Class Logic...
    const cardBg = isDarkTheme ? 'bg-2A2A2A/50' : 'bg-light-card-bg';
    const shadowHover = isDarkTheme ? 'hover:shadow-DAD5C1/30' : 'hover:shadow-lg';
    const cardBorder = isDarkTheme ? 'border-B1B1B1/10' : 'border-gray-200';
    const textStrong = isDarkTheme ? 'text-F5F5F5' : 'text-gray-800';
    const textMuted = isDarkTheme ? 'text-B1B1B1' : 'text-gray-500';
    const textAccent = isDarkTheme ? 'text-DAD5C1' : 'text-light-primary';
    const btnBg = isDarkTheme ? 'bg-111111' : 'bg-gray-300';
    const btnText = isDarkTheme ? 'text-F5F5F5' : 'text-light-secondary';
    const btnHoverBg = isDarkTheme ? 'hover:bg-2A2A2A' : 'hover:bg-gray-400';
    
    const imageZoomClass = isHovered ? 'scale-110' : 'scale-100';

    const formattedPrice = formatPrice(product.price);
    const categoryName = product.category === 'Pendant' ? 'Necklace' : product.category;
    const collectionName = product.collection || 'General Line';

    return (
        <>
            <div 
                className={`product-card ${cardBg} rounded-xl shadow-lg overflow-hidden transition duration-300 ${shadowHover} hover:shadow-2xl border ${cardBorder}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* MODIFIED: Added onClick handler to open the zoom modal */}
                <div 
                    className={`h-40 ${isDarkTheme ? 'bg-111111' : 'bg-gray-200'} flex items-center justify-center ${textMuted} text-lg overflow-hidden relative cursor-zoom-in`}
                    onClick={() => setIsImageZoomed(true)} // <-- Open the modal on click
                >
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${imageZoomClass}`} 
                    />
                    {/* Optional: Add a subtle overlay icon to guide the user */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-sans font-medium p-2 rounded-lg bg-black/60">
                            Click to Zoom
                        </span>
                    </div>
                </div>
                
                <div className="p-4">
                    <p className={`font-serif font-semibold text-base ${textStrong} h-12 overflow-hidden`}>{product.name}</p>
                    <p className={`text-xs ${textMuted} mt-1 font-sans`}>{categoryName} | {collectionName}</p>
                    <p className={`font-sans font-bold text-lg ${textAccent} mt-2`}>{formattedPrice}</p>
                    
                    <div className="flex justify-center mt-2">
                        <button 
                            onClick={() => showTryOnModal(product.id)} 
                            className={`flex-1 py-2 ${btnBg} ${btnText} text-sm font-sans rounded-lg ${btnHoverBg} transition duration-200`}
                        >
                            Try On & Rate
                        </button>
                    </div>
                </div>
            </div>

            {/* NEW: Conditionally render the Zoom Modal */}
            {isImageZoomed && (
                <ZoomModal
                    imageUrl={product.imageUrl}
                    productName={product.name}
                    isDarkTheme={isDarkTheme}
                    onClose={() => setIsImageZoomed(false)}
                />
            )}
        </>
    );
};

export default ProductCard;