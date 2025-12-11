// Speech-to-Text using Browser API (Fallback from ElevenLabs due to format issues)
// ROLE 1: Voice Pipeline Engineer

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const STT_ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';

// Browser Speech Recognition
let recognition = null;
let isListening = false;

/**
 * Initialize STT module
 */
export async function initializeSTT() {
    console.log('🎧 Initializing STT...');
    
    // Try to use browser Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        console.log('✅ Browser Speech Recognition available');
    } else {
        console.warn('⚠️ Browser Speech Recognition not supported');
    }
    
    console.log('✅ STT initialized');
    return true;
}

/**
 * Transcribe audio using Browser Speech Recognition
 * NOTE: Browser API doesn't use audio blob - it listens in real-time
 * The blob parameter is kept for compatibility but not used
 * @param {Blob} audioBlob - (Not used - kept for compatibility)
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioBlob) {
    console.log('🎯 Transcribing with Browser Speech Recognition...');
    
    if (!recognition) {
        console.error('❌ Speech Recognition not available');
        return '';
    }
    
    return new Promise((resolve) => {
        let finalTranscript = '';
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            finalTranscript = transcript;
            console.log('✅ Transcription:', transcript);
        };
        
        recognition.onend = () => {
            isListening = false;
            resolve(finalTranscript);
        };
        
        recognition.onerror = (event) => {
            console.error('❌ Speech recognition error:', event.error);
            isListening = false;
            resolve('');
        };
        
        // Timeout after 10 seconds
        setTimeout(() => {
            if (isListening) {
                recognition.stop();
            }
        }, 10000);
        
        try {
            recognition.start();
            isListening = true;
            console.log('🎤 Browser STT listening...');
        } catch (error) {
            console.error('❌ Failed to start recognition:', error);
            resolve('');
        }
    });
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
