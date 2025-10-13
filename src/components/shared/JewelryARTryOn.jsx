import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Hand } from 'lucide-react';
import { 
    FaceLandmarker, 
    HandLandmarker, 
    FilesetResolver, 
} from '@mediapipe/tasks-vision';

// Helper functions and constants
const getImagePath = (id) => `/media_bgr/image${id}.png`;
const FACE_MODEL_PATH = '/models/face_landmarker.task'; 
const HAND_MODEL_PATH = '/models/hand_landmarker.task'; 

// Landmark indices
const NECK_CENTER_LANDMARK_INDEX = 152; 
const LEFT_EAR_LANDMARK_INDEX = 132;   
const RIGHT_EAR_LANDMARK_INDEX = 361;  
const RING_FINGER_TIP_LANDMARK_INDEX = 16; 

// Helper to flip X coordinate for mirrored display
const flipX = (normalizedX, canvasWidth) => (1 - normalizedX) * canvasWidth;

const JewelryARTryOn = ({ selectedJewelry, isActive, setIsActive }) => {
    const [isCameraReady, setIsCameraReady] = useState(false);
    const [jewelryImage, setJewelryImage] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [detectionStatus, setDetectionStatus] = useState("Waiting for detection...");
    
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const landmarkerRef = useRef(null); 
    const animationFrameId = useRef(null); 
    const lastVideoTimeRef = useRef(-1);

    // Get model configuration based on category
    const getModelConfig = useCallback((category) => {
        if (category === 'Ring' || category === 'Bracelet') {
            return { path: HAND_MODEL_PATH, Class: HandLandmarker, type: 'hand' };
        }
        if (category === 'Necklace' || category === 'Pendant' || category === 'Earring') {
            return { path: FACE_MODEL_PATH, Class: FaceLandmarker, type: 'face' };
        }
        return null;
    }, []);

    // Normalize category (Pendant -> Necklace)
    const getCategory = useCallback(() => {
        return selectedJewelry?.category === 'Pendant' ? 'Necklace' : selectedJewelry?.category;
    }, [selectedJewelry?.category]);

    // --- MODEL LOADING EFFECT (Conditional) ---
    useEffect(() => {
        const category = getCategory();
        const modelConfig = getModelConfig(category);

        if (!modelConfig) {
            setIsModelLoading(false);
            setDetectionStatus("Ready for try-on!");
            return;
        }

        const loadLandmarker = async () => {
            // Cleanup old model
            if (landmarkerRef.current) {
                try {
                    landmarkerRef.current.close();
                } catch (err) {
                    console.warn('Error closing previous landmarker:', err);
                }
                landmarkerRef.current = null;
            }

            setIsModelLoading(true);
            setDetectionStatus(`Loading ${category} AR model...`);

            try {
                const filesetResolver = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm" 
                );
                
                const landmarker = await modelConfig.Class.createFromOptions(filesetResolver, {
                    baseOptions: {
                        modelAssetPath: modelConfig.path,
                        delegate: "GPU"
                    },
                    runningMode: 'VIDEO',
                    // Set specific options for the model
                    ...(modelConfig.type === 'face' ? { numFaces: 1 } : { numHands: 2 })
                });
                
                landmarkerRef.current = landmarker;
                setIsModelLoading(false);
                setDetectionStatus("AR Model loaded. Start tracking.");
                
            } catch (err) {
                console.error(`Failed to load ${category} Landmarker:`, err); 
                setIsModelLoading(false);
                setDetectionStatus(`Error loading model for ${category}.`);
            }
        };

        loadLandmarker();

        return () => {
            if (landmarkerRef.current) {
                try {
                    landmarkerRef.current.close();
                } catch (err) {
                    console.warn('Error closing landmarker on cleanup:', err);
                }
                landmarkerRef.current = null;
            }
        };
    }, [selectedJewelry?.category, getCategory, getModelConfig]);

    // --- IMAGE LOADING ---
    useEffect(() => {
        if (selectedJewelry?.id) {
            const img = new Image();
            img.onload = () => setJewelryImage(img);
            img.onerror = () => {
                console.error(`Failed to load jewelry image for ID: ${selectedJewelry.id}`);
                setJewelryImage(null);
            };
            img.src = getImagePath(selectedJewelry.id);

            return () => {
                img.onload = null;
                img.onerror = null;
            };
        } else {
            setJewelryImage(null);
        }
    }, [selectedJewelry?.id]);

    // --- CAMERA START/STOP ---
    useEffect(() => {
        if (isActive && !isModelLoading) {
            startCamera();
        } else {
            stopCamera();
        }

        return () => {
            stopCamera();
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
                animationFrameId.current = null;
            }
        };
    }, [isActive, isModelLoading]);

    const startCamera = async () => {
        if (streamRef.current) return;
        
        const category = getCategory();
        const modelConfig = getModelConfig(category);
        
        if (!landmarkerRef.current && modelConfig) { 
            console.error("Landmarker not initialized. Waiting for model to load."); 
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraReady(true);
                    if (jewelryImage && landmarkerRef.current) {
                        startARLoop();
                    }
                };
                await videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera access error:', err);
            alert('Unable to access camera. Please check permissions.');
            setIsActive(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraReady(false);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
            animationFrameId.current = null;
        }
    };

    // --- DRAWING FUNCTIONS ---
    const drawMirroredVideo = (ctx, video, canvas) => {
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();
    };

    const drawEarrings = (ctx, landmarks, image, canvas) => {
        const earringOffsetX = 5; 
        const earringOffsetY = 8; 
        const drawScaleFactor = 0.08;

        const drawSingleEarring = (earIndex, sideOffsetX) => {
            const earPoint = landmarks[earIndex];
            const earDrawWidth = image.width * drawScaleFactor; 
            const earDrawHeight = image.height * drawScaleFactor; 
            const flippedX = flipX(earPoint.x, canvas.width);
            const finalDrawX = flippedX - (earDrawWidth / 2) + sideOffsetX;
            const finalDrawY = earPoint.y * canvas.height - (earDrawHeight / 2) + earringOffsetY;
            ctx.drawImage(image, finalDrawX, finalDrawY, earDrawWidth, earDrawHeight);
        };

        drawSingleEarring(LEFT_EAR_LANDMARK_INDEX, -earringOffsetX); 
        drawSingleEarring(RIGHT_EAR_LANDMARK_INDEX, earringOffsetX);
    };

    const drawNecklace = (ctx, landmarks, image, canvas) => {
        const drawScaleFactor = 0.3; 
        const offsetY = 60; 
        const normalizedPoint = landmarks[NECK_CENTER_LANDMARK_INDEX];
        const drawWidth = image.width * drawScaleFactor;
        const drawHeight = image.height * drawScaleFactor;
        const flippedX = flipX(normalizedPoint.x, canvas.width);
        const drawX = flippedX - (drawWidth / 2);
        const drawY = normalizedPoint.y * canvas.height - (drawHeight / 2) + offsetY;
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    const drawRing = (ctx, handLandmarks, image, canvas) => {
        const normalizedPoint = handLandmarks[RING_FINGER_TIP_LANDMARK_INDEX]; 
        const drawScaleFactor = 0.08; 
        const offsetY = 5;
        
        const drawWidth = image.width * drawScaleFactor;
        const drawHeight = image.height * drawScaleFactor;
        const flippedX = flipX(normalizedPoint.x, canvas.width);
        const drawX = flippedX - (drawWidth / 2);
        const drawY = normalizedPoint.y * canvas.height - (drawHeight / 2) + offsetY;
        
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    const drawBracelet = (ctx, handLandmarks, image, canvas) => {
        const normalizedPoint = handLandmarks[0]; // Wrist
        let drawWidth, drawHeight, drawX, drawY;
        const offsetY = 10;
        
        // Dynamic scaling based on hand size (using landmarks 5 and 17)
        if (handLandmarks[5] && handLandmarks[17]) {
            const knuckleDistanceX = Math.abs(handLandmarks[5].x - handLandmarks[17].x) * canvas.width;
            const handScale = knuckleDistanceX / 100; 
            
            drawWidth = image.width * handScale * 0.6; 
            drawHeight = image.height * handScale * 0.6;
            
            const flippedX = flipX(normalizedPoint.x, canvas.width);
            drawX = flippedX - (drawWidth / 2); 
            drawY = normalizedPoint.y * canvas.height - (drawHeight / 2) + offsetY;
        } else {
            // Fallback static sizing
            const drawScaleFactor = 0.35;
            drawWidth = image.width * drawScaleFactor;
            drawHeight = image.height * drawScaleFactor;
            
            const flippedX = flipX(normalizedPoint.x, canvas.width);
            drawX = flippedX - (drawWidth / 2);
            drawY = normalizedPoint.y * canvas.height - (drawHeight / 2) + offsetY;
        }
        
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    // --- CORE AR DETECTION LOOP ---
    const startARLoop = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const image = jewelryImage;
        const landmarker = landmarkerRef.current;
        const category = getCategory();

        if (!video || !canvas || !image || !landmarker || video.paused || !isActive) return;

        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const detectAndDraw = () => {
            if (!isActive || !image || !landmarker) {
                animationFrameId.current = null;
                return;
            }

            try {
                // Only process new video frames
                if (video.currentTime !== lastVideoTimeRef.current) {
                    let results = null;
                    let newDetectionStatus = "Waiting for subject...";
                    
                    // Run detection
                    results = landmarker.detectForVideo(video, performance.now());

                    // Clear and draw video frame
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawMirroredVideo(ctx, video, canvas);
                    
                    // Draw jewelry based on detection results
                    if (category === 'Necklace' || category === 'Earring') {
                        if (results?.faceLandmarks?.length > 0) {
                            const landmarks = results.faceLandmarks[0];
                            newDetectionStatus = "Tracking face...";
                            
                            if (category === 'Earring') {
                                drawEarrings(ctx, landmarks, image, canvas);
                            } else {
                                drawNecklace(ctx, landmarks, image, canvas);
                            }
                        } else {
                            // NEW: Specific Guidance Message
                            newDetectionStatus = "Ensure your face is clearly visible and aligned with the camera.";
                        }
                    } else if (category === 'Ring' || category === 'Bracelet') {
                        // Using 'landmarks' for single HandLandmarker results
                        if (results?.landmarks?.length > 0) { 
                            const handLandmarks = results.landmarks[0];
                            newDetectionStatus = "Tracking hand...";
                            
                            if (category === 'Ring') {
                                drawRing(ctx, handLandmarks, image, canvas);
                            } else {
                                drawBracelet(ctx, handLandmarks, image, canvas);
                            }
                        } else {
                            // NEW: Specific Guidance Message
                            newDetectionStatus = "Direct your camera to capture your wrist and the back of your hand for a virtual fitting.";
                        }
                    }

                    setDetectionStatus(newDetectionStatus);
                    lastVideoTimeRef.current = video.currentTime;
                }
            } catch (err) {
                console.error('Error in AR loop:', err);
                setDetectionStatus("Error during tracking. Restarting...");
            }

            animationFrameId.current = requestAnimationFrame(detectAndDraw);
        };

        detectAndDraw();
    };

    // UI state
    const showCameraPlaceholder = !isActive || !isCameraReady || isModelLoading || !jewelryImage;

    let statusMessage = "Loading AR Models...";
    if (!isModelLoading) {
        if (!isActive) {
            statusMessage = "Click 'Start Try-On View' to activate camera.";
        } else if (!isCameraReady) {
            statusMessage = "Requesting camera access...";
        } else if (!jewelryImage) {
            statusMessage = "Waiting for jewelry image to load...";
        } else {
            statusMessage = detectionStatus; 
        }
    }

    const showHandIcon = (selectedJewelry?.category === 'Ring' || selectedJewelry?.category === 'Bracelet') 
        && statusMessage.includes("Direct your camera"); // Check for the specific hand failure message

    return (
        <div className="w-full h-full relative">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
                style={{ display: 'none' }}
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover rounded-xl"
            />
            
            <div 
                className="absolute inset-0 flex flex-col items-center justify-center text-text-light/50 bg-111111/50 rounded-xl"
                // Hide overlay only when camera and model are ready
                style={{ display: (isCameraReady && !isModelLoading) ? 'none' : 'flex' }}
            >
                {showHandIcon ? (
                    <Hand size={48} className="mb-4 text-DAD5C1" />
                ) : (
                    <Camera size={48} className="mb-4 text-DAD5C1" />
                )}

                <p className="font-sans font-semibold text-white/90 p-4 rounded-lg bg-black/50">
                    {statusMessage}
                </p>
            </div>
        </div>
    );
};

export default JewelryARTryOn;