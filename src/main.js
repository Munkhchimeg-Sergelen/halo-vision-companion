// Main application entry point
// TODO: Import all modules and initialize the app

import { initializeMicrophone } from './modules/voice/mic.js';
import { initializeSTT } from './modules/voice/stt.js';
import { initializeTTS } from './modules/voice/tts.js';
import { initializeCamera } from './modules/vision/camera.js';
import { initializeVision } from './modules/vision/vision_agent.js';
import { initializeOrchestrator } from './modules/agent/orchestrator.js';
import { initializeUI, updateStatus } from './modules/ui/controls.js';

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
