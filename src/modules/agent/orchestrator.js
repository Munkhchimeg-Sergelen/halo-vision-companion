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
        
        // Call OpenAI API
        console.log('📤 Calling OpenAI API...');
        const response = await fetch(CHAT_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: conversationHistory,
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ OpenAI API error:', errorText);
            throw new Error(`OpenAI API error: ${response.status}`);
        }
        
        // Parse response
        const data = await response.json();
        const assistantMessage = data.choices[0].message.content;
        
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
        
        console.log('✅ Response generated:', assistantMessage);
        return assistantMessage;
        
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
