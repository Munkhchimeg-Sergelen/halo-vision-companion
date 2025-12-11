// Main agent orchestrator
// ROLE 3: Navigation & Agent Logic Engineer

import { SYSTEM_PROMPT, formatUserRequest, detectIntent } from './prompts.js';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const CHAT_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

let conversationHistory = [];

/**
 * Initialize orchestrator
 */
export async function initializeOrchestrator() {
    console.log('🧠 Initializing agent orchestrator...');
    
    // TODO: Set up initial system message
    conversationHistory = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];
    
    // TODO: Verify API key
    if (!OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not found');
        return false;
    }
    
    console.log('✅ Orchestrator initialized');
    return true;
}

/**
 * Main orchestration function
 * Combines STT input and vision data to generate response
 * 
 * @param {string} userTranscript - Text from STT
 * @param {Object} visionData - Data from vision module (optional)
 * @returns {Promise<string>} Agent response text
 */
export async function orchestrate(userTranscript, visionData = null) {
    console.log('🎯 Orchestrating response...');
    console.log('User said:', userTranscript);
    console.log('Vision data:', visionData);
    
    try {
        // Detect user intent
        const intent = detectIntent(userTranscript);
        console.log('Detected intent:', intent);
        
        // Format request with context
        const userMessage = formatUserRequest(userTranscript, visionData);
        
        // Add to conversation history
        conversationHistory.push(userMessage);
        
        // MOCK: Generate contextual response based on intent and vision data
        // TODO: Replace with real OpenAI API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
        
        let assistantMessage = '';
        
        if (intent === 'scene' && visionData) {
            assistantMessage = visionData.scene_description || "I can see your surroundings. Let me describe what's around you.";
        } else if (intent === 'navigation' && visionData) {
            const hints = visionData.navigation_hints || [];
            assistantMessage = hints.length > 0 
                ? `Here's how to navigate: ${hints.join('. ')}.`
                : "I can help you navigate. The path ahead appears clear.";
        } else if (intent === 'text' && visionData) {
            const texts = visionData.text_detected || [];
            assistantMessage = texts.length > 0
                ? `I can see the following text: ${texts.join(', ')}.`
                : "I don't see any readable text in the current view.";
        } else {
            const responses = [
                "I'm here to help you. You can ask me to describe your surroundings, read text, or help you navigate.",
                "I'm ready to assist. Would you like me to capture and describe what's around you?",
                "How can I help you today? I can describe scenes, read text, or guide you through spaces."
            ];
            assistantMessage = responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Add response to history
        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });
        
        // Trim history if too long (keep last 10 messages + system)
        if (conversationHistory.length > 11) {
            conversationHistory = [
                conversationHistory[0], // Keep system prompt
                ...conversationHistory.slice(-10)
            ];
        }
        
        console.log('✅ Response generated (MOCK):', assistantMessage);
        return assistantMessage;
        
        /* REAL IMPLEMENTATION (uncomment when API key is ready):
        const response = await fetch(CHAT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: conversationHistory,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });
        
        if (conversationHistory.length > 11) {
            conversationHistory = [
                conversationHistory[0],
                ...conversationHistory.slice(-10)
            ];
        }
        
        console.log('✅ Response generated:', assistantMessage);
        return assistantMessage;
        */
        
    } catch (error) {
        console.error('❌ Orchestration failed:', error);
        return 'I apologize, I encountered an error. Please try again.';
    }
}

/**
 * Process navigation request
 * @param {string} userIntent - What the user wants to navigate to
 * @param {Object} visionData - Vision analysis with spatial info
 * @returns {Promise<string>} Navigation instructions
 */
async function handleNavigation(userIntent, visionData) {
    // TODO: Implement navigation logic
    // TODO: Use vision data for spatial awareness
    // TODO: Provide clear directional guidance
    
    console.log('🧭 Handling navigation request');
    
    // Placeholder
    return '';
}

/**
 * Process scene description request
 * @param {Object} visionData - Vision analysis
 * @returns {Promise<string>} Scene description
 */
async function handleSceneDescription(visionData) {
    // TODO: Format scene description in natural language
    // TODO: Prioritize important information
    
    console.log('👁️ Handling scene description');
    
    // Placeholder
    return '';
}

/**
 * Process text reading request
 * @param {Object} visionData - Vision analysis with OCR
 * @returns {Promise<string>} Text content
 */
async function handleTextReading(visionData) {
    // TODO: Extract and read text from vision data
    // TODO: Add context about what kind of text it is
    
    console.log('📝 Handling text reading');
    
    // Placeholder
    return '';
}

/**
 * Clear conversation history (optional)
 * Useful for starting fresh or managing memory
 */
export function clearHistory() {
    console.log('🗑️ Clearing conversation history');
    conversationHistory = [
        { role: 'system', content: SYSTEM_PROMPT }
    ];
}

/**
 * Get current conversation history
 * @returns {Array} Conversation messages
 */
export function getHistory() {
    return conversationHistory;
}
