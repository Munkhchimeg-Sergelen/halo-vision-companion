// Microphone capture module
// ROLE 1: Voice Pipeline Engineer

let mediaRecorder = null;
let audioChunks = [];
let stream = null;

/**
 * Initialize microphone access
 * TODO: Request microphone permissions
 * TODO: Set up MediaRecorder
 */
export async function initializeMicrophone() {
    console.log('🎤 Initializing microphone...');
    
    try {
        // Request microphone access
        stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            } 
        });
        
        console.log('✅ Microphone initialized');
        return true;
    } catch (error) {
        console.error('❌ Microphone initialization failed:', error);
        if (error.name === 'NotAllowedError') {
            alert('Please allow microphone access to use Halo!');
        }
        return false;
    }
}

/**
 * Start recording audio
 * TODO: Start MediaRecorder
 * TODO: Collect audio chunks
 */
export async function startRecording() {
    console.log('🔴 Recording started');
    
    // Clear previous audio chunks
    audioChunks = [];
    
    // Create MediaRecorder if not exists
    if (!mediaRecorder && stream) {
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });
        
        // Set up data collection
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
    }
    
    // Start recording
    if (mediaRecorder && mediaRecorder.state !== 'recording') {
        mediaRecorder.start();
    }
}

/**
 * Stop recording and return audio blob
 * TODO: Stop MediaRecorder
 * TODO: Return audio data
 */
export async function stopRecording() {
    console.log('⏹️ Recording stopped');
    
    return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state !== 'recording') {
            console.warn('⚠️ MediaRecorder not recording');
            resolve(null);
            return;
        }
        
        // Set up onstop handler
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            console.log('✅ Audio blob created:', audioBlob.size, 'bytes');
            resolve(audioBlob);
        };
        
        // Stop the recorder
        mediaRecorder.stop();
    });
}

/**
 * Get audio blob for processing
 */
export function getAudioBlob() {
    // TODO: Convert audioChunks to blob
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    return blob;
}

/**
 * Clean up resources
 */
export function cleanup() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
}
