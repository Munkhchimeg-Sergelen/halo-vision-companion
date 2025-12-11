// Speech-to-Text using ElevenLabs
// ROLE 1: Voice Pipeline Engineer

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const STT_ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';

/**
 * Initialize STT module
 */
export async function initializeSTT() {
    console.log('🎧 Initializing STT...');
    
    // TODO: Verify API key exists
    if (!ELEVENLABS_API_KEY) {
        console.warn('⚠️ ElevenLabs API key not found');
        return false;
    }
    
    // TODO: Test connection (optional)
    console.log('✅ STT initialized');
    return true;
}

/**
 * Convert audio blob to text using ElevenLabs STT
 * @param {Blob} audioBlob - Audio data to transcribe
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioBlob) {
    console.log('🎯 Transcribing audio...');
    
    if (!audioBlob || audioBlob.size === 0) {
        console.warn('⚠️ No audio data to transcribe');
        return '';
    }
    
    try {
        console.log('📦 Audio blob type:', audioBlob.type, 'size:', audioBlob.size);
        
        // Prepare form data
        const formData = new FormData();
        // Determine file extension based on blob type
        const fileExt = audioBlob.type.includes('mp4') ? 'mp4' : 
                       audioBlob.type.includes('mpeg') ? 'mp3' : 'webm';
        formData.append('audio', audioBlob, `recording.${fileExt}`);
        
        console.log('📤 Sending to ElevenLabs STT as:', fileExt);
        
        // Send to ElevenLabs STT API
        const response = await fetch(STT_ENDPOINT, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`STT API error: ${response.status} ${response.statusText}`);
        }
        
        // Parse response
        const data = await response.json();
        const transcript = data.text || '';
        
        console.log('✅ Transcription:', transcript);
        return transcript;
        
    } catch (error) {
        handleSTTError(error);
        return '';
    }
}

/**
 * Handle STT errors
 */
function handleSTTError(error) {
    console.error('❌ STT Error:', error);
    
    if (error.message.includes('401')) {
        alert('API key error. Please check your ElevenLabs API key.');
    } else if (error.message.includes('429')) {
        alert('Rate limit exceeded. Please wait a moment and try again.');
    } else if (error.message.includes('Network')) {
        alert('Network error. Please check your internet connection.');
    } else {
        console.error('Transcription failed:', error.message);
    }
}
