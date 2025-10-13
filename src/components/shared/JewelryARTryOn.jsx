import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
// We don't need Sparkles anymore, removed it.

// Helper function to load the correct image path
// The path pattern is public/media_bgr/image[id].png
const getImagePath = (id) => `/media_bgr/image${id}.png`;


const JewelryARTryOn = ({ selectedJewelry, isActive, setIsActive }) => {
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [jewelryImage, setJewelryImage] = useState(null); // NEW: State to hold the loaded image object
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // Effect to load the image based on selectedJewelry.id
    useEffect(() => {
        if (selectedJewelry && selectedJewelry.id) {
            const img = new Image();
            img.onload = () => {
                setJewelryImage(img);
            };
            img.onerror = () => {
                console.error(`Failed to load jewelry image for ID: ${selectedJewelry.id}`);
                setJewelryImage(null); // Clear image on load error
            };
            // Set the source using the ID and the new path helper
            img.src = getImagePath(selectedJewelry.id); 
        } else {
            setJewelryImage(null); // Clear image if no product is selected
        }
    }, [selectedJewelry]); // Re-run whenever a new product is selected

    // Effect to start/stop the camera based on the parent's isActive prop
    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            stopCamera();
        }
        // Cleanup function to stop camera when component unmounts
        return () => stopCamera();
    }, [isActive]);

    // Effect to start drawing when the camera is ready and jewelry is loaded
    // Changed dependency to jewelryImage instead of selectedJewelry
    useEffect(() => {
        // Only start drawing if the camera is active, ready, AND the specific image is loaded
        if (isActive && isCameraReady && jewelryImage) { 
            drawJewelry();
        }
        // NOTE: The drawJewelry function will call requestAnimationFrame recursively, 
        // which will continue until isActive, isCameraReady, or jewelryImage becomes false/null.
        // We don't need to return a cleanup function here for animation frame because the animate 
        // loop checks the state on every frame.
    }, [isActive, isCameraReady, jewelryImage]); // Dependency change

    const startCamera = async () => {
        if (streamRef.current) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraReady(true);
                };
                await videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera access error:', err);
            alert('Unable to access camera. Please grant camera permissions.');
            setIsActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraReady(false);
    };

    // MODIFIED: This function now uses the loaded jewelryImage to draw
    const drawJewelry = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const image = jewelryImage; // Use the image from state
        
        // CRITICAL CHECK: Ensure all resources are available before drawing
        if (!canvas || !video || video.paused || !image || !isActive) return;

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        // Using a global ID for the animation frame to allow stopping the loop
        let animationFrameId;

        const animate = () => {
            // Re-check state at the start of each frame
            if (!isActive || !image) {
                // If try-on is stopped or image is gone, clear the animation frame and stop.
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                return;
            }

            // 1. Draw the video frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw mirrored image to match user expectation (as seen in the image you provided)
            ctx.save();
            ctx.scale(-1, 1); // Flip horizontally
            ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
            ctx.restore();

            // 2. Determine jewelry position based on category
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const category = selectedJewelry.category === 'Pendant' ? 'Necklace' : selectedJewelry.category;
            
            // Image placement logic (You will need to adjust these offsets and sizes 
            // to match your actual images and face landmarks)
            let drawX = 0;
            let drawY = 0;
            let drawWidth = image.width * 0.5; // Scaling factor
            let drawHeight = image.height * 0.5; // Scaling factor

            switch (category) {
                case 'Necklace':
                    // Center just below the chin/neck area
                    drawX = centerX - drawWidth / 2;
                    drawY = centerY + 10;
                    break;
                case 'Earring':
                    // For now, center in the middle (you'd need face detection for proper placement)
                    // The drawing will be a placeholder until face landmarks are integrated.
                    drawX = centerX - drawWidth / 2;
                    drawY = centerY - drawHeight / 2;
                    drawWidth = image.width * 0.3; // Smaller for earrings
                    drawHeight = image.height * 0.3;
                    break;
                case 'Ring':
                    // Approximate hand/ring position (far from the face)
                    drawX = centerX + 100;
                    drawY = centerY + 100;
                    drawWidth = image.width * 0.2; // Very small for a ring
                    drawHeight = image.height * 0.2;
                    break;
                default:
                    // Default to center if category is unknown
                    drawX = centerX - drawWidth / 2;
                    drawY = centerY - drawHeight / 2;
            }

            // 3. Draw the loaded image asset
            ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);

            // 4. Request the next frame
            animationFrameId = requestAnimationFrame(animate);
        };
        
        // Start the animation loop
        animate();
    };
    // Removed the unused drawRing, drawNecklace, drawEarrings, drawSingleEarring functions.
    // -------------------------------------------------------------------


    const showCameraPlaceholder = !isActive || !isCameraReady || !jewelryImage;

    return (
        <div className="w-full h-full relative">
            {/* The hidden video element captures the camera stream */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                // The style is changed to mirror the video stream before it's drawn to canvas
                style={{ display: 'none' }} 
            />
            {/* The canvas overlays the video and draws the jewelry */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
            
            {/* Placeholder for when the camera is off */}
            {showCameraPlaceholder && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-light/50 bg-111111/50 rounded-xl">
                    <Camera size={48} className="mb-4" />
                    <p className="font-sans font-semibold">
                        {isActive ? (
                            // Updated status based on image loading
                            jewelryImage ? "Starting Try-On..." : "Loading image and camera..."
                        ) : "Click 'Start Try-On View' to activate camera."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default JewelryARTryOn;