// Speech-to-Text using ElevenLabs API
// ROLE 1: Voice Pipeline Engineer

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const STT_ENDPOINT = 'https://api.elevenlabs.io/v1/speech-to-text';

/**
 * Initialize STT module
 */
export async function initializeSTT() {
    console.log('🎧 Initializing STT...');
    
    if (!ELEVENLABS_API_KEY) {
        console.warn('⚠️ ElevenLabs API key not found');
        return false;
    }
    
    console.log('✅ ElevenLabs STT initialized');
    return true;
}

/**
 * Start live speech recognition (placeholder - we use recorded audio)
 * @param {Function} callback - Called with interim transcripts
 */
export async function startLiveSTT(callback) {
    console.log('🎤 Recording started for STT...');
    // Recording is handled by mic.js
}

/**
 * Stop live speech recognition and get final transcript
 * This is called after recording stops - we transcribe the recorded audio
 * @returns {Promise<string>} Final transcript
 */
export async function stopLiveSTT() {
    // This will be called but actual transcription happens via transcribeAudio
    console.log('⏹️ Recording stopped, ready for transcription');
    return '';
}

/**
 * Transcribe audio blob using ElevenLabs STT API
 * @param {Blob} audioBlob - Audio data to transcribe
 * @returns {Promise<string>} Transcribed text
 */
export async function transcribeAudio(audioBlob) {
    console.log('🎯 Transcribing audio with ElevenLabs...');
    
    if (!audioBlob || audioBlob.size === 0) {
        console.warn('⚠️ No audio data to transcribe');
        return '';
    }
    
    console.log('📦 Audio blob type:', audioBlob.type, 'size:', audioBlob.size);
    
    try {
        const formData = new FormData();
        
        // ElevenLabs accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm
        // Determine the best filename based on MIME type
        let filename = 'audio.webm';
        if (audioBlob.type.includes('mp4')) {
            filename = 'audio.mp4';
        } else if (audioBlob.type.includes('webm')) {
            filename = 'audio.webm';
        } else if (audioBlob.type.includes('wav')) {
            filename = 'audio.wav';
        }
        
        formData.append('file', audioBlob, filename);
        formData.append('model_id', 'scribe_v1');
        
        console.log('📤 Sending to ElevenLabs STT as:', filename);
        
        const response = await fetch(STT_ENDPOINT, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ STT API error response:', errorText);
            throw new Error(`STT API error: ${response.status}`);
        }
        
        const data = await response.json();
        const transcript = data.text || '';
        
        console.log('✅ Transcription:', transcript);
        return transcript;
        
    } catch (error) {
        console.error('❌ STT Error:', error);
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
