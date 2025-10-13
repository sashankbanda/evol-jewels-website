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
const MIDDLE_FINGER_MIDDLE_LANDMARK_INDEX = 10; // Stable knuckle point for rings
const HAND_WRIST_LANDMARK_INDEX = 0;    // Wrist for bracelet anchor
const RING_FINGER_TIP_LANDMARK_INDEX = 16; // User-specified ring position

// Helper to flip X coordinate for mirrored display
const flipX = (normalizedX, canvasWidth) => (1 - normalizedX) * canvasWidth;

// CRITICAL CHANGE: Accept manualAdjustment prop
const JewelryARTryOn = ({ selectedJewelry, isActive, setIsActive, manualAdjustment }) => {
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
    
    // NEW: Ref to store and access the latest adjustments inside the animation loop
    const adjustmentsRef = useRef(manualAdjustment);

    // --- EFFECT TO KEEP ADJUSTMENTS REF UPDATED ---
    useEffect(() => {
        adjustmentsRef.current = manualAdjustment;
    }, [manualAdjustment]);


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
        // GET LATEST ADJUSTMENTS HERE
        const adjustments = adjustmentsRef.current;
        
        // Base auto-calculated placement:
        const initialDrawScaleFactor = 0.08;
        const initialOffsetX = 5; 
        const initialOffsetY = 8; 

        // Apply manual adjustments from the slider:
        const finalDrawScaleFactor = initialDrawScaleFactor * adjustments.scaleFactor;
        const finalOffsetX = adjustments.offsetX; // Apply horizontal move globally
        const finalOffsetY = initialOffsetY + adjustments.offsetY;
        const rotationRadians = (adjustments.rotationAngle || 0) * (Math.PI / 180); // CRITICAL: Rotation

        const drawSingleEarring = (earIndex, sideOffsetX) => {
            const earPoint = landmarks[earIndex];
            if (!earPoint) return; // Skip drawing if landmark is missing (user turned head)

            const earDrawWidth = image.width * finalDrawScaleFactor; 
            const earDrawHeight = image.height * finalDrawScaleFactor; 
            const flippedX = flipX(earPoint.x, canvas.width);
            
            const anchorX = flippedX + finalOffsetX; // Center of rotation/translation X
            const anchorY = earPoint.y * canvas.height + finalOffsetY; // Center of rotation/translation Y
            
            ctx.save();
            ctx.translate(anchorX, anchorY); // Move origin to the anchor point
            ctx.rotate(rotationRadians); // Rotate the canvas

            // Draw the image centered on the new origin (x, y = 0, 0)
            const drawX = (sideOffsetX * initialDrawScaleFactor) - (earDrawWidth / 2);
            const drawY = -(earDrawHeight / 2); // Center vertical placement

            ctx.drawImage(image, drawX, drawY, earDrawWidth, earDrawHeight);
            
            ctx.restore(); // Restore canvas state
        };

        drawSingleEarring(LEFT_EAR_LANDMARK_INDEX, -initialOffsetX); 
        drawSingleEarring(RIGHT_EAR_LANDMARK_INDEX, initialOffsetX);
    };

    const drawNecklace = (ctx, landmarks, image, canvas) => {
        // GET LATEST ADJUSTMENTS HERE
        const adjustments = adjustmentsRef.current;

        // Base auto-calculated placement:
        const initialDrawScaleFactor = 0.3; 
        const initialOffsetY = 60; 

        // Apply manual adjustments from the slider:
        const finalDrawScaleFactor = initialDrawScaleFactor * adjustments.scaleFactor;
        const finalOffsetX = adjustments.offsetX;
        const finalOffsetY = initialOffsetY + adjustments.offsetY;
        const rotationRadians = (adjustments.rotationAngle || 0) * (Math.PI / 180); // CRITICAL: Rotation

        const normalizedPoint = landmarks[NECK_CENTER_LANDMARK_INDEX];
        const drawWidth = image.width * finalDrawScaleFactor;
        const drawHeight = image.height * finalDrawScaleFactor;
        const flippedX = flipX(normalizedPoint.x, canvas.width);
        
        const anchorX = flippedX + finalOffsetX;
        const anchorY = normalizedPoint.y * canvas.height + finalOffsetY;
        
        ctx.save();
        ctx.translate(anchorX, anchorY); // Move origin to the anchor point
        ctx.rotate(rotationRadians); // Rotate the canvas

        // Draw the image centered on the new origin
        ctx.drawImage(image, -(drawWidth / 2), -(drawHeight / 2), drawWidth, drawHeight);

        ctx.restore(); // Restore canvas state
    };

    const drawRing = (ctx, handLandmarks, image, canvas) => {
        // GET LATEST ADJUSTMENTS HERE
        const adjustments = adjustmentsRef.current;
        
        // Base auto-calculated placement:
        const initialDrawScaleFactor = 0.08; 
        const initialOffsetY = 5;
        
        // Apply manual adjustments from the slider:
        const finalDrawScaleFactor = initialDrawScaleFactor * adjustments.scaleFactor;
        const finalOffsetX = adjustments.offsetX;
        const finalOffsetY = initialOffsetY + adjustments.offsetY;
        const rotationRadians = (adjustments.rotationAngle || 0) * (Math.PI / 180); // CRITICAL: Rotation

        const normalizedPoint = handLandmarks[RING_FINGER_TIP_LANDMARK_INDEX]; 
        const drawWidth = image.width * finalDrawScaleFactor;
        const drawHeight = image.height * finalDrawScaleFactor;
        const flippedX = flipX(normalizedPoint.x, canvas.width);
        
        const anchorX = flippedX + finalOffsetX;
        const anchorY = normalizedPoint.y * canvas.height + finalOffsetY;
        
        ctx.save();
        ctx.translate(anchorX, anchorY); // Move origin to the anchor point
        ctx.rotate(rotationRadians); // Rotate the canvas
        
        // Draw the image centered on the new origin
        ctx.drawImage(image, -(drawWidth / 2), -(drawHeight / 2), drawWidth, drawHeight);
        
        ctx.restore(); // Restore canvas state
    };

    const drawBracelet = (ctx, handLandmarks, image, canvas) => {
        // GET LATEST ADJUSTMENTS HERE
        const adjustments = adjustmentsRef.current;
        
        const normalizedPoint = handLandmarks[HAND_WRIST_LANDMARK_INDEX]; // Wrist (Landmark 0)
        let drawWidth, drawHeight;

        // Apply manual adjustments to offsets:
        const finalOffsetX = adjustments.offsetX;
        const finalOffsetY = 10 + adjustments.offsetY; // 10 is base offset
        const rotationRadians = (adjustments.rotationAngle || 0) * (Math.PI / 180); // CRITICAL: Rotation

        // Dynamic scaling based on hand size (using landmarks 5 and 17)
        if (handLandmarks[5] && handLandmarks[17]) {
            const knuckleDistanceX = Math.abs(handLandmarks[5].x - handLandmarks[17].x) * canvas.width;
            const handScale = knuckleDistanceX / 100; 
            
            // Apply manual scale multiplier here
            drawWidth = image.width * handScale * 0.6 * adjustments.scaleFactor; 
            drawHeight = image.height * handScale * 0.6 * adjustments.scaleFactor;
        } else {
            // Fallback static sizing
            const drawScaleFactor = 0.35 * adjustments.scaleFactor;
            drawWidth = image.width * drawScaleFactor;
            drawHeight = image.height * drawScaleFactor;
        }

        const flippedX = flipX(normalizedPoint.x, canvas.width);
        const anchorX = flippedX + finalOffsetX;
        const anchorY = normalizedPoint.y * canvas.height + finalOffsetY;
        
        ctx.save();
        ctx.translate(anchorX, anchorY); // Move origin to the anchor point
        ctx.rotate(rotationRadians); // Rotate the canvas
        
        // Draw the image centered on the new origin
        ctx.drawImage(image, -(drawWidth / 2), -(drawHeight / 2), drawWidth, drawHeight);
        
        ctx.restore(); // Restore canvas state
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
                if (video.currentTime !== lastVideoTimeRef.current) {
                    let results = null;
                    let newDetectionStatus = "Waiting for subject...";
                    
                    results = landmarker.detectForVideo(video, performance.now());

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    drawMirroredVideo(ctx, video, canvas);
                    
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
                            newDetectionStatus = "Ensure your face is clearly visible and aligned with the camera.";
                        }
                    } else if (category === 'Ring' || category === 'Bracelet') {
                        if (results?.landmarks?.length > 0) { 
                            const handLandmarks = results.landmarks[0];
                            newDetectionStatus = "Tracking hand...";
                            
                            if (category === 'Ring') {
                                drawRing(ctx, handLandmarks, image, canvas);
                            } else {
                                drawBracelet(ctx, handLandmarks, image, canvas);
                            }
                        } else {
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
        && statusMessage.includes("Direct your camera"); 

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