// UI controls and event handlers
// ROLE 4: Integration, Frontend & Demo Engineer

import { startRecording, stopRecording } from '../voice/mic.js';
import { transcribeAudio } from '../voice/stt.js';
import { speak } from '../voice/tts.js';
import { captureFrame, ensureCameraPlaying } from '../vision/camera.js';
import { analyzeScene } from '../vision/vision_agent.js';
import { orchestrate } from '../agent/orchestrator.js';

// Application state
let isConversationActive = false;
let isProcessing = false;
let isCameraActive = false;
let lastVisionData = null;
let conversationBtn = null;
let cameraBtn = null;
let conversationStatus = null;
let cameraStatus = null;
let statusOverlay = null;
let statusText = null;
let cameraPreview = null;
let appContainer = null;

/**
 * Initialize UI controls
 */
export function initializeUI() {
    console.log('🎨 Initializing UI...');
    
    // Get button references
    conversationBtn = document.getElementById('conversationBtn');
    cameraBtn = document.getElementById('cameraBtn');
    conversationStatus = document.getElementById('conversationStatus');
    cameraStatus = document.getElementById('cameraStatus');
    statusOverlay = document.getElementById('statusOverlay');
    statusText = document.getElementById('statusText');
    cameraPreview = document.getElementById('cameraPreview');
    appContainer = document.querySelector('.app-container');
    
    // Set up event listeners
    setupConversationButton();
    setupCameraButton();
    
    console.log('✅ UI initialized');
}

/**
 * Set up conversation button (click to toggle)
 */
function setupConversationButton() {
    if (!conversationBtn) {
        console.error('❌ Conversation button not found');
        return;
    }
    
    conversationBtn.addEventListener('click', async () => {
        if (isProcessing) {
            console.log('⏳ Already processing, please wait...');
            return;
        }
        
        if (!isConversationActive) {
            // Start conversation
            await startConversation();
        } else {
            // Stop conversation
            await stopConversation();
        }
    });
    
    console.log('✅ Conversation button configured');
}

/**
 * Set up camera button
 */
function setupCameraButton() {
    if (!cameraBtn) {
        console.error('❌ Camera button not found');
        return;
    }
    
    cameraBtn.addEventListener('click', async () => {
        if (!isCameraActive) {
            // First click: Show camera preview
            await showCameraPreview();
        } else {
            // Second click: Capture and analyze
            await handleSceneCapture();
        }
    });
    
    console.log('✅ Camera button configured');
}

/**
 * Show camera preview
 */
async function showCameraPreview() {
    try {
        console.log('🎥 showCameraPreview called');
        updateStatus('📷 Opening camera...');
        
        // Ensure camera is playing
        console.log('🎥 Ensuring camera is playing...');
        const cameraReady = await ensureCameraPlaying();
        console.log('🎥 Camera ready:', cameraReady);
        
        if (!cameraReady) {
            showError('Camera not available. Please check permissions.');
            return;
        }
        
        isCameraActive = true;
        
        // Show preview
        console.log('🎥 Showing preview elements...');
        console.log('🎥 cameraPreview element:', cameraPreview);
        console.log('🎥 appContainer element:', appContainer);
        
        if (cameraPreview) {
            cameraPreview.classList.add('active');
            console.log('🎥 Added active class to preview');
            
            // Make sure video element is visible
            const videoElement = document.getElementById('camera');
            if (videoElement) {
                videoElement.style.display = 'block';
                videoElement.style.width = '100%';
                videoElement.style.height = '100%';
                videoElement.style.objectFit = 'cover';
                console.log('🎥 Video element styled and visible');
                console.log('🎥 Video dimensions:', videoElement.videoWidth, 'x', videoElement.videoHeight);
            }
        }
        if (appContainer) {
            appContainer.classList.add('camera-active');
            console.log('🎥 Added camera-active class to container');
        }
        
        // Update button
        updateCameraStatus('Click to capture');
        const labelElement = cameraBtn.querySelector('.label');
        if (labelElement) labelElement.textContent = 'Capture Photo';
        
        updateStatus('📷 Camera ready - Click to capture');
        console.log('🎥 Camera preview should now be visible');
        
    } catch (error) {
        console.error('❌ Failed to show camera:', error);
        showError('Failed to open camera');
        isCameraActive = false;
    }
}

/**
 * Hide camera preview
 */
function hideCameraPreview() {
    isCameraActive = false;
    
    if (cameraPreview) {
        cameraPreview.classList.remove('active');
    }
    if (appContainer) {
        appContainer.classList.remove('camera-active');
    }
    
    // Reset button
    updateCameraStatus('Take a photo');
    const labelElement = cameraBtn.querySelector('.label');
    if (labelElement) labelElement.textContent = 'Capture Scene';
}

/**
 * Start conversation mode
 */
async function startConversation() {
    try {
        isConversationActive = true;
        isProcessing = true;
        
        // Update UI
        conversationBtn.classList.add('active');
        conversationBtn.setAttribute('aria-pressed', 'true');
        updateButtonLabel(conversationBtn, 'Listening...', 'Speak now');
        updateStatus('🎤 Listening...');
        
        // Start recording
        await startRecording();
        
        isProcessing = false;
        
        // Auto-stop after 10 seconds (safety)
        setTimeout(() => {
            if (isConversationActive) {
                stopConversation();
            }
        }, 10000);
        
    } catch (error) {
        console.error('❌ Failed to start conversation:', error);
        showError('Failed to start conversation. Please try again.');
        isConversationActive = false;
        isProcessing = false;
        conversationBtn.classList.remove('active');
        updateButtonLabel(conversationBtn, 'Start Conversation', 'Click to begin');
    }
}

