
// src/components/shared/ZoomModal.jsx (UPDATED for Zoom/Pan/Pinch)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const ZoomModal = ({ imageUrl, productName, isDarkTheme, onClose }) => {
    const { t } = useTranslation();

    
    // --- State for Pan/Zoom/Pinch ---
    const [scale, setScale] = useState(1.0);
    const [offset, setOffset] = useState({ x: 0, y: 0 }); // Current pan position
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialOffset = useRef({ x: 0, y: 0 });
    const touchStartDistance = useRef(null); // For pinch gesture
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    
    // Constants and Classes
    const MAX_SCALE = 4.0;
    const MIN_SCALE = 1.0;
    const ZOOM_STEP = 0.15;
    const modalBg = 'rgba(0, 0, 0, 0.9)';
    const contentBg = isDarkTheme ? 'bg-111111' : 'bg-F5F5F5';
    const textClass = isDarkTheme ? 'text-DAD5C1' : 'text-gray-200';
    const closeBtnClass = `absolute top-4 right-4 z-50 p-3 rounded-full ${contentBg} ${textClass} hover:opacity-75 transition-opacity`;

    // --- Utility Functions ---

    // Calculate distance between two touch points for pinch-to-zoom
    const getDistance = (touches) => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // Keep the image within the viewable area (prevent it from dragging completely off screen)
    const clampOffset = useCallback((newOffsetX, newOffsetY, currentScale) => {
        if (!imageRef.current || !containerRef.current || currentScale <= 1) {
             // Reset offset if not zoomed
             return { x: 0, y: 0 };
        }
        
        const img = imageRef.current;
        const container = containerRef.current;
        
        const scaledWidth = img.clientWidth * currentScale;
        const scaledHeight = img.clientHeight * currentScale;
        
        // Calculate the maximum allowed drag distance (half the difference between scaled size and container size)
        const maxX = Math.max(0, (scaledWidth - container.clientWidth) / 2);
        const maxY = Math.max(0, (scaledHeight - container.clientHeight) / 2);
        
        // Clamp the offset values
        const clampedX = Math.min(Math.max(newOffsetX, -maxX), maxX);
        const clampedY = Math.min(Math.max(newOffsetY, -maxY), maxY);
        
        return { x: clampedX, y: clampedY };
    }, []);

    // Apply clamping every time scale or offset changes
    useEffect(() => {
        setOffset(prev => clampOffset(prev.x, prev.y, scale));
    }, [scale, clampOffset]);
    
    // --- Mouse Wheel Zoom (Scroll) ---
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        
        const direction = e.deltaY < 0 ? 1 : -1; // Negative deltaY is zoom in
        const newScale = Math.min(Math.max(scale + direction * ZOOM_STEP, MIN_SCALE), MAX_SCALE);

        setScale(newScale);
        
    }, [scale]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) {
                container.removeEventListener('wheel', handleWheel);
            }
        };
    }, [handleWheel]);


    // --- Touch/Mouse Drag (Pan) ---
    
    const handleDragStart = useCallback((e) => {
        if (scale <= 1) return; // Only allow drag/pan when zoomed
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        // Check for two touches (Pinch takes priority)
        if (e.touches && e.touches.length === 2) {
             touchStartDistance.current = getDistance(e.touches);
             return;
        }

        e.preventDefault(); 
        isDragging.current = true;
        dragStart.current = { x: clientX, y: clientY };
        initialOffset.current = { x: offset.x, y: offset.y };
        
        // Setup listeners for mouse/touch end
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove, { passive: false });
        document.addEventListener('touchend', handleDragEnd);
        
    }, [scale, offset]);

    const handleDragMove = useCallback((e) => {
        
        // 1. Pinch Zoom (Touchscreen)
        if (e.touches && e.touches.length === 2 && touchStartDistance.current !== null) {
            e.preventDefault(); // Stop default scroll/pan/zoom behavior
            const currentDistance = getDistance(e.touches);
            
            // Calculate scale change factor relative to start distance
            const scaleFactor = currentDistance / touchStartDistance.current;
            let newScale = scale * scaleFactor;
            
            // Clamp and update
            newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
            setScale(newScale);
            touchStartDistance.current = currentDistance; // Update distance for next frame
            
            // If scale returns to 1.0, reset offset as well
            if (newScale <= 1.05) {
                setScale(1.0);
                setOffset({ x: 0, y: 0 });
            }
            return;
        }


        // 2. Pan/Drag (Only if dragging is enabled and only one touch/mouse button)
        if (!isDragging.current || scale <= 1) return;
        
        e.preventDefault();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;
        
        const newOffsetX = initialOffset.current.x + dx;
        const newOffsetY = initialOffset.current.y + dy;
        
        // Apply clamping before setting the state
        const clamped = clampOffset(newOffsetX, newOffsetY, scale);
        setOffset(clamped);

    }, [scale, clampOffset]);

    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        touchStartDistance.current = null;
        
        // Cleanup listeners
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove, { passive: false });
        document.removeEventListener('touchend', handleDragEnd);
    }, [handleDragMove]);
    
    
    // --- Modal Logic (ESC key, Scroll Lock) ---

    // Close on ESC key press
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Simple scroll lock
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // --- Render ---

    // The image transformation style
    const transformStyle = {
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transition: isDragging.current || touchStartDistance.current ? 'none' : 'transform 0.1s ease-out', // Don't animate while dragging/pinching
        cursor: scale > 1 ? (isDragging.current ? 'grabbing' : 'grab') : 'default',
    };
    
    // Determine if the full zoom has been requested (to stop modal closure on click)
    const isZoomedOrPanned = scale > 1.05;

    return (
        // Backdrop (Closes modal on click outside the content/image)
        <div 
            className="fixed inset-0 flex items-center justify-center z-[9999]" 
            style={{ backgroundColor: modalBg }}
            onClick={!isZoomedOrPanned ? onClose : undefined} // Only close if not zoomed
        >
            {/* Close Button */}
            <button onClick={onClose} className={closeBtnClass}>
                <X size={24} />
            </button>

            {/* Content Container (Handles Clicks/Scroll/Drag) */}
            <div 
                ref={containerRef}
                className="relative w-full h-full flex items-center justify-center"
                // Start drag/pinch on this container
                onMouseDown={handleDragStart} 
                onTouchStart={handleDragStart}
            >
                <img 
                    ref={imageRef}
                    src={imageUrl} 
                    alt={t('zoomedView', { productName: productName })}
                    // Apply the computed transform style
                    style={transformStyle}
                    // Prevent image drag ghost
                    onDragStart={(e) => e.preventDefault()}
                    // Image styling
                    className="object-contain max-w-[90vw] max-h-[90vh] shadow-2xl rounded-lg"
                />
            </div>
            
            {/* Action Bar/Caption */}
            <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 p-2 px-4 rounded-full font-serif font-bold text-lg shadow-xl ${contentBg} ${textClass}`}>
                {productName} 
                {scale > 1.05 && <span className="text-sm font-sans font-normal ml-3">({(scale * 100).toFixed(0)}%)</span>}
                {scale > 1.05 && (
                    <button 
                        onClick={() => { setScale(1.0); setOffset({ x: 0, y: 0 }); }}
                        className="ml-4 text-xs font-sans p-1 px-2 rounded-full border border-current hover:bg-white/10 transition"
                    >
                        {t('resetView')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ZoomModal;
