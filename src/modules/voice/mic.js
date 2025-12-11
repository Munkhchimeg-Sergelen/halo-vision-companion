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
    console.log('🔴 Starting recording...');
    
    if (!stream) {
        console.error('❌ No audio stream available. Did you initialize microphone?');
        return;
    }
    
    // Clear previous audio chunks
    audioChunks = [];
    
    // Create new MediaRecorder each time for reliability
    try {
        // Try different mime types in order of preference
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/mp4')) {
            mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
            mimeType = 'audio/webm;codecs=opus';
        }
        
        console.log('📼 Creating MediaRecorder with:', mimeType);
        mediaRecorder = new MediaRecorder(stream, { mimeType });
        
        // Set up data collection
        mediaRecorder.ondataavailable = (event) => {
            console.log('📦 Data chunk received:', event.data.size, 'bytes');
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onerror = (error) => {
            console.error('❌ MediaRecorder error:', error);
        };
        
        // Start recording
        mediaRecorder.start();
        console.log('✅ Recording started, state:', mediaRecorder.state);
        
    } catch (error) {
        console.error('❌ Failed to start recording:', error);
    }
}

/**
 * Stop recording and return audio blob
 * TODO: Stop MediaRecorder
 * TODO: Return audio data
 */
export async function stopRecording() {
    console.log('⏹️ Stopping recording...');
    
    return new Promise((resolve) => {
        if (!mediaRecorder) {
            console.warn('⚠️ MediaRecorder not initialized');
            resolve(null);
            return;
        }
        
        console.log('📊 MediaRecorder state:', mediaRecorder.state);
        
        if (mediaRecorder.state === 'inactive') {
            console.warn('⚠️ MediaRecorder already inactive');
            // Try to return whatever we have
            if (audioChunks.length > 0) {
                const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
                console.log('✅ Audio blob from chunks:', audioBlob.size, 'bytes');
                resolve(audioBlob);
            } else {
                resolve(null);
            }
            return;
        }
        
        // Set up onstop handler
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: mediaRecorder.mimeType });
            console.log('✅ Audio blob created:', audioBlob.size, 'bytes', audioBlob.type);
            resolve(audioBlob);
        };
        
        // Stop the recorder
        try {
            mediaRecorder.stop();
            console.log('✅ Stop command sent');
        } catch (error) {
            console.error('❌ Error stopping recorder:', error);
            resolve(null);
        }
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
