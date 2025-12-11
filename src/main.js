// Main application entry point
// TODO: Import all modules and initialize the app

import { initializeMicrophone } from './modules/voice/mic.js';
import { initializeSTT } from './modules/voice/stt.js';
import { initializeTTS } from './modules/voice/tts.js';
import { initializeCamera } from './modules/vision/camera.js';
import { initializeVision } from './modules/vision/vision_agent.js';
import { initializeOrchestrator } from './modules/agent/orchestrator.js';
import { initializeUI, updateStatus } from './modules/ui/controls.js';

/**
 * Speak text using browser's built-in Web Speech API (no API key needed)
 */
function speakText(text) {
    return new Promise((resolve) => {
        if (!text || !text.trim()) {
            resolve();
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        
        window.speechSynthesis.speak(utterance);
    });
}

// Application state
const appState = {
    isRecording: false,
    currentTranscript: '',
    lastVisionData: null,
    conversationHistory: [],
    initialized: false
};

/**
 * Initialize all modules
 */
async function initializeApp() {
    console.log('🌟 Initializing Halo Vision Companion...');
    updateStatus('⏳ Initializing...');
    
    try {
        // Initialize each module
        
        // Initialize microphone
        const micReady = await initializeMicrophone();
        if (!micReady) {
            console.warn('⚠️ Microphone initialization failed');
        }
        
        // Initialize STT
        const sttReady = await initializeSTT();
        if (!sttReady) {
            console.warn('⚠️ STT initialization failed');
        }
        
        // Initialize TTS
        const ttsReady = await initializeTTS();
        if (!ttsReady) {
            console.warn('⚠️ TTS initialization failed');
        }
        
        // Initialize camera
        const cameraReady = await initializeCamera();
        if (!cameraReady) {
            console.warn('⚠️ Camera initialization failed');
        }
        
        // Initialize vision
        const visionReady = await initializeVision();
        if (!visionReady) {
            console.warn('⚠️ Vision initialization failed');
        }
        
        // Initialize orchestrator
        const orchestratorReady = await initializeOrchestrator();
        if (!orchestratorReady) {
            console.warn('⚠️ Orchestrator initialization failed');
        }
        
        // Initialize UI (always do this last)
        initializeUI();
        
        // Check if all critical modules are ready
        appState.initialized = micReady && sttReady && ttsReady && 
                               cameraReady && visionReady && orchestratorReady;
        
        if (appState.initialized) {
            console.log('✅ All systems ready!');
            updateStatus('✅ Ready - Hold button to speak');
            
            // Read initial outputs from backend pipelines
            await readInitialOutputs();
        } else {
            console.warn('⚠️ Some modules failed to initialize');
            updateStatus('⚠️ Partial initialization - Check console');
        }
        
    } catch (error) {
        console.error('❌ Initialization failed:', error);
        updateStatus('❌ Initialization failed');
    }
}

/**
 * Read initial outputs from backend pipelines and speak them
 */
async function readInitialOutputs() {
    console.log('📖 Reading initial outputs from backend...');
    
    try {
        // Try multiple possible paths for outputs
        const outputPaths = [
            '/output/output1.txt',
            '/frames/json_output_openai/IMG_5436.txt',
            '/menu_cash_output.txt',
            '/vision_output.txt'
        ];
        
        let textToSpeak = '';
        
        for (const path of outputPaths) {
            try {
                const res = await fetch(path);
                if (res.ok) {
                    const text = await res.text();
                    if (text.trim()) {
                        console.log(`📄 Found output at: ${path}`);
                        textToSpeak += text.trim() + '\n\n';
                    }
                }
            } catch (e) {
                // Ignore fetch errors for individual files
            }
        }
        
        if (textToSpeak.trim()) {
            console.log('🗣️ Speaking outputs...');
            updateStatus('🗣️ Reading analysis...');
            await speakText(textToSpeak);
            updateStatus('✅ Ready - Hold button to speak');
        } else {
            console.log('ℹ️ No initial outputs found');
        }
        
    } catch (err) {
        console.error('Error reading initial outputs:', err);
    }
}

/**
 * Check if app is ready
 */
export function isAppReady() {
    return appState.initialized;
}

/**
 * Get current app state
 */
export function getAppState() {
    return appState;
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export state for debugging
window.haloState = appState;

console.log('🌟 Halo Vision Companion loaded');
