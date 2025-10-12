// src/components/shared/ProductCard.jsx

import React from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils';

const ProductCard = ({ product }) => {
    const { isDarkTheme, showTryOnModal } = useVibe();
    
    // Dynamic Class Logic based on original prototype's renderProducts function
    const cardBg = isDarkTheme ? 'bg-2A2A2A/50' : 'bg-light-card-bg';
    const shadowHover = isDarkTheme ? 'hover:shadow-DAD5C1/30' : 'hover:shadow-lg';
    const cardBorder = isDarkTheme ? 'border-B1B1B1/10' : 'border-gray-200';
    const textStrong = isDarkTheme ? 'text-F5F5F5' : 'text-gray-800';
    const textMuted = isDarkTheme ? 'text-B1B1B1' : 'text-gray-500';
    const textAccent = isDarkTheme ? 'text-DAD5C1' : 'text-light-primary';
    const btnBg = isDarkTheme ? 'bg-111111' : 'bg-gray-300';
    const btnText = isDarkTheme ? 'text-F5F5F5' : 'text-light-secondary';
    const btnHoverBg = isDarkTheme ? 'hover:bg-2A2A2A' : 'hover:bg-gray-400';
    
    const formattedPrice = formatPrice(product.price);
    const categoryName = product.category === 'Pendant' ? 'Necklace' : product.category;
    const collectionName = product.collection || 'General Line';

    return (
        <div className={`product-card ${cardBg} rounded-xl shadow-lg overflow-hidden transition duration-300 ${shadowHover} hover:shadow-2xl border ${cardBorder}`}>
            <div className={`h-40 ${isDarkTheme ? 'bg-111111' : 'bg-gray-200'} flex items-center justify-center ${textMuted} text-lg`}>
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover" 
                    // Note: You must handle missing images via React's onError or local image path setup
                />
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
    );
};

export default ProductCard;