/**
 * Stop conversation and process
 */
async function stopConversation() {
    try {
        isProcessing = true;
        
        // Update UI
        conversationBtn.classList.remove('active');
        conversationBtn.setAttribute('aria-pressed', 'false');
        updateButtonLabel(conversationBtn, 'Processing...', 'Please wait');
        updateStatus('⏳ Processing...');
        
        // Stop recording and get audio
        const audioBlob = await stopRecording();
        
        if (audioBlob && audioBlob.size > 0) {
            // Process the audio
            await handleVoiceInteraction(audioBlob);
        } else {
            console.warn('⚠️ No audio recorded');
            updateStatus('⚠️ No audio detected');
        }
        
        isConversationActive = false;
        isProcessing = false;
        
        // Reset button
        updateButtonLabel(conversationBtn, 'Start Conversation', 'Click to begin');
        
    } catch (error) {
        console.error('❌ Failed to stop conversation:', error);
        showError('Failed to process audio. Please try again.');
        isConversationActive = false;
        isProcessing = false;
        updateButtonLabel(conversationBtn, 'Start Conversation', 'Click to begin');
    }
}

/**
 * Handle voice interaction flow
 * @param {Blob} audioBlob - Recorded audio
 */
async function handleVoiceInteraction(audioBlob) {
    try {
        updateStatus('🎯 Understanding...');
        
        // Transcribe audio
        const transcript = await transcribeAudio(audioBlob);
        console.log('📝 Transcript:', transcript);
        
        if (!transcript || transcript.trim() === '') {
            updateStatus('⚠️ No speech detected');
            return;
        }
        
        // Get current vision data if available
        const visionContext = lastVisionData;
        
        // Send to orchestrator
        updateStatus('🧠 Thinking...');
        const response = await orchestrate(transcript, visionContext);
        console.log('💭 Response:', response);
        
        if (!response || response.trim() === '') {
            updateStatus('⚠️ No response generated');
            return;
        }
        
        // Speak response
        updateStatus('🗣️ Speaking...');
        await speak(response);
        
        updateStatus('✅ Ready - Click to speak again');
        
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
        // Visual feedback
        cameraBtn.classList.add('capturing');
        updateCameraStatus('Capturing...');
        updateStatus('📸 Capturing scene...');
        
        // Capture frame
        const base64Image = await captureFrame();
        
        // Hide camera preview after capture
        hideCameraPreview();
        
        if (!base64Image) {
            updateStatus('⚠️ Failed to capture image');
            cameraBtn.classList.remove('capturing');
            return;
        }
        
        // Analyze with vision API
        updateStatus('🔍 Analyzing...');
        updateCameraStatus('Analyzing...');
        const visionData = await analyzeScene(base64Image);
        
        // Store vision data for context
        lastVisionData = visionData;
        
        // Remove capturing animation
        setTimeout(() => cameraBtn.classList.remove('capturing'), 300);
        
        // Speak description
        if (visionData && visionData.scene_description) {
            updateStatus('🗣️ Describing scene...');
            await speak(visionData.scene_description);
            updateStatus('✅ Scene captured - Click camera to capture again');
        } else {
            updateStatus('⚠️ No scene description available');
        }
        
    } catch (error) {
        console.error('❌ Scene capture failed:', error);
        showError('Failed to capture scene. Please try again.');
        updateStatus('❌ Error - Ready');
        cameraBtn.classList.remove('capturing');
        hideCameraPreview();
    }
}

/**
 * Update status display
 * @param {string} message - Status message to display
 */
export function updateStatus(message) {
    if (statusText) {
        statusText.textContent = message;
        console.log('📊 Status:', message);
        
        // Show overlay briefly
        if (statusOverlay) {
            statusOverlay.classList.add('visible');
            setTimeout(() => {
                statusOverlay.classList.remove('visible');
            }, 2000);
        }
    }
}

/**
 * Update button label and status
 * @param {HTMLElement} button - Button element
 * @param {string} label - Main label text
 * @param {string} status - Status indicator text
 */
function updateButtonLabel(button, label, status) {
    const labelElement = button.querySelector('.label');
    const statusElement = button.querySelector('.status-indicator');
    
    if (labelElement) labelElement.textContent = label;
    if (statusElement) statusElement.textContent = status;
}

/**
 * Update camera button status
 * @param {string} status - Status text
 */
function updateCameraStatus(status) {
    if (cameraStatus) {
        cameraStatus.textContent = status;
    }
}


/**
 * Show error message
 * @param {string} error - Error message
 */
export function showError(error) {
    console.error('Error:', error);
    
    if (statusText && statusOverlay) {
        statusText.textContent = `❌ ${error}`;
        statusOverlay.classList.add('visible');
        statusOverlay.style.background = 'rgba(220, 38, 38, 0.9)';
        
        // Reset after 3 seconds
        setTimeout(() => {
            statusOverlay.classList.remove('visible');
            statusOverlay.style.background = 'rgba(0, 0, 0, 0.85)';
        }, 3000);
    }
}
