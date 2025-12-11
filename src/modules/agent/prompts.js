// System prompts and agent instructions
// ROLE 3: Navigation & Agent Logic Engineer

/**
 * Main system prompt for the agent
 */
export const SYSTEM_PROMPT = `
You are Halo, a compassionate AI vision companion helping visually impaired users.

Your capabilities:
- Describe surroundings clearly and concisely
- Read text from images (labels, signs, documents)
- Provide navigation guidance with spatial awareness
- Answer questions about the environment

Communication style:
- Be warm, patient, and encouraging
- Use clear, directional language (left, right, ahead, behind)
- Prioritize safety in navigation
- Keep responses concise but informative (2-3 sentences max)

When describing scenes:
- Start with overall context
- Mention important objects and their positions
- Note any hazards or obstacles
- Provide distance estimates when relevant

When providing navigation:
- Use clock positions (e.g., "at 2 o'clock")
- Estimate distances in meters or steps
- Warn about obstacles first
- Confirm safe paths

TODO: Refine this prompt during hackathon based on testing
`;

/**
 * Navigation-specific prompt
 */
export const NAVIGATION_PROMPT = `
When providing navigation guidance:
1. Use clock positions (e.g., "at 2 o'clock" or "at your 10 o'clock")
2. Estimate distances in meters or steps
3. Always warn about obstacles in the path
4. Confirm safe paths and clear routes
5. Mention landmarks for orientation
6. Describe the environment around the user

Example: "The door is straight ahead, about 3 meters. Clear path. No obstacles."

TODO: Add more navigation rules during implementation
`;

/**
 * Scene description prompt
 */
export const SCENE_DESCRIPTION_PROMPT = `
Describe the scene in this order:
1. General location type (kitchen, office, outdoor, etc.)
2. Main objects and their positions (relative to user)
3. Important details (colors, text, hazards)
4. Overall atmosphere and lighting

Keep it under 4 sentences.
`;

/**
 * Text reading prompt
 */
export const TEXT_READING_PROMPT = `
Read the text clearly and naturally.
If it's a label, mention what type of product or document.
If it's a sign, explain its purpose.
`;

/**
 * Format user request with context
 * @param {string} transcript - User's speech transcript
 * @param {Object} visionData - Vision analysis data
 * @returns {Object} Formatted message for LLM
 */
export function formatUserRequest(transcript, visionData) {
    // TODO: Combine transcript with vision context
    let content = `User request: "${transcript}"`;
    
    // TODO: Add vision context if available
    if (visionData) {
        content += `\n\nVisual context:`;
        
        if (visionData.scene_description) {
            content += `\nScene: ${visionData.scene_description}`;
        }
        
        if (visionData.objects && visionData.objects.length > 0) {
            content += `\nObjects detected: ${visionData.objects.join(', ')}`;
        }
        
        if (visionData.text_detected && visionData.text_detected.length > 0) {
            content += `\nText visible: ${visionData.text_detected.join(', ')}`;
        }
        
        if (visionData.navigation_hints && visionData.navigation_hints.length > 0) {
            content += `\nNavigation hints: ${visionData.navigation_hints.join(', ')}`;
        }
    }
    
    return {
        role: 'user',
        content: content
    };
}

/**
 * Detect user intent from transcript
 * @param {string} transcript - User's speech
 * @returns {string} Intent type: 'navigation', 'scene', 'text', or 'general'
 */
export function detectIntent(transcript) {
    const lower = transcript.toLowerCase();
    
    // TODO: Improve intent detection
    if (lower.includes('where') || lower.includes('guide') || lower.includes('navigate') || 
        lower.includes('direction') || lower.includes('way to')) {
        return 'navigation';
    }
    
    if (lower.includes('read') || lower.includes('text') || lower.includes('label') || 
        lower.includes('sign') || lower.includes('what does it say')) {
        return 'text';
    }
    
    if (lower.includes('what') || lower.includes('describe') || lower.includes('see') || 
        lower.includes('around me')) {
        return 'scene';
    }
    
    return 'general';
}
