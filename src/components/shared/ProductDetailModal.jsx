
// src/components/shared/ProductDetailModal.jsx

import React, { useState } from 'react';
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils';
import { X, ZoomIn, ShoppingCart, Video } from 'lucide-react';
import ZoomModal from './ZoomModal';
import { useTranslation } from 'react-i18next';


const ProductDetailModal = ({ product, isDarkTheme, onClose }) => {
    const { addToCart, showTryOnModal } = useVibe();
    const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
    const { t } = useTranslation();


    const handleAddToCart = () => {
        addToCart(product.id);
        onClose(); // Close detail modal after adding to cart
    };

    const handleTryOn = () => {
        showTryOnModal(product.id);
        onClose(); // Close detail modal to show try-on modal
    };

    const modalBg = isDarkTheme ? 'rgba(17, 17, 17, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    const contentBg = isDarkTheme ? 'bg-2A2A2A' : 'bg-light-card-bg';
    const textColor = isDarkTheme ? 'text-F5F5F5' : 'text-light-secondary';
    const mutedTextColor = isDarkTheme ? 'text-B1B1B1' : 'text-light-muted';
    const accentColor = isDarkTheme ? 'text-DAD5C1' : 'text-light-primary';

    return (
        <>
            <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]" style={{ backgroundColor: modalBg }}>
                <div className={`${contentBg} rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden`}>
                    {/* Image Section */}
                    <div className="w-full md:w-1/2 relative group">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        <button
                            onClick={() => setIsZoomModalOpen(true)}
                            className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                        >
                            <ZoomIn size={48} />
                            <span className="ml-2 font-sans font-bold">{t('zoomImage')}</span>
                        </button>
                    </div>

                    {/* Details Section */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
                        <div className="flex-1">
                            <h3 className={`text-3xl font-serif font-bold ${textColor}`}>{product.name}</h3>
                            <p className={`text-2xl font-sans font-semibold mt-2 ${accentColor}`}>{formatPrice(product.price)}</p>

                            <p className={`mt-4 text-base ${mutedTextColor}`}>{product.description}</p>
                            
                            <div className="mt-6 space-y-2 border-t pt-4 border-gray-500/30">
                                <p><strong className={textColor}>{t('productCategory')}:</strong> <span className={mutedTextColor}>{product.category}</span></p>
                                <p><strong className={textColor}>{t('productCollection')}:</strong> <span className={mutedTextColor}>{product.collection}</span></p>
                                <p><strong className={textColor}>{t('productMaterials')}:</strong> <span className={mutedTextColor}>{product.tags.join(', ')}</span></p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 space-y-3">
                            <button onClick={handleAddToCart} className="w-full py-3 text-lg font-sans rounded-xl shadow-lg primary-cta flex items-center justify-center gap-2">
                                <ShoppingCart size={20} /> {t('addToCart')}
                            </button>
                            <button onClick={handleTryOn} className="w-full py-3 text-lg font-sans rounded-xl shadow-lg secondary-cta flex items-center justify-center gap-2">
                                <Video size={20} /> {t('virtualTryOn')}
                            </button>
                        </div>
                    </div>
                    
                    {/* Close Button */}
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition">
                        <X size={24} />
                    </button>
                </div>
            </div>
            
            {isZoomModalOpen && (
                <ZoomModal
                    imageUrl={product.imageUrl}
                    productName={product.name}
                    isDarkTheme={isDarkTheme}
                    onClose={() => setIsZoomModalOpen(false)}
                />
            )}
        </>
    );
};

export default ProductDetailModal;
