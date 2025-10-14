import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useVibe } from '../../context/VibeContext';
import { UploadCloud, Image, Loader2, CheckCircle } from 'lucide-react';
import ProductCard from '../shared/ProductCard';
import { productData } from '../../data/productData'; 
import { getProductById } from '../../logic/productUtils'; 

const ImageSearchScreen = () => {
    // Get necessary state and functions from context
    const { navigate, isDarkTheme, startImageSearch, imageSearchResult, goBack, screenHistory } = useVibe();
    
    // Local state for the upload process
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false); // Controls the processing/API call state
    const fileInputRef = useRef(null);
    
    // Determine the current step from global state
    const isResultsView = screenHistory === 'imagesearchresults';

    // --- File Selection and Preview Logic ---
    const handleFileChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            // Create local URL for preview
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setSelectedFile(null);
            setPreviewUrl(null);
        }
        // Reset the file input value immediately to allow re-uploading the same file
        e.target.value = null; 
    }, [previewUrl]);

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    // Cleanup object URL when component unmounts or file changes
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // --- Start AI Search ---
    const handleStartSearch = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        const reader = new FileReader();

        reader.onloadend = async () => {
            const base64Data = reader.result;
            
            try {
                // Pass the full Base64 data (including prefix) and file type to context function
                await startImageSearch(base64Data, selectedFile.type);
            } catch (err) {
                console.error("Error during image processing:", err);
            } finally {
                // The global state change (via startImageSearch's navigation) will trigger the results view
                setIsProcessing(false);
            }
        };

        reader.onerror = (error) => {
            console.error("FileReader error: ", error);
            setIsProcessing(false);
        };
        
        // Read the file as a data URL (Base64)
        reader.readAsDataURL(selectedFile);
    };

    // --- Rendering Logic ---

    // 1. Upload/Loading State (when not in results view)
    if (!isResultsView) {
        
        const title = isProcessing ? "Analyzing Image..." : "Find Your Look by Photo";
        const subtitle = isProcessing 
            ? "Comparing aesthetic features against our entire product line, just a moment."
            : "Upload a photo of any jewelry piece to find the closest matches in our collection.";

        return (
            <div id="imageSearchScreen" className="screen flex-col">
                <div className="w-full max-w-2xl mx-auto card-bg p-8 rounded-2xl shadow-xl">
                    <h2 className="text-4xl md:text-5xl font-serif font-semibold text-text-light mb-4 text-center">{title}</h2>
                    <p className="text-xl font-sans mb-8 text-B1B1B1 text-center">{subtitle}</p>

                    {/* Image Upload Area */}
                    <div 
                        className={`border-2 border-dashed ${isDarkTheme ? 'border-DAD5C1/50' : 'border-gray-400'} rounded-xl p-8 mb-8 flex flex-col items-center justify-center relative min-h-[250px] ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
                        onClick={!selectedFile ? triggerFileUpload : undefined}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/jpeg,image/png"
                            className="hidden"
                            disabled={isProcessing}
                        />

                        {previewUrl && !isProcessing ? (
                            <img src={previewUrl} alt="Preview" className="max-h-[200px] w-auto object-contain rounded-lg shadow-lg border border-B1B1B1/30" />
                        ) : isProcessing ? (
                             <div className="flex flex-col items-center justify-center p-4">
                                <Loader2 size={36} className="animate-spin text-accent-platinum mb-4" />
                                <p className="text-text-light font-sans mt-2">Processing...</p>
                            </div>
                        ) : (
                            <div className='text-center text-B1B1B1'>
                                <UploadCloud size={48} className="text-DAD5C1 mx-auto mb-2" />
                                <p className='font-sans'>Tap to select an image file.</p>
                            </div>
                        )}
                        
                        {!isProcessing && (
                            <button
                                onClick={selectedFile ? triggerFileUpload : handleStartSearch}
                                className={`mt-4 px-6 py-2 text-lg font-sans rounded-lg shadow-md ${selectedFile ? 'secondary-cta' : 'primary-cta'}`}
                            >
                                {selectedFile ? 'Change Photo' : 'Upload Photo'}
                            </button>
                        )}
                    </div>
                    
                    {/* Action Button */}
                    <button
                        onClick={handleStartSearch}
                        disabled={!selectedFile || isProcessing}
                        className={`w-full py-4 text-xl font-sans rounded-xl shadow-lg primary-cta flex items-center justify-center gap-2 ${(!selectedFile || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 size={24} className="animate-spin" /> Matching...
                            </>
                        ) : (
                            <>
                                <Image size={24} /> Find Matches
                            </>
                        )}
                    </button>
                    
                    <button
                        onClick={goBack}
                        className="mt-4 w-full py-2 text-sm font-sans secondary-cta"
                    >
                        &larr; Back to Last Screen
                    </button>
                </div>
            </div>
        );
    }

    // 2. Results State (isResultsView is true)

    // Filter product data based on the returned IDs and map to components
    const matchedProducts = (imageSearchResult || [])
        .map(id => getProductById(id))
        .filter(product => product); // Filter out null/undefined results

    return (
        <div id="imageSearchResultsScreen" className="screen flex-col flex pt-24">
            <div className="w-full max-w-6xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                    <CheckCircle size={36} className="text-0E5C4E mr-3" />
                    <h2 className="text-4xl md:text-5xl font-serif font-bold text-text-light text-center">
                        Top Matches Found!
                    </h2>
                </div>
                <p className="text-xl font-sans font-medium mb-8 text-B1B1B1 text-center">
                    Based on your uploaded photo, here are the closest pieces from our collection:
                </p>

                {matchedProducts.length > 0 ? (
                    <div id="matchProductGrid" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full">
                        {matchedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 card-bg rounded-xl shadow-lg">
                        <p className="text-2xl font-sans text-B1B1B1">
                            Hmm, we couldn't find a direct match. Try browsing our full selection or adjusting your photo!
                        </p>
                    </div>
                )}
                
                {/* Action buttons */}
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 max-w-xl mx-auto mt-10">
                     <button
                        onClick={goBack}
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg secondary-cta"
                    >
                        &larr; Back to Vibe Match
                    </button>
                    <button 
                        onClick={() => navigate('imagesearch')}
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg secondary-cta"
                    >
                        Try Another Photo
                    </button>
                    <button 
                        onClick={() => navigate('allproducts')}
                        className="flex-1 py-4 text-xl font-sans rounded-xl shadow-lg primary-cta"
                    >
                        Browse All Products
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ImageSearchScreen;
