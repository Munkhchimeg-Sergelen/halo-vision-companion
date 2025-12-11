// Text-to-Speech using ElevenLabs
// ROLE 1: Voice Pipeline Engineer

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default: Adam voice
const TTS_ENDPOINT = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

let currentAudio = null;

/**
 * Initialize TTS module
 */
export async function initializeTTS() {
    console.log('🔊 Initializing TTS...');
    
    // Verify API key
    if (!ELEVENLABS_API_KEY) {
        console.warn('⚠️ ElevenLabs API key not found');
        return false;
    }
    
    console.log('✅ TTS initialized with voice:', VOICE_ID.slice(0, 8) + '...');
    return true;
}

/**
 * Convert text to speech and play it
 * @param {string} text - Text to convert to speech
 */
export async function speak(text) {
    if (!text || text.trim().length === 0) {
        console.warn('⚠️ No text to speak');
        return;
    }
    
    console.log('🗣️ Speaking:', text.substring(0, 50) + '...');
    
    try {
        // Stop any current speech
        stopSpeaking();
        
        // Send text to ElevenLabs TTS API
        const response = await fetch(TTS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
        }
        
        // Get audio blob
        const audioBlob = await response.blob();
        
        // Play audio
        await playAudio(audioBlob);
        
        console.log('✅ Speech completed');
        
    } catch (error) {
        console.error('❌ TTS Error:', error);
        if (error.message.includes('401')) {
            alert('API key error. Please check your ElevenLabs API key.');
        } else if (error.message.includes('429')) {
            alert('Rate limit exceeded. Please wait a moment.');
        }
        throw error;
    }
}

/**
 * Stop current speech
 */
export function stopSpeaking() {
    console.log('🔇 Stopping speech...');
    
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

/**
 * Play audio buffer
 * @param {ArrayBuffer} audioData - Audio data to play
 */
async function playAudio(audioBlob) {
    return new Promise((resolve, reject) => {
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        
        currentAudio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            resolve();
        };
        
        currentAudio.onerror = (error) => {
            URL.revokeObjectURL(audioUrl);
            currentAudio = null;
            reject(error);
        };
        
        currentAudio.play().catch(reject);
    });
}
