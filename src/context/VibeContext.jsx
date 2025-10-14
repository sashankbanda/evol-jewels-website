// src/context/VibeContext.jsx

import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProductById } from '../logic/productUtils';

// 1. Create Context
const VibeContext = createContext();

// 2. Custom Hook for easy access
export const useVibe = () => useContext(VibeContext);

// 3. Provider Component
export const VibeProvider = ({ children }) => {
    // --- Application State ---
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [cart, setCart] = useState([]);
    const [screenHistory, setScreenHistory] = useState(['start']); 
    const [tryOnProduct, setTryOnProduct] = useState(null); 
    const [recommendationOffset, setRecommendationOffset] = useState(0);
    const [messageModal, setMessageModal] = useState(null);
    
    // --- NEW STATE FOR OUTFIT CONTEXT ---
    const [outfitKeywords, setOutfitKeywords] = useState(null); 
    const [outfitRefImageUrl, setOutfitRefImageUrl] = useState(null);
    // ------------------------------------

    // --- Initialization & Theme Logic ---
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkTheme(false);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkTheme;
        setIsDarkTheme(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    };
    
    // --- Navigation Logic (using history array) ---
    const navigate = (screenId) => {
        setScreenHistory(prev => {
            if (screenId === prev[prev.length - 1]) return prev;
            return [...prev, screenId];
        });
    };

    const goBack = () => {
        setScreenHistory(prev => {
            if (prev.length <= 1) {
                startNewSession();
                return ['start']; 
            }
            
            let history = [...prev];
            const lastScreen = history[history.length - 1];

            // 1. Handle Quiz step navigation (same as before)
            if (lastScreen === 'quiz' && currentStep > 1) {
                setCurrentStep(prevStep => prevStep - 1);
                return history;
            }
            
            // Pop the current screen off the history array
            history.pop(); 
            
            // 2. NEW FIX: If the previous screen was 'loading', pop that too, 
            //    so we land on the screen *before* loading (which is quiz or cart)
            if (history.length > 0 && history[history.length - 1] === 'loading') {
                history.pop();
            }

            // If history is empty after cleanup, default to start
            if (history.length === 0) return ['start'];

            return history; 
        });
    };

    // --- Quiz Logic ---
    const startQuiz = () => {
        setQuizAnswers({});
        setCurrentStep(1);
        setRecommendationOffset(0);
        setOutfitKeywords(null); 
        setOutfitRefImageUrl(null);
        navigate('quiz'); 
    };

    const answerQuiz = (step, answer) => {
        const newAnswers = { ...quizAnswers, [step]: answer };
        setQuizAnswers(newAnswers);

        if (currentStep < 4) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 400);
        } else {
            // *** CRITICAL CHANGE ***: Navigate to outfit input after last quiz step
            navigate('outfitinput'); 
        }
    };

    // --- NEW: CONTEXT ANALYSIS FUNCTION ---
    const startContextAnalysis = async (text) => {
        if (!text || text.trim() === '') {
            // If user clicks skip
            setOutfitKeywords(null);
            setOutfitRefImageUrl(null);
            navigate('loading');
            setTimeout(() => navigate('results'), 500);
            return;
        }

        navigate('loading');
        setRecommendationOffset(0); 

        try {
            // *** REAL BACKEND CALL TO NODE SERVER ***
            // This URL must match the port and endpoint in your server.js file (http://localhost:3001)
            const response = await fetch('http://localhost:3001/api/analyze-outfit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfitText: text }),
            });

            if (!response.ok) {
                console.error("Server responded with error:", response.status);
                throw new Error(`AI service failed with status ${response.status}.`);
            }

            const aiResponse = await response.json(); 
            
            // Use the real structured data returned from server.js
            setOutfitKeywords(aiResponse.keywords); 
            setOutfitRefImageUrl(aiResponse.imageUrl);

        } catch (error) {
            console.error("Context Analysis Error:", error);
            setOutfitKeywords(null); 
            setOutfitRefImageUrl(null);
            showMessageModal("We failed to connect to the styling AI. Results are based on your quiz answers only.");
        }
        
        setTimeout(() => navigate('results'), 1500); 
    };


    // --- Custom Modal Logic ---
    const showMessageModal = (message) => {
        setMessageModal(message);
    };

    const hideMessageModal = () => {
        setMessageModal(null);
    };
    
    // --- Cart Logic ---
    const addToCart = (productId) => {
        const product = getProductById(productId);
        if (product) {
            setCart(prev => [...prev, product]);
        }
        console.log(`${product?.name || 'Item'} added to cart!`); 
    };

    const removeCartItem = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price, 0);
    };

    // --- Try-On Modal Logic ---
    const showTryOnModal = (productId) => {
        const product = getProductById(productId);
        setTryOnProduct(product);
    };

    const handleTryOnFeedback = (action, product) => {
        if (action === 'love') {
            addToCart(product.id); 
        }
        setTryOnProduct(null); 
        // Logic to navigate back only if not already on the result screen
        setScreenHistory(prev => (prev[prev.length - 1] !== 'results' ? [...prev, 'results'] : prev));
    };

    const startNewSession = () => {
        setCart([]);
        setQuizAnswers({});
        setCurrentStep(1);
        setRecommendationOffset(0);
        setOutfitKeywords(null);
        setOutfitRefImageUrl(null);
        setScreenHistory(['start']);
    };


    const contextValue = {
        isKioskMode: window.location.pathname.startsWith('/kiosk'), 
        isDarkTheme,
        toggleTheme,
        currentStep,
        quizAnswers,
        outfitKeywords, 
        outfitRefImageUrl, 
        cart,
        screenHistory: screenHistory[screenHistory.length - 1] || 'start', 
        tryOnProduct,
        messageModal,
        recommendationOffset,
        setRecommendationOffset,

        navigate,
        goBack,
        startQuiz,
        answerQuiz,
        startContextAnalysis, 
        addToCart,
        removeCartItem,
        getCartTotal,
        showTryOnModal,
        handleTryOnFeedback,
        startNewSession,
        showMessageModal, 
        hideMessageModal, 
    };

    useEffect(() => {
        document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
    }, [isDarkTheme]);

    return (
        <VibeContext.Provider value={contextValue}>
            {children}
        </VibeContext.Provider>
    );
};