// FALLBACK: Browser Web Speech API for STT
// Use this if ElevenLabs STT has format issues

let recognition = null;
let transcriptCallback = null;

export function initializeBrowserSTT() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
        console.error('Browser Speech Recognition not supported');
        return false;
    }
    
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcriptCallback) {
            transcriptCallback(transcript);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (transcriptCallback) {
            transcriptCallback('');
        }
    };
    
    console.log('✅ Browser STT initialized (fallback)');
    return true;
}

export function startBrowserSTT(callback) {
    transcriptCallback = callback;
    recognition.start();
    console.log('🎤 Browser STT listening...');
}

export function stopBrowserSTT() {
    if (recognition) {
        recognition.stop();
    }
}
