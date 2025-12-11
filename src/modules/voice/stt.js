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
    console.log('🎯 Transcribing (MOCK for demo)...');
    
    // MOCK TRANSCRIPTION for hackathon demo
    // In production, this would use actual STT
    const mockTranscripts = [
        "What's around me?",
        "Read the menu to me",
        "Where is the door?",
        "Help me navigate",
        "What can you see?"
    ];
    
    // Return a random mock transcript
    const transcript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Mock Transcription:', transcript);
    console.log('⚠️ NOTE: Using mock STT for demo. In production, would use ElevenLabs STT.');
    
    return transcript;
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
