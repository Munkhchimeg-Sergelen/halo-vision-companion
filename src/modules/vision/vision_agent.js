// Vision AI using OpenAI Vision API
// ROLE 2: Vision & Scene Understanding Engineer
// Integrated with menu reader and cash detector logic

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const VISION_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

/**
 * Initialize vision module
 */
export async function initializeVision() {
    console.log('👁️ Initializing vision module...');
    
    if (!OPENAI_API_KEY) {
        console.warn('⚠️ OpenAI API key not found');
        return false;
    }
    
    console.log('✅ Vision initialized');
    return true;
}

/**
 * Analyze image using OpenAI Vision API
 * Smart detection: automatically detects menus, cash, or general scenes
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Vision analysis result
 */
export async function analyzeScene(base64Image) {
    console.log('🔍 Analyzing scene with smart detection...');
    
    try {
        const prompt = `You are a helpful assistant for visually impaired people. Analyze this image and determine what it contains.

FIRST, identify what type of content this is:
- MENU: If it's a restaurant menu, food menu, or price list
- CASH: If it contains money, bills, or currency
- SCENE: For general scenes, rooms, streets, etc.

Then provide a helpful spoken description based on the type:

For MENU:
- Read out the menu items and prices clearly
- Group by categories if visible
- Mention any special items or deals

For CASH:
- Identify the currency and denominations
- Calculate the total amount
- Describe the bills/coins present

For SCENE:
- Describe what's in front of the person
- Mention obstacles or hazards
- Give navigation hints (doors, paths, objects)
- Note any text or signs visible

Respond in JSON format:
{
  "type": "MENU" | "CASH" | "SCENE",
  "spoken_description": "A natural, helpful description to be spoken aloud",
  "details": {
    // For MENU: { items: [{name, price, description}], total_items: number }
    // For CASH: { currency: string, bills: [{denomination, count}], total: number }
    // For SCENE: { objects: [], obstacles: [], navigation_hints: [], text_visible: [] }
  }
}`;

        console.log('📤 Calling OpenAI Vision API...');
        const response = await fetch(VISION_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: prompt
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Vision API error:', errorText);
            throw new Error(`Vision API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Try to parse JSON from response
        let analysis;
        try {
            // Extract JSON from response (might be wrapped in markdown)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                // If no JSON, create a simple response
                analysis = {
                    type: 'SCENE',
                    spoken_description: content,
                    details: {}
                };
            }
        } catch (parseError) {
            console.warn('⚠️ Could not parse JSON, using raw response');
            analysis = {
                type: 'SCENE',
                spoken_description: content,
                details: {}
            };
        }
        
        console.log('✅ Scene analyzed:', analysis.type);
        console.log('📝 Description:', analysis.spoken_description);
        return analysis;
        
    } catch (error) {
        console.error('❌ Vision analysis failed:', error);
        return {
            type: 'ERROR',
            spoken_description: 'I had trouble analyzing the image. Please try again.',
            details: { error: error.message }
        };
    }
}

/**
 * Extract text from image (OCR)
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<string>} Extracted text
 */
export async function extractText(base64Image) {
    console.log('📝 Extracting text...');
    
    try {
        // TODO: Use Vision API specifically for OCR
        // const response = await fetch(VISION_ENDPOINT, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${OPENAI_API_KEY}`
        //     },
        //     body: JSON.stringify({
        //         model: 'gpt-4-vision-preview',
        //         messages: [
        //             {
        //                 role: 'user',
        //                 content: [
        //                     {
        //                         type: 'text',
        //                         text: 'Extract all visible text from this image. Return only the text, nothing else.'
        //                     },
        //                     {
        //                         type: 'image_url',
        //                         image_url: {
        //                             url: `data:image/jpeg;base64,${base64Image}`
        //                         }
        //                     }
        //                 ]
        //             }
        //         ],
        //         max_tokens: 300
        //     })
        // });
        
        // TODO: Parse response
        // const data = await response.json();
        // const text = data.choices[0].message.content;
        
        // console.log('✅ Text extracted:', text);
        // return text;
        
        // Placeholder
        return '';
        
    } catch (error) {
        console.error('❌ Text extraction failed:', error);
        return '';
    }
}

/**
 * Describe scene for navigation
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<string>} Navigation description
 */
export async function getNavigationDescription(base64Image) {
    console.log('🧭 Getting navigation description...');
    
    // TODO: Use Vision API with navigation-specific prompt
    // Focus on: obstacles, distances, directions, safe paths
    
    // Placeholder
    return '';
}
