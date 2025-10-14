// src/components/shared/ProductDetailModal.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronDown, ChevronUp, CheckCircle, ChevronLeft, ChevronRight, Maximize } from 'lucide-react'; 
import { useVibe } from '../../context/VibeContext';
import { formatPrice } from '../../logic/productUtils';

// Mock function to generate different views of a product based on its ID
const getSecondaryImageUrl = (id, view) => {
    // For simplicity, we assume product X has alternate views X+1, X+2.
    // We'll cap this at 60 to prevent errors, just for mock purposes.
    const baseId = id % 60;
    
    switch(view) {
        case 1: return `/media/image${(baseId % 60) + 1}.png`; // Main view (already provided)
        case 2: return `/media/image${((baseId + 1) % 60) + 1}.png`; // Side view
        case 3: return `/media/image${((baseId + 2) % 60) + 1}.png`; // Detail view
        default: return `/media/image${id}.png`;
    }
};

const ProductDetailModal = ({ product, isDarkTheme, onClose }) => {
    const { addToCart, showTryOnModal, showMessageModal } = useVibe();
    
    // State for user selections
    const [selectedKarat, setSelectedKarat] = useState(product.karats?.[0] || '14 KT');
    const [selectedColor, setSelectedColor] = useState(product.availableColors?.[0] || 'Polished Gold');
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'N/A');

    // Array of mock image URLs for the gallery (always includes the main one)
    const galleryImages = [
        product.imageUrl,
        getSecondaryImageUrl(product.id, 2),
        getSecondaryImageUrl(product.id, 3),
    ];
    
    // State for image gallery
    const initialImage = product.imageUrl;
    const [activeImage, setActiveImage] = useState(initialImage);
    const [activeIndex, setActiveIndex] = useState(0);

    // State for accordion sections
    const [showDetails, setShowDetails] = useState(true); 
    const [showSpecs, setShowSpecs] = useState(true); 

    // --- ZOOM/PAN STATE & REFS ---
    const [scale, setScale] = useState(1.0);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialOffset = useRef({ x: 0, y: 0 });
    const touchStartDistance = useRef(null); 
    const imageContainerRef = useRef(null);
    const imageRef = useRef(null);
    const MAX_SCALE = 3.0;
    const MIN_SCALE = 1.0;
    const ZOOM_STEP = 0.2;
    // ----------------------------


    // Dynamic Class Logic
    const modalBg = 'rgba(0, 0, 0, 0.9)';
    const contentClass = isDarkTheme ? 'bg-2A2A2A text-F5F5F5' : 'bg-light-card-bg text-light-secondary';
    const textStrong = isDarkTheme ? 'text-F5F5F5' : 'text-gray-800';
    const textMuted = isDarkTheme ? 'text-B1B1B1' : 'text-gray-500';
    const accentColor = isDarkTheme ? 'text-DAD5C1' : 'text-light-primary';
    const accentBorder = isDarkTheme ? 'border-DAD5C1' : 'border-light-primary';
    const imageNavButtonClass = `p-3 absolute top-1/2 -translate-y-1/2 rounded-full transition-colors z-10 
        ${isDarkTheme ? 'bg-black/50 hover:bg-black/70 text-F5F5F5' : 'bg-white/70 hover:bg-white/90 text-333333'}`;
    const isZoomed = scale > 1.05;

    // --- UTILITY FUNCTIONS ---
    const getDistance = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const clampOffset = useCallback((newOffsetX, newOffsetY, currentScale) => {
        if (!imageRef.current || !imageContainerRef.current || currentScale <= 1) {
             return { x: 0, y: 0 };
        }
        
        const img = imageRef.current;
        const container = imageContainerRef.current;
        
        // Use the displayed size, not the full size
        const scaledWidth = img.clientWidth * currentScale;
        const scaledHeight = img.clientHeight * currentScale;
        
        const maxX = Math.max(0, (scaledWidth - container.clientWidth) / 2);
        const maxY = Math.max(0, (scaledHeight - container.clientHeight) / 2);
        
        const clampedX = Math.min(Math.max(newOffsetX, -maxX), maxX);
        const clampedY = Math.min(Math.max(newOffsetY, -maxY), maxY);
        
        return { x: clampedX, y: clampedY };
    }, []);

    const resetZoom = () => {
        setScale(1.0);
        setOffset({ x: 0, y: 0 });
    };
    
    // --- NEW: MOUSE WHEEL ZOOM HANDLER ---
    const handleWheel = useCallback((e) => {
        if (!isZoomed && e.deltaY > 0) return; // Prevent accidental zoom out when already minimum size
        
        e.preventDefault();
        
        const direction = e.deltaY < 0 ? 1 : -1; // Negative deltaY is zoom in
        const newScale = Math.min(Math.max(scale + direction * ZOOM_STEP, MIN_SCALE), MAX_SCALE);
        
        setScale(newScale);
    }, [scale, isZoomed, MIN_SCALE, MAX_SCALE, ZOOM_STEP]);


    // --- CORE ZOOM/PAN HANDLERS ---
    const handleDragStart = useCallback((e) => {
        if (e.touches && e.touches.length === 2) {
             touchStartDistance.current = getDistance(e.touches);
             isDragging.current = false;
             e.preventDefault();
             return;
        }

        if (e.touches && e.touches.length > 1) return; // Prevent 3+ finger drag

        if (scale <= 1.0) return; 

        e.preventDefault();
        isDragging.current = true;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        dragStart.current = { x: clientX, y: clientY };
        initialOffset.current = { x: offset.x, y: offset.y };
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
    }, [scale, offset]);

    const handleDragMove = useCallback((e) => {
        // 1. Pinch Zoom (Touchscreen)
        if (e.touches && e.touches.length === 2 && touchStartDistance.current !== null) {
            e.preventDefault(); 
            const currentDistance = getDistance(e.touches);
            const scaleFactor = currentDistance / touchStartDistance.current;
            let newScale = scale * scaleFactor;
            
            newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            
            setScale(newScale);
            touchStartDistance.current = currentDistance; 
            
            if (newScale <= 1.05) {
                resetZoom();
            }
            return;
        }

        // 2. Pan/Drag
        if (!isDragging.current || scale <= 1.0) return;
        
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        
        const newOffsetX = initialOffset.current.x + dx;
        const newOffsetY = initialOffset.current.y + dy;
        
        const clamped = clampOffset(newOffsetX, newOffsetY, scale);
        setOffset(clamped);
    }, [scale, clampOffset]);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        touchStartDistance.current = null;
        
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove, { passive: false });
        document.removeEventListener('touchend', handleDragEnd);
    }, [handleDragMove]);

    const handleDoubleClick = (e) => {
        e.preventDefault();
        setScale(prev => prev > 1.0 ? 1.0 : 2.0); // Toggle zoom to 2x
    };
    
    // --- GALLERY/VIEW LOGIC ---
    const showPrevImage = useCallback(() => {
        resetZoom(); 
        setActiveIndex(prevIndex => {
            const newIndex = prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1;
            setActiveImage(galleryImages[newIndex]);
            return newIndex;
        });
    }, [galleryImages]);

    const showNextImage = useCallback(() => {
        resetZoom(); 
        setActiveIndex(prevIndex => {
            const newIndex = prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1;
            setActiveImage(galleryImages[newIndex]);
            return newIndex;
        });
    }, [galleryImages]);

    // Update active index and image when product changes or when a thumbnail is clicked
    useEffect(() => {
        const initialIndex = galleryImages.findIndex(img => img === product.imageUrl) || 0;
        setActiveIndex(initialIndex);
        setActiveImage(product.imageUrl);
        resetZoom(); // Reset zoom on modal load
    }, [product.id, product.imageUrl]);

    // Apply wheel listener to the image container
    useEffect(() => {
        const container = imageContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);

    // Handle scroll lock (kept for good measure)
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // --- BUTTON HANDLERS ---
    const handleAddToCart = () => {
        addToCart(product.id);
        onClose(); 
        showMessageModal(`${product.name} added to your cart with selected options.`);
    };

    const handleTryOn = () => {
        onClose(); 
        showTryOnModal(product.id);
    };
    
    const transformStyle = {
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transition: isDragging.current || touchStartDistance.current ? 'none' : 'transform 0.15s ease-out',
        cursor: scale > 1.0 ? (isDragging.current ? 'grabbing' : 'grab') : 'zoom-in',
    };
    
    const OptionSelector = ({ label, options, selected, onSelect }) => {
        const optionClasses = (value) => 
            `px-4 py-2 border rounded-lg cursor-pointer transition ${textStrong} font-sans text-sm 
             ${selected === value ? `${accentBorder} bg-opacity-10 shadow-lg` : `${isDarkTheme ? 'border-B1B1B1/30 hover:bg-111111' : 'border-gray-300 hover:bg-gray-100'}`}`;

        return (
            <div className="mb-6 text-left">
                <p className={`font-sans font-medium mb-2 ${textMuted} text-sm uppercase tracking-wider`}>{label}:</p>
                <div className="flex flex-wrap gap-3">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => onSelect(option)}
                            className={optionClasses(option)}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]" style={{ backgroundColor: modalBg }}>
            {/* Modal Container: Used max-w-6xl for better fit, h-[95vh] for maximum screen vertical usage */}
            <div 
                className={`relative max-w-6xl w-full h-[95vh] rounded-2xl shadow-3xl overflow-hidden flex flex-col md:flex-row ${contentClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button onClick={onClose} className={`absolute top-4 right-4 z-50 p-2 rounded-full ${isDarkTheme ? 'bg-2A2A2A text-F5F5F5' : 'bg-gray-100 text-333333'} hover:opacity-75 transition-opacity`}>
                    <X size={24} />
                </button>

                {/* Left Side: Image Gallery (55% width on desktop, full width on mobile) */}
                <div className="w-full md:w-[55%] p-4 bg-primary-bg flex flex-col md:flex-row h-1/2 md:h-full">
                    
                    {/* Thumbnails Column - Fixed height on mobile, fixed width on desktop */}
                    <div className="flex flex-row md:flex-col space-x-3 md:space-x-0 md:space-y-3 mr-4 overflow-x-auto md:overflow-y-auto py-2 md:py-0 w-full md:w-20 min-h-[88px] md:min-h-0">
                        {galleryImages.map((imgUrl, index) => (
                            <img
                                key={index}
                                src={imgUrl}
                                alt={`View ${index + 1}`}
                                onClick={() => {
                                    setActiveImage(imgUrl);
                                    setActiveIndex(index);
                                    resetZoom(); // Reset zoom when switching images
                                }}
                                className={`w-16 h-16 md:w-20 md:h-20 flex-shrink-0 object-cover rounded-md transition cursor-pointer 
                                    ${activeIndex === index ? `border-4 ${accentBorder}` : 'border-2 border-transparent opacity-70 hover:opacity-100'}`}
                            />
                        ))}
                    </div>

                    {/* Main Image Display with Navigation Arrows and Zoom */}
                    <div 
                        ref={imageContainerRef}
                        className="flex-1 flex items-center justify-center relative overflow-hidden bg-white/5 rounded-lg select-none"
                        onMouseDown={handleDragStart} 
                        onTouchStart={handleDragStart}
                        onDoubleClick={handleDoubleClick}
                    >
                        {/* Image Navigation Buttons (only visible when not dragging) */}
                        {!isDragging.current && (
                            <>
                                {/* Prev Button */}
                                <button 
                                    // Use showPrevImage directly 
                                    onClick={(e) => { e.stopPropagation(); showPrevImage(); }} 
                                    className={`${imageNavButtonClass} left-3`}
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                
                                <img 
                                    ref={imageRef}
                                    src={activeImage} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain p-4 transition-opacity duration-300"
                                    style={transformStyle}
                                    onDragStart={(e) => e.preventDefault()}
                                />

                                {/* Next Button */}
                                <button 
                                    // Use showNextImage directly
                                    onClick={(e) => { e.stopPropagation(); showNextImage(); }} 
                                    className={`${imageNavButtonClass} right-3`}
                                    aria-label="Next image"
                                >
                                    <ChevronRight size={24} />
                                </button>
                                
                                {/* Reset Zoom Button */}
                                {isZoomed && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); resetZoom(); }} 
                                        className={`absolute bottom-4 left-1/2 -translate-x-1/2 py-2 px-4 text-sm font-sans rounded-full shadow-lg ${isDarkTheme ? 'bg-DAD5C1/90 text-111111' : 'bg-white/90 text-333333'} hover:bg-opacity-100 transition z-20`}
                                    >
                                        Reset Zoom ({Math.round(scale * 100)}%)
                                    </button>
                                )}

                                {/* Zoom Hint Overlay */}
                                {!isZoomed && (
                                    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center text-xs font-sans p-2 rounded-full ${isDarkTheme ? 'bg-black/50 text-DAD5C1' : 'bg-black/50 text-white'}`}>
                                        <Maximize size={14} className="mr-2" />
                                        Click or Pinch to Zoom
                                    </div>
                                )}
                            </>
                        )}
                        {/* Fallback image display while dragging */}
                        {isDragging.current && (
                            <img 
                                ref={imageRef}
                                src={activeImage} 
                                alt={product.name} 
                                className="w-full h-full object-contain p-4"
                                style={transformStyle}
                                onDragStart={(e) => e.preventDefault()}
                            />
                        )}
                    </div>
                </div>

                {/* Right Side: Details and Options (45% width on desktop, full width on mobile) */}
                {/* FIX: The entire column below the X button handles scroll now. */}
                <div className="w-full md:w-1/2 p-6 md:p-8 h-1/2 md:h-full overflow-y-auto flex flex-col">
                    
                    {/* Fixed Header Content (Title, Price, Options, Actions, Delivery) */}
                    <div className="flex-shrink-0">
                        <h2 className={`text-3xl md:text-4xl font-serif font-bold ${textStrong} mb-2 text-left`}>{product.name}</h2>
                        <p className={`text-xl font-sans font-semibold ${accentColor} mb-6 text-left`}>{formatPrice(product.price)}</p>

                        {/* --- OPTIONS --- */}
                        <OptionSelector 
                            label="Purity" 
                            options={product.karats} 
                            selected={selectedKarat} 
                            onSelect={setSelectedKarat}
                        />
                        <OptionSelector 
                            label="Color" 
                            options={product.availableColors} 
                            selected={selectedColor} 
                            onSelect={setSelectedColor}
                        />
                        {product.category === 'Ring' && (
                            <OptionSelector 
                                label="Size" 
                                options={product.sizes} 
                                selected={selectedSize} 
                                onSelect={setSelectedSize}
                            />
                        )}
                        
                        {/* --- ACTIONS --- */}
                        <div className="mt-8 space-y-4">
                            <button 
                                onClick={handleAddToCart} 
                                className="w-full py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                            >
                                Add to Cart
                            </button>
                            <button 
                                onClick={handleTryOn} 
                                className={`w-full py-4 text-xl font-sans rounded-xl shadow-md secondary-cta`}
                            >
                                Try On Virtually
                            </button>
                        </div>

                        {/* Delivery Time */}
                        <div className={`flex items-center mt-6 text-sm ${textMuted} font-sans pb-4 border-b ${isDarkTheme ? 'border-B1B1B1/30' : 'border-gray-300'}`}>
                            <CheckCircle size={16} className={`mr-2 ${accentColor}`} />
                            <span className="font-semibold">Delivery Time:</span> {product.deliveryTime}
                        </div>
                    </div>

                    {/* Scrolling Details Content - Now just contains the accordion, letting the parent handle scroll */}
                    <div className="flex-1 mt-4"> 
                        <div className="space-y-4">
                            {/* Product Details */}
                            <button 
                                className={`w-full flex justify-between items-center py-3 px-4 rounded-lg font-sans font-semibold ${isDarkTheme ? 'bg-111111 text-F5F5F5' : 'bg-gray-100 text-333333'}`} 
                                onClick={() => setShowDetails(prev => !prev)}
                            >
                                Product Description
                                {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {showDetails && (
                                <div className={`p-4 rounded-lg border-l-4 ${accentBorder} ${isDarkTheme ? 'bg-111111/50' : 'bg-gray-50'}`}>
                                    <ul className={`list-disc list-inside space-y-2 text-sm ${textMuted}`}>
                                        {product.details.map((detail, index) => (
                                            <li key={index}className="text-left">{detail}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Specifications */}
                            <button 
                                className={`w-full flex justify-between items-center py-3 px-4 rounded-lg font-sans font-semibold ${isDarkTheme ? 'bg-111111 text-F5F5F5' : 'bg-gray-100 text-333333'}`} 
                                onClick={() => setShowSpecs(prev => !prev)}
                            >
                                Product Details and Specifications
                                {showSpecs ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            {showSpecs && (
                                <div className={`p-4 rounded-lg border-l-4 ${accentBorder} ${isDarkTheme ? 'bg-111111/50' : 'bg-gray-50'}`}>
                                    <ul className={`space-y-2 text-sm ${textMuted}`}>
                                        {product.specifications.map((spec, index) => (
                                            <li key={index} className="flex justify-between border-b border-gray-700/20 last:border-b-0 py-1">
                                                <span className="font-medium text-text-light/80">{spec.split(':')[0]}:</span>
                                                <span>{spec.split(':')[1]}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
