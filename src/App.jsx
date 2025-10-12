// src/App.jsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useVibe, VibeProvider } from './context/VibeContext';

// Import all Screen Components
import StartScreen from './components/screens/StartScreen';
import QuizScreen from './components/screens/QuizScreen';
import ResultScreen from './components/screens/ResultScreen';
import AllProductsScreen from './components/screens/AllProductsScreen';
import CartScreen from './components/screens/CartScreen';
import LeadCaptureScreen from './components/screens/LeadCaptureScreen';
import CheckoutScreen from './components/screens/CheckoutScreen';

// Import shared components
import NavBar from './components/shared/NavBar';
import ThemeToggle from './components/shared/ThemeToggle';
import TryOnModal from './components/shared/TryOnModal';


// This component dynamically renders the current screen based on context state.
const AppContent = () => {
    const { 
        goBack, 
        navigate, 
        cart, 
        screenHistory, // This is the string ID of the current screen (e.g., 'start')
        tryOnProduct 
    } = useVibe();
    
    const currentScreenId = screenHistory;
    
    // Visibility logic for fixed navigation elements
    const screensWithNav = ['quiz', 'results', 'allproducts', 'cart'];
    const showNav = screensWithNav.includes(currentScreenId);
    const showBack = currentScreenId !== 'start' && currentScreenId !== 'loading' && currentScreenId !== 'checkout';
    
    
    // Function to render the currently active screen component
    const renderScreen = () => {
        switch (currentScreenId) {
            case 'quiz': return <QuizScreen />;
            case 'loading': 
                return (
                    // This uses inline JSX for the loading screen (spinner CSS is in index.css)
                    <div id="loadingScreen" className="screen flex-col">
                        <div className="spinner mb-6"></div>
                        <p className="text-2xl md:text-4xl font-serif font-semibold text-text-light">Matching your vibe...</p>
                        <p className="text-lg md:text-xl mt-2 text-B1B1B1 font-sans">Analyzing style cues for the perfect match.</p>
                    </div>
                );
            case 'results': return <ResultScreen />;
            case 'allproducts': return <AllProductsScreen />;
            case 'cart': return <CartScreen />;
            case 'leadcapture': return <LeadCaptureScreen />;
            case 'checkout': return <CheckoutScreen />;
            case 'start':
            default: return <StartScreen />;
        }
    };
    
    return (
        // The main container relies on min-h-screen for full height
        <div id="app" className="max-w-4xl mx-auto w-full min-h-screen relative">
            
            {/* 1. Navigation and Fixed Elements */}
            {showBack && <NavBar type="back" onClick={goBack} />}
            {showNav && <NavBar type="cart" onClick={() => navigate('cart')} cartCount={cart.length} />}
            <ThemeToggle />

            {/* 2. Render the current screen based on context */}
            {renderScreen()}

            {/* 3. Modal - Conditionally rendered, only mounts when tryOnProduct is set */}
            {tryOnProduct && <TryOnModal />}
        </div>
    );
};


// The top-level application wrapper, handling context and routing setup.
const App = () => (
    <VibeProvider>
        {/* Router is used here for compliance/structure, but navigation is handled via the context's screenHistory state array */}
        <Router> 
            <AppContent />
        </Router>
    </VibeProvider>
);

export default App;
