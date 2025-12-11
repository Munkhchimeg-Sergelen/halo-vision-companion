// Camera capture module
// ROLE 2: Vision & Scene Understanding Engineer

let stream = null;
let videoElement = null;
let canvasElement = null;

/**
 * Initialize camera access
 */
export async function initializeCamera() {
    console.log('📷 Initializing camera...');
    
    try {
        videoElement = document.getElementById('camera');
        canvasElement = document.getElementById('canvas');
        
        // Request camera permissions
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'environment' // Use back camera on mobile
            } 
        });
        
        // Attach stream to video element
        videoElement.srcObject = stream;
        await videoElement.play();
        
        console.log('✅ Camera initialized');
        return true;
    } catch (error) {
        console.error('❌ Camera initialization failed:', error);
        return false;
    }
}

/**
 * Capture current frame from camera
 * @returns {Promise<string>} Base64 encoded image
 */
export async function captureFrame() {
    console.log('📸 Capturing frame...');
    
    try {
        if (!videoElement || !canvasElement) {
            console.error('❌ Video or canvas element not found');
            return null;
        }
        
        // Get canvas context
        const context = canvasElement.getContext('2d');
        
        // Set canvas dimensions to match video
        canvasElement.width = videoElement.videoWidth || 1280;
        canvasElement.height = videoElement.videoHeight || 720;
        
        // Draw video frame to canvas
        context.drawImage(videoElement, 0, 0);
        
        // Convert to base64
        const base64Image = canvasElement.toDataURL('image/jpeg', 0.8);
        
        // Return image data (remove data:image/jpeg;base64, prefix)
        const base64Data = base64Image.split(',')[1];
        
        console.log('✅ Frame captured');
        return base64Data;
        
    } catch (error) {
        console.error('❌ Frame capture failed:', error);
        return null;
    }
}

/**
 * Stop camera stream
 */
export function stopCamera() {
    console.log('🛑 Stopping camera...');
    
    // TODO: Stop all tracks
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    // TODO: Clear video element
    if (videoElement) {
        videoElement.srcObject = null;
    }
}

/**
 * Check if camera is active
 */
export function isCameraActive() {
    return stream !== null && stream.active;
}

/**
 * Ensure camera is playing (for preview)
 */
export async function ensureCameraPlaying() {
    console.log('🎥 ensureCameraPlaying - videoElement:', videoElement);
    console.log('🎥 ensureCameraPlaying - stream:', stream);
    console.log('🎥 ensureCameraPlaying - stream active:', stream?.active);
    
    if (videoElement && stream) {
        try {
            console.log('🎥 Video element paused:', videoElement.paused);
            console.log('🎥 Video element srcObject:', videoElement.srcObject);
            console.log('🎥 Video element readyState:', videoElement.readyState);
            
            if (videoElement.paused) {
                console.log('🎥 Attempting to play video...');
                await videoElement.play();
                console.log('🎥 Video playing!');
            }
            return true;
        } catch (error) {
            console.error('❌ Failed to play camera:', error);
            return false;
        }
    }
    console.error('❌ Video element or stream not available');
    return false;
}
