import React, { useState, useRef, useEffect } from 'react';
import { Camera, Sparkles, X } from 'lucide-react';

const JewelryARTryOn = ({ selectedJewelry, isActive, setIsActive }) => {
    // Note: The parent component (TryOnModal) handles isActive toggling 
    // for the entire modal, so we'll treat the prop as the source of truth.
    // The camera will manage its own ready state internally.
    const [isCameraReady, setIsCameraReady] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

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

    // Effect to start drawing when the camera is ready and jewelry is selected
    useEffect(() => {
        if (isActive && isCameraReady && selectedJewelry) {
            drawJewelry();
        }
    }, [isActive, isCameraReady, selectedJewelry]);

    const startCamera = async () => {
        if (streamRef.current) return; // Prevent multiple streams

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
                // Ensure video starts playing when stream is set
                await videoRef.current.play();
            }
        } catch (err) {
            console.error('Camera access error:', err);
            // Alert user and set active state to false if camera access fails
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

    const drawJewelry = () => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video || video.paused) return;

        const ctx = canvas.getContext('2d');
        // Match canvas size to video size
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;

        const animate = () => {
            // Check main activity and selection status before drawing
            if (!isActive || !selectedJewelry) return;

            // 1. Draw the video frame
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 2. Determine jewelry position (fixed, since there's no tracking library)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // 3. Draw the appropriate jewelry type
            if (selectedJewelry.category === 'Ring') {
                // Approximate finger position
                drawRing(ctx, centerX + 100, centerY + 120, selectedJewelry.color || '#FFD700'); 
            } else if (selectedJewelry.category === 'Necklace' || selectedJewelry.category === 'Pendant') {
                // Approximate neck position
                drawNecklace(ctx, centerX, centerY - 80, selectedJewelry.color || '#F8F8FF');
            } else if (selectedJewelry.category === 'Earring') {
                // Approximate ear positions
                drawEarrings(ctx, centerX, centerY - 60, selectedJewelry.color || '#50C878');
            }

            requestAnimationFrame(animate);
        };

        animate();
    };

    // --- Drawing functions (simplified from original code for stability) ---
    const drawRing = (ctx, x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(x, y, 25, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - 10, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const drawNecklace = (ctx, x, y, color) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // Simple V-shape chain
        ctx.moveTo(x - 50, y);
        ctx.lineTo(x, y + 60);
        ctx.lineTo(x + 50, y);
        ctx.stroke();

        // Pendant
        ctx.beginPath();
        ctx.arc(x, y + 60, 8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    };

    const drawEarrings = (ctx, x, y, color) => {
        // Left earring
        drawSingleEarring(ctx, x - 60, y, color);
        // Right earring
        drawSingleEarring(ctx, x + 60, y, color);
    };

    const drawSingleEarring = (ctx, x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y + 15, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
    };
    // -------------------------------------------------------------------


    const showCameraPlaceholder = !isActive || !isCameraReady;
    
    return (
        <div className="w-full h-full relative">
            {/* The hidden video element captures the camera stream */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
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
                            isCameraReady ? "Waiting for jewelry selection..." : "Requesting camera access..."
                        ) : "Click 'Start Try-On' to activate camera."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default JewelryARTryOn;