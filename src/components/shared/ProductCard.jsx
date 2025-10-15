
// src/components/shared/ProductCard.jsx

import React, { useState } from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils';
import ProductDetailModal from './ProductDetailModal'; // Import the new component
import { useTranslation } from 'react-i18next';


const ProductCard = ({ product }) => {
    const { isDarkTheme, showTryOnModal } = useVibe();
    const { t } = useTranslation();

    
    // NEW STATE: To control the Product Detail modal
    const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
    
    // State to track hover for the subtle zoom effect
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
                {/* MODIFIED: onClick handler now opens the Product Detail Modal */}
                <div 
                    className={`h-40 ${isDarkTheme ? 'bg-111111' : 'bg-gray-200'} flex items-center justify-center ${textMuted} text-lg overflow-hidden relative cursor-pointer`}
                    onClick={() => setIsProductDetailOpen(true)} // <-- Open the detail modal
                >
                    <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className={`w-full h-full object-cover transition-transform duration-500 ease-in-out ${imageZoomClass}`} 
                    />
                    {/* Overlay instruction */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-sans font-medium p-2 rounded-lg bg-black/60">
                            {t('viewDetails')}
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
                            {t('tryOnAndRate')}
                        </button>
                    </div>
                </div>
            </div>

            {/* NEW: Conditionally render the Product Detail Modal */}
            {isProductDetailOpen && (
                <ProductDetailModal
                    product={product}
                    isDarkTheme={isDarkTheme}
                    onClose={() => setIsProductDetailOpen(false)}
                />
            )}
        </>
    );
};

export default ProductCard;
