// Speech-to-Text using Browser Web Speech API (Real-time)
// ROLE 1: Voice Pipeline Engineer

// Browser Speech Recognition
let recognition = null;
let isListening = false;
let currentTranscript = '';
let onTranscriptCallback = null;

/**
 * Initialize STT module
 */
export async function initializeSTT() {
    console.log('🎧 Initializing STT...');
    
    // Use browser Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('❌ Browser Speech Recognition not supported');
        return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = true;  // Keep listening
    recognition.interimResults = true;  // Get results as you speak
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;
    
    console.log('✅ Browser Speech Recognition initialized');
    return true;
}

/**
 * Start live speech recognition
 * @param {Function} callback - Called with interim transcripts
 */
export async function startLiveSTT(callback) {
    if (!recognition) {
        console.error('❌ Speech Recognition not initialized');
        return;
    }
    
    currentTranscript = '';
    onTranscriptCallback = callback;
    
    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }
        
        // Update current transcript
        if (finalTranscript) {
            currentTranscript += finalTranscript;
            console.log('✅ Final transcript:', finalTranscript);
        }
        
        if (interimTranscript && onTranscriptCallback) {
            console.log('📝 Interim:', interimTranscript);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('❌ Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
            console.log('⚠️ No speech detected');
        }
    };
    
    recognition.onend = () => {
        isListening = false;
        console.log('🛑 Recognition ended');
    };
    
    try {
        recognition.start();
        isListening = true;
        console.log('🎤 Live STT started - speak now!');
    } catch (error) {
        console.error('❌ Failed to start recognition:', error);
        // If already running, that's okay
        if (!error.message.includes('already')) {
            throw error;
        }
    }
}

/**
 * Stop live speech recognition and get final transcript
 * @returns {Promise<string>} Final transcript
 */
export async function stopLiveSTT() {
    return new Promise((resolve) => {
        if (!recognition || !isListening) {
            console.warn('⚠️ Recognition not running');
            resolve(currentTranscript.trim());
            return;
        }
        
        // Give it a moment to process any final words
        setTimeout(() => {
            try {
                recognition.stop();
                console.log('✅ Final transcript:', currentTranscript.trim());
                resolve(currentTranscript.trim());
            } catch (error) {
                console.error('❌ Error stopping recognition:', error);
                resolve(currentTranscript.trim());
            }
        }, 300);
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
