
// src/components/shared/AdjustmentOverlay.jsx

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Maximize, GripVertical, Move, RotateCw } from 'lucide-react'; // Added RotateCw icon
import { useTranslation } from 'react-i18next';


// This is the custom adjustment overlay with sliders
const AdjustmentOverlay = ({ adjustment, setAdjustment, isDarkTheme }) => {
    const { t } = useTranslation();
    // State to toggle between Position and Scale views
    // MODIFIED: Added 'Rotation' mode
    const [mode, setMode] = useState('Position'); // 'Position', 'Scale', or 'Rotation'
    
    // NEW STATE: Manages the absolute screen position of the overlay
    const [position, setPosition] = useState({ x: 0, y: 0 }); 
    const overlayRef = useRef(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const initialPosition = useRef({ x: 0, y: 0 });

    // --- Drag Logic (Unchanged) ---
    const handleDragStart = (e) => {
        e.preventDefault(); 
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        isDragging.current = true;
        dragStart.current = { x: clientX, y: clientY };
        initialPosition.current = { x: position.x, y: position.y };
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('touchend', handleDragEnd);
    };

    const handleDragMove = useCallback((e) => {
        if (!isDragging.current) return;
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const dx = clientX - dragStart.current.x;
        const dy = clientY - dragStart.current.y;

        setPosition({
            x: initialPosition.current.x + dx,
            y: initialPosition.current.y + dy,
        });
    }, []);


    const handleDragEnd = useCallback(() => {
        isDragging.current = false;
        
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove);
        document.removeEventListener('touchend', handleDragEnd);
    }, [handleDragMove]);

    // Set initial position relative to the modal's AR viewport
    useEffect(() => {
        if (overlayRef.current) {
            const container = overlayRef.current.parentElement;
            if (container) {
                setPosition({ 
                    x: container.offsetWidth / 2 - overlayRef.current.offsetWidth / 2, 
                    y: container.offsetHeight - overlayRef.current.offsetHeight - 20 
                });
            }
        }
    }, []); 

    // --- Styling Logic (Unchanged) ---
    const modeBtnClass = (currentMode) => 
        `flex items-center px-4 py-2 rounded-lg font-sans font-medium text-sm transition ${
            mode === currentMode 
                ? (isDarkTheme ? 'bg-DAD5C1 text-111111' : 'bg-light-secondary text-F5F5F5')
                : (isDarkTheme ? 'bg-2A2A2A text-B1B1B1 hover:bg-111111' : 'bg-gray-200 text-333333 hover:bg-gray-300')
        }`;
        
    const sliderTrackClass = isDarkTheme ? 'bg-DAD5C1/30' : 'bg-gray-300';

    const handleSliderChange = (e) => {
        const { name, value } = e.target;
        setAdjustment(prev => ({
            ...prev,
            [name]: parseFloat(value) 
        }));
    };
    
    // MODIFIED: Now only resets Position (offsetX, offsetY)
    const handleResetPosition = () => {
        setAdjustment(prev => ({
            ...prev,
            offsetX: 0,
            offsetY: 0,
        }));
    };
    
    // NEW: Resets only Rotation
    const handleResetRotation = () => {
        setAdjustment(prev => ({
            ...prev,
            rotationAngle: 0,
        }));
    };
    
    // NEW: Resets only Scale
    const handleResetScale = () => {
        setAdjustment(prev => ({
            ...prev,
            scaleFactor: 1.0,
        }));
    };

    return (
        <div 
            ref={overlayRef}
            className={`absolute rounded-xl shadow-2xl w-full max-w-sm ${isDarkTheme ? 'bg-111111/35' : 'bg-black/35'} p-4 z-40 text-left`}
            style={{ transform: `translate(${position.x}px, ${position.y}px)`, cursor: isDragging.current ? 'grabbing' : 'grab' }}
        >
            {/* Drag Handle & Mode Buttons */}
            <div 
                className="flex items-center justify-between text-B1B1B1 mb-4 cursor-grab active:cursor-grabbing touch-none"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                {/* MODIFIED: Added Rotation button */}
                <div className="flex space-x-2 overflow-x-auto pb-1">
                    <button 
                        onClick={() => setMode('Position')}
                        className={modeBtnClass('Position')}
                    >
                        <GripVertical size={16} className="mr-2" /> {t('adjustPosition')}
                    </button>
                    <button 
                        onClick={() => setMode('Rotation')}
                        className={modeBtnClass('Rotation')}
                    >
                        <RotateCw size={16} className="mr-2" /> {t('adjustRotation')}
                    </button>
                    <button 
                        onClick={() => setMode('Scale')}
                        className={modeBtnClass('Scale')}
                    >
                        <Maximize size={16} className="mr-2" /> {t('adjustScale')}
                    </button>
                </div>
                <Move size={20} className="text-DAD5C1 min-w-[20px]" />
            </div>

            <div className="space-y-6">
                {mode === 'Position' && (
                    <>
                        {/* Horizontal Position (Left/Right) */}
                        <div className="w-full">
                            <label className="text-B1B1B1 text-sm block mb-1">{t('horizontalOffset')}</label>
                            <input
                                type="range"
                                name="offsetX"
                                min="-100" 
                                max="100" 
                                step="1"
                                value={adjustment.offsetX}
                                onChange={handleSliderChange}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                                style={{ accentColor: isDarkTheme ? '#DAD5C1' : '#ff5a5f' }}
                            />
                            <div className="flex justify-between text-xs text-B1B1B1 mt-1">
                                <span>{t('left')}</span>
                                <span>{t('right')}</span>
                            </div>
                        </div>

                        {/* Vertical Position (Up/Down) */}
                        <div className="w-full">
                            <label className="text-B1B1B1 text-sm block mb-1">{t('verticalOffset')}</label>
                            <input
                                type="range"
                                name="offsetY"
                                min="-100" 
                                max="100" 
                                step="1"
                                value={adjustment.offsetY}
                                onChange={handleSliderChange}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                                style={{ accentColor: isDarkTheme ? '#DAD5C1' : '#ff5a5f' }}
                            />
                            <div className="flex justify-between text-xs text-B1B1B1 mt-1">
                                <span>{t('up')}</span>
                                <span>{t('down')}</span>
                            </div>
                        </div>
                        
                        {/* Reset Position Button */}
                        <button
                            onClick={handleResetPosition}
                            className="px-4 py-2 text-sm secondary-cta mt-2"
                        >
                            {t('resetPosition')}
                        </button>
                    </>
                )}
                
                {/* NEW: Rotation Slider View */}
                {mode === 'Rotation' && (
                    <>
                        <div className="w-full">
                            <label className="text-B1B1B1 text-sm block mb-1 flex items-center">
                                <RotateCw size={14} className="mr-2" /> {t('angle')}
                            </label>
                            <input
                                type="range"
                                name="rotationAngle"
                                min="-90" 
                                max="90" 
                                step="1"
                                value={adjustment.rotationAngle || 0} // Ensure it defaults to 0
                                onChange={handleSliderChange}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                                style={{ accentColor: isDarkTheme ? '#DAD5C1' : '#ff5a5f' }}
                            />
                            <div className="flex justify-between text-xs text-B1B1B1 mt-1">
                                <span>{t('angleLeft')}</span>
                                <span>{t('angleRight')}</span>
                            </div>
                        </div>
                        
                        {/* Reset Rotation Button */}
                        <button
                            onClick={handleResetRotation}
                            className="px-4 py-2 text-sm secondary-cta"
                        >
                            {t('resetRotation')}
                        </button>
                    </>
                )}

                {mode === 'Scale' && (
                    <>
                        {/* Scale (Size) */}
                        <div className="w-full">
                            <label className="text-B1B1B1 text-sm block mb-1">{t('scale')}</label>
                            <input
                                type="range"
                                name="scaleFactor"
                                min="0.1" 
                                max="1.5" 
                                step="0.01"
                                value={adjustment.scaleFactor}
                                onChange={handleSliderChange}
                                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${sliderTrackClass}`}
                                style={{ accentColor: isDarkTheme ? '#DAD5C1' : '#ff5a5f' }}
                            />
                            <div className="flex justify-between text-xs text-B1B1B1 mt-1">
                                <span>{t('smaller')}</span>
                                <span>{t('larger')}</span>
                            </div>
                        </div>
                        {/* Reset scale button */}
                        <button
                            onClick={handleResetScale}
                            className="px-4 py-2 text-sm secondary-cta"
                        >
                            {t('resetScale')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdjustmentOverlay;
