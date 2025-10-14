// src/context/VibeContext.jsx

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
// FIX: Corrected relative path to productUtils (should be ../logic/productUtils)
import { getProductById, getVibeMatchDetails } from '../logic/productUtils';
// NEW IMPORTS for client-side image feature extraction
// FIX: The compiler error on this import is unusual in a modern React setup, 
// but we'll leave it as is, assuming the environment's bundler configuration 
// (which we can't see) expects this structure, and focus on the relative path fix.
import * as tf from '@tensorflow/tfjs'; 
import * as mobilenet from '@tensorflow-models/mobilenet';

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
    const [isChatOpen, setIsChatOpen] = useState(false);
    
    // --- OUTFIT CONTEXT & VIBE MATCH ---
    const [outfitKeywords, setOutfitKeywords] = useState(null);
    const [outfitRefImageUrl, setOutfitRefImageUrl] = useState(null);
    const [vibeMatchDetails, setVibeMatchDetails] = useState(null); 
    
    // --- IMAGE SEARCH STATE ---
    const [imageSearchResult, setImageSearchResult] = useState(null);
    // --- NEW: ML Model State ---
    const [mobilenetModel, setMobilenetModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true); // Start loading immediately


    // --- MODEL LOADING & INIT ---
    useEffect(() => {
        async function loadModel() {
            if (mobilenetModel) return;
            try {
                // Load model version 1 with alpha 0.25, matching the server's feature extractor
                await tf.ready(); // Ensure TensorFlow is ready
                const model = await mobilenet.load({ version: 1, alpha: 0.25 });
                setMobilenetModel(model);
                console.log("MobileNet model loaded successfully on client.");
            } catch (error) {
                console.error("Failed to load MobileNet model on client:", error);
                // If model fails to load, image search will be disabled via isModelLoading=false and mobilenetModel=null
            } finally {
                setIsModelLoading(false);
            }
        }
        loadModel();
    }, []);

    // Helper function to convert Base64 Data URL to a feature vector
    const extractClientFeatureVector = useCallback(async (imageDataUrl) => {
        if (!mobilenetModel) {
            throw new Error("MobileNet model not yet loaded.");
        }
        
        // Use a temporary Image object to load the Base64 data
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageDataUrl;
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error("Image failed to load in memory."));
        });

        let imageTensor;
        let featureVector;

        try {
            // 1. Create Tensor
            imageTensor = tf.browser.fromPixels(img, 3);
            // 2. Pre-process (Resize and Normalize to match server logic)
            const resizedTensor = tf.image.resizeBilinear(imageTensor, [224, 224]);
            const normalizedTensor = resizedTensor.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
            const batchedTensor = normalizedTensor.expandDims(0); 

            // 3. Extract features (embeddings=true)
            const embeddings = mobilenetModel.infer(batchedTensor, true); 
            
            // 4. Convert to JS array
            featureVector = embeddings.dataSync();

            // 5. Clean up
            tf.dispose([imageTensor, resizedTensor, normalizedTensor, batchedTensor, embeddings]);
            
            return Array.from(featureVector);

        } catch (error) {
            if (imageTensor) tf.dispose(imageTensor); 
            console.error("TensorFlow Error during image processing:", error);
            throw new Error("Image processing failed at the feature extraction step.");
        }
    }, [mobilenetModel]);


    // --- Custom Modal Logic (defined early so other functions can use it) ---
    const showMessageModal = (message) => {
        setMessageModal(message);
    };

    const hideMessageModal = () => {
        setMessageModal(null);
    };


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

            // 1. Handle Quiz step navigation
            if (lastScreen === 'quiz' && currentStep > 1) {
                setCurrentStep(prevStep => prevStep - 1);
                return history;
            }
            
            // Pop the current screen off the history array
            history.pop();
            
            // 2. If the previous screen was 'loading', pop that too, 
            //    so we land on the screen *before* loading (which is quiz or cart)
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
        setCart([]);
        setQuizAnswers({});
        setCurrentStep(1);
        setRecommendationOffset(0);
        setOutfitKeywords(null);
        setOutfitRefImageUrl(null);
        setVibeMatchDetails(null); 
        setImageSearchResult(null);
        navigate('quiz');
    };

    const answerQuiz = (step, answer) => {
        const newAnswers = { ...quizAnswers, [step]: answer };
        setQuizAnswers(newAnswers);

        if (currentStep < 4) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 400);
        } else {
            // Navigate to outfit input after last quiz step
            navigate('outfitinput');
        }
    };

    // --- CONTEXT ANALYSIS FUNCTION ---
    const startContextAnalysis = async (text) => {
        const quizKey = `${quizAnswers.q1}_${quizAnswers.q3}_${quizAnswers.q4}`;

        setOutfitKeywords(null);
        setOutfitRefImageUrl(null);
        setVibeMatchDetails(null); 

        navigate('loading');
        setRecommendationOffset(0);

        try {
            const response = await fetch('http://localhost:3001/api/analyze-outfit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfitText: text, quizKey: quizKey }),
            });

            if (!response.ok) {
                console.error("Server responded with error:", response.status);
                throw new Error(`AI service failed with status ${response.status}.`);
            }

            const aiResponse = await response.json();
            
            setOutfitKeywords(aiResponse.keywords);
            setOutfitRefImageUrl(aiResponse.outfitImageUrl);
            setVibeMatchDetails(aiResponse.vibeMatch); 

        } catch (error) {
            console.error("Context Analysis Error:", error);
            const fallbackVibe = getVibeMatchDetails({ q1: quizAnswers.q1, q3: quizAnswers.q3, q4: quizAnswers.q4 });
            setOutfitKeywords(null);
            setOutfitRefImageUrl(null);
            setVibeMatchDetails(fallbackVibe);
            showMessageModal("We failed to connect to the styling AI. Results are based on your quiz answers only.");
        }
       
        setTimeout(() => navigate('results'), 1500);
    };

    // --- IMAGE SEARCH LOGIC (FIXED) ---
    const startImageSearch = async (imageDataUrl, mimeType) => {
        setImageSearchResult(null);
        
        if (isModelLoading || !mobilenetModel) {
            showMessageModal("Image recognition service is not ready. Please wait for the model to load and try again.");
            navigate('imagesearch');
            return;
        }

        let queryFeatureVector = null;
        try {
            // 1. EXTRACT FEATURE VECTOR on the client using the loaded model
            queryFeatureVector = await extractClientFeatureVector(imageDataUrl);
            console.log(`Extracted feature vector of length: ${queryFeatureVector.length}`);
        } catch (error) {
            console.error(error.message);
            showMessageModal("Failed to process the uploaded image. Please ensure it's a clear photo.");
            navigate('imagesearch'); 
            return; 
        }

        try {
            let result = null;
            let retries = 0;
            const maxRetries = 3;
            const initialDelay = 1000;

            const executeFetchWithRetry = async () => {
                const response = await fetch('http://localhost:3001/api/image-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    // 2. SEND THE CORRECT PAYLOAD (Feature Vector)
                    body: JSON.stringify({ queryFeatureVector: queryFeatureVector }),
                });

                if (!response.ok) {
                    if (retries < maxRetries) {
                        retries++;
                        const delay = initialDelay * Math.pow(2, retries - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return executeFetchWithRetry(); 
                    }
                    throw new Error(`AI service failed with status ${response.status}.`);
                }
                return await response.json();
            };
            
            result = await executeFetchWithRetry();
            // FIX: Correctly use the productIds property returned by the backend
            setImageSearchResult(result.productIds || []);
           
        } catch (error) {
            console.error("Image Search Failed:", error);
            setImageSearchResult([]);
            showMessageModal("The image analysis service is currently unavailable. Please check your backend connection.");
        } finally {
            navigate('imagesearchresults');
        }
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
        setVibeMatchDetails(null); 
        setImageSearchResult(null);
        setScreenHistory(['start']);
    };

    // --- Chatbot Logic ---
    const toggleChat = () => {
        setIsChatOpen(prev => !prev);
    };


    const contextValue = {
        isKioskMode: window.location.pathname.startsWith('/kiosk'),
        isDarkTheme,
        toggleTheme,
        currentStep,
        quizAnswers,
        outfitKeywords,
        outfitRefImageUrl,
        vibeMatchDetails, 
        cart,
        screenHistory: screenHistory[screenHistory.length - 1] || 'start',
        tryOnProduct,
        messageModal,
        recommendationOffset,
        setRecommendationOffset,
        isChatOpen,
        imageSearchResult,
        isModelLoading, 

        navigate,
        goBack,
        startQuiz,
        answerQuiz,
        startContextAnalysis,
        startImageSearch,
        addToCart,
        removeCartItem,
        getCartTotal,
        showTryOnModal,
        handleTryOnFeedback,
        startNewSession,
        showMessageModal,
        hideMessageModal,
        toggleChat,
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
