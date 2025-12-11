// UI controls and event handlers
// ROLE 4: Integration, Frontend & Demo Engineer

import { startRecording, stopRecording } from '../voice/mic.js';
import { transcribeAudio } from '../voice/stt.js';
import { speak } from '../voice/tts.js';
import { captureFrame } from '../vision/camera.js';
import { analyzeScene } from '../vision/vision_agent.js';
import { orchestrate } from '../agent/orchestrator.js';

// Store last vision data for context
let lastVisionData = null;

/**
 * Initialize UI controls
 */
export function initializeUI() {
    console.log('🎨 Initializing UI...');
    
    // TODO: Get button references
    // TODO: Set up event listeners
    // TODO: Initialize status display
    
    setupVoiceButton();
    setupCaptureButton();
    
    console.log('✅ UI initialized');
}

/**
 * Set up voice button (hold to speak)
 */
function setupVoiceButton() {
    const voiceBtn = document.getElementById('voiceBtn');
    
    if (!voiceBtn) {
        console.error('❌ Voice button not found');
        return;
    }
    
    // Add mousedown event - start recording
    voiceBtn.addEventListener('mousedown', async () => {
        updateStatus('🎤 Listening...');
        voiceBtn.style.background = '#ff4444';
        await startRecording();
    });
    
    // Add mouseup event - stop recording and process
    voiceBtn.addEventListener('mouseup', async () => {
        updateStatus('⏳ Processing...');
        voiceBtn.style.background = '#667eea';
        
        const audioBlob = await stopRecording();
        await handleVoiceInteraction(audioBlob);
    });
    
    // Add touch events for mobile
    voiceBtn.addEventListener('touchstart', async (e) => {
        e.preventDefault();
        updateStatus('🎤 Listening...');
        voiceBtn.style.background = '#ff4444';
        await startRecording();
    });
    
    voiceBtn.addEventListener('touchend', async (e) => {
        e.preventDefault();
        updateStatus('⏳ Processing...');
        voiceBtn.style.background = '#667eea';
        
        const audioBlob = await stopRecording();
        await handleVoiceInteraction(audioBlob);
    });
    
    console.log('✅ Voice button configured');
}

/**
 * Set up capture button
 */
function setupCaptureButton() {
    const captureBtn = document.getElementById('captureBtn');
    
    if (!captureBtn) {
        console.error('❌ Capture button not found');
        return;
    }
    
    // TODO: Add click event - capture and analyze
    // captureBtn.addEventListener('click', async () => {
    //     await handleSceneCapture();
    // });
    
    console.log('✅ Capture button configured');
}

/**
 * Handle voice interaction flow
 * @param {Blob} audioBlob - Recorded audio
 */
async function handleVoiceInteraction(audioBlob) {
    try {
        // Show "processing" status
        updateStatus('🎯 Understanding...');
        
        // Transcribe audio
        const transcript = await transcribeAudio(audioBlob);
        
        if (!transcript || transcript.trim().length === 0) {
            updateStatus('⚠️ No speech detected - Ready');
            return;
        }
        
        // Add to transcript log
        addToTranscript('user', transcript);
        
        // Get current vision data if available
        const visionContext = lastVisionData;
        
        // Send to orchestrator
        updateStatus('🧠 Thinking...');
        const response = await orchestrate(transcript, visionContext);
        
        // Add response to transcript
        addToTranscript('agent', response);
        
        // Speak response
        updateStatus('🗣️ Speaking...');
        await speak(response);
        
        updateStatus('✅ Ready - Hold button to speak');
        
    } catch (error) {
        console.error('❌ Voice interaction failed:', error);
        showError('Failed to process voice input. Please try again.');
        updateStatus('❌ Error - Ready');
    }
}

/**
 * Handle scene capture flow
 */
async function handleSceneCapture() {
    try {
        // TODO: Show "capturing" status
        updateStatus('📸 Capturing scene...');
        
        // TODO: Capture frame
        // const base64Image = await captureFrame();
        
        // TODO: Analyze with vision API
        updateStatus('🔍 Analyzing...');
        // const visionData = await analyzeScene(base64Image);
        
        // TODO: Store vision data for context
        // lastVisionData = visionData;
        
        // TODO: Optionally speak description
        // if (visionData && visionData.scene_description) {
        //     addToTranscript('agent', `Scene captured: ${visionData.scene_description}`);
        //     await speak(visionData.scene_description);
        // }
        
        updateStatus('✅ Scene captured - Ready');
        
    } catch (error) {
        console.error('❌ Scene capture failed:', error);
        showError('Failed to capture scene. Please try again.');
        updateStatus('❌ Error - Ready');
    }
}

/**
 * Update status display
 * @param {string} message - Status message to display
 */
export function updateStatus(message) {
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = message;
        console.log('📊 Status:', message);
    }
}

/**
 * Add message to transcript log
 * @param {string} role - 'user' or 'agent'
 * @param {string} message - Message content
 */
export function addToTranscript(role, message) {
    const log = document.getElementById('transcriptLog');
    
    if (!log) {
        console.error('❌ Transcript log not found');
        return;
    }
    
    // TODO: Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `transcript-message ${role}`;
    
    // TODO: Add role label
    const roleLabel = document.createElement('strong');
    roleLabel.textContent = role === 'user' ? 'You: ' : 'Halo: ';
    
    // TODO: Add message text
    const messageText = document.createTextNode(message);
    
    messageDiv.appendChild(roleLabel);
    messageDiv.appendChild(messageText);
    
    // TODO: Append to log
    log.appendChild(messageDiv);
    
    // TODO: Auto-scroll to bottom
    log.scrollTop = log.scrollHeight;
    
    console.log(`💬 ${role}:`, message);
}

/**
 * Show error message
 * @param {string} error - Error message
 */
export function showError(error) {
    console.error('Error:', error);
    
    // TODO: Display user-friendly error
    const statusText = document.getElementById('statusText');
    if (statusText) {
        statusText.textContent = `❌ ${error}`;
        statusText.style.color = '#ff4444';
        
        // Reset color after 3 seconds
        setTimeout(() => {
            statusText.style.color = '';
        }, 3000);
    }
}

/**
 * Clear transcript log
 */
export function clearTranscript() {
    const log = document.getElementById('transcriptLog');
    if (log) {
        log.innerHTML = '';
    }
}
