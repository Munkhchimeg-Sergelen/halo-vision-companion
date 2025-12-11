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
        updateStatus('🎤 Listening... (hold and speak)');
        voiceBtn.style.background = '#ff4444';
        await startRecording();
    });
    
    // Add mouseup event - stop recording and transcribe
    voiceBtn.addEventListener('mouseup', async () => {
        updateStatus('⏳ Processing...');
        voiceBtn.style.background = '#667eea';
        
        // Stop recording and get audio blob
        const audioBlob = await stopRecording();
        
        if (!audioBlob || audioBlob.size === 0) {
            updateStatus('⚠️ No audio recorded - Ready');
            return;
        }
        
        // Transcribe the audio
        updateStatus('🎯 Transcribing...');
        const transcript = await transcribeAudio(audioBlob);
        
        await handleVoiceInteraction(transcript);
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
        
        // Stop recording and get audio blob
        const audioBlob = await stopRecording();
        
        if (!audioBlob || audioBlob.size === 0) {
            updateStatus('⚠️ No audio recorded - Ready');
            return;
        }
        
        // Transcribe the audio
        updateStatus('🎯 Transcribing...');
        const transcript = await transcribeAudio(audioBlob);
        
        await handleVoiceInteraction(transcript);
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
    
    // Add click event - capture and analyze
    captureBtn.addEventListener('click', async () => {
        await handleSceneCapture();
    });
    
    console.log('✅ Capture button configured');
}

/**
 * Handle voice interaction flow
 * @param {Blob} audioBlob - Recorded audio
 */
async function handleVoiceInteraction(transcript) {
    try {
        // Show "processing" status
        updateStatus('🎯 Understanding...');
        
        // Use the transcript directly (already transcribed live)
        
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
 * Captures camera frame and analyzes with smart detection (menu/cash/scene)
 */
async function handleSceneCapture() {
    try {
        updateStatus('📸 Capturing scene...');
        
        // Capture frame from camera
        const base64Image = await captureFrame();
        
        if (!base64Image) {
            updateStatus('⚠️ Could not capture image - Ready');
            await speak('I could not capture an image. Please make sure the camera is working.');
            return;
        }
        
        // Analyze with vision API (smart detection)
        updateStatus('🔍 Analyzing what I see...');
        const visionData = await analyzeScene(base64Image);
        
        // Store vision data for context in future conversations
        lastVisionData = visionData;
        
        // Get the spoken description
        const description = visionData.spoken_description || 'I could not analyze the image.';
        
        // Add to transcript and speak
        addToTranscript('agent', `[${visionData.type}] ${description}`);
        
        updateStatus('🗣️ Describing what I see...');
        await speak(description);
        
        updateStatus('✅ Ready - Hold button to speak or capture again');
        
    } catch (error) {
        console.error('❌ Scene capture failed:', error);
        showError('Failed to capture scene. Please try again.');
        await speak('Sorry, I had trouble analyzing the scene. Please try again.');
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
