// Vision AI using OpenAI Vision API
// ROLE 2: Vision & Scene Understanding Engineer
// Integrated with menu_reader.py and cash_detector.py logic

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
 * Read menu from image (ported from menu_reader.py)
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Menu data with spoken description
 */
export async function readMenu(base64Image) {
    console.log('🍽️ Reading menu...');
    
    const prompt = `You are helping someone read a food menu. Analyze this menu image and extract:
1. All menu items (dishes/food items)
2. Their prices
3. Categories (if visible, like appetizers, mains, desserts, drinks)
4. Any special notes (like "spicy", "vegetarian", "gluten-free", etc.)

Return the response in this JSON format:
{
  "menu_name": "Restaurant/Menu name if visible, otherwise 'Menu'",
  "currency": "Currency symbol (like $, €, £, etc.)",
  "categories": [
    {
      "name": "Category name",
      "items": [
        {
          "name": "Item name",
          "price": 0.00,
          "description": "Brief description if available",
          "notes": ["vegetarian", "spicy", etc.]
        }
      ]
    }
  ]
}

Be thorough and include ALL visible items and prices.`;

    try {
        const response = await fetch(VISION_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }],
                max_tokens: 2000,
                temperature: 0.2
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // Parse JSON from response
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0].trim();
        }
        
        const menuData = JSON.parse(content);
        const spokenText = formatMenuText(menuData);
        
        console.log('✅ Menu read successfully');
        return { type: 'MENU', data: menuData, spoken_description: spokenText };
        
    } catch (error) {
        console.error('❌ Menu reading failed:', error);
        return { type: 'ERROR', spoken_description: 'I had trouble reading the menu. Please try again.' };
    }
}

/**
 * Format menu data as spoken text (from menu_reader.py)
 */
function formatMenuText(menuData) {
    if (menuData.raw_text) return menuData.raw_text;
    
    const output = ['This is the menu.'];
    const currency = menuData.currency || '$';
    
    for (const category of (menuData.categories || [])) {
        const items = category.items || [];
        if (!items.length) continue;
        
        const itemDescriptions = items.map(item => {
            let text = `${item.name} for ${currency}${item.price?.toFixed(2) || '0.00'}`;
            if (item.description) text += `, ${item.description}`;
            if (item.notes?.length) text += `, which is ${item.notes.join(', ')}`;
            return text;
        });
        
        if (itemDescriptions.length === 1) {
            output.push(`For ${category.name}, we have ${itemDescriptions[0]}.`);
        } else if (itemDescriptions.length === 2) {
            output.push(`For ${category.name}, we have ${itemDescriptions[0]}, and ${itemDescriptions[1]}.`);
        } else {
            const last = itemDescriptions.pop();
            output.push(`For ${category.name}, we have ${itemDescriptions.join(', ')}, and ${last}.`);
        }
    }
    
    return output.join(' ');
}

/**
 * Detect cash in image (ported from cash_detector.py)
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Cash data with spoken description
 */
export async function detectCash(base64Image) {
    console.log('💵 Detecting cash...');
    
    const prompt = `Analyze this image carefully and detect if there is any cash, money, bills, or coins visible.

If you see cash/money:
1. Identify each bill denomination (like $1, $5, $10, $20, $50, $100, etc.)
2. Count how many of each denomination
3. Identify any coins if visible
4. Calculate the total amount

Return the response in this JSON format:
{
  "has_cash": true,
  "currency_symbol": "$",
  "bills": [{ "denomination": 20, "count": 2, "total": 40 }],
  "coins": [{ "type": "quarter", "value": 0.25, "count": 3, "total": 0.75 }],
  "total_amount": 40.75,
  "description": "Brief description of what cash you see"
}

If there is NO cash in the image, return:
{ "has_cash": false, "message": "No cash or money detected in this image" }`;

    try {
        const response = await fetch(VISION_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }],
                max_tokens: 1000,
                temperature: 0.1
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // Parse JSON from response
        if (content.includes('```json')) {
            content = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            content = content.split('```')[1].split('```')[0].trim();
        }
        
        const cashData = JSON.parse(content);
        const spokenText = formatCashText(cashData);
        
        console.log('✅ Cash detection complete');
        return { type: 'CASH', data: cashData, spoken_description: spokenText };
        
    } catch (error) {
        console.error('❌ Cash detection failed:', error);
        return { type: 'ERROR', spoken_description: 'I had trouble detecting cash. Please try again.' };
    }
}

/**
 * Format cash data as spoken text (from cash_detector.py)
 */
function formatCashText(cashData) {
    if (!cashData.has_cash) {
        return cashData.message || 'No cash detected in this image.';
    }
    
    const output = ['I can see cash in this image.'];
    const currency = cashData.currency_symbol || '$';
    
    // Describe bills
    const bills = cashData.bills || [];
    if (bills.length) {
        const billDescriptions = bills.map(bill => {
            if (bill.count === 1) return `one ${currency}${bill.denomination} bill`;
            if (bill.count === 2) return `two ${currency}${bill.denomination} bills`;
            return `${bill.count} ${currency}${bill.denomination} bills`;
        });
        
        if (billDescriptions.length === 1) {
            output.push(`There is ${billDescriptions[0]}.`);
        } else if (billDescriptions.length === 2) {
            output.push(`There are ${billDescriptions[0]} and ${billDescriptions[1]}.`);
        } else {
            const last = billDescriptions.pop();
            output.push(`There are ${billDescriptions.join(', ')}, and ${last}.`);
        }
    }
    
    // Describe coins
    const coins = cashData.coins || [];
    if (coins.length) {
        const coinDescriptions = coins.map(coin => {
            if (coin.count === 1) return `one ${coin.type}`;
            return `${coin.count} ${coin.type}s`;
        });
        
        if (coinDescriptions.length === 1) {
            output.push(`There is also ${coinDescriptions[0]}.`);
        } else {
            const last = coinDescriptions.pop();
            output.push(`There are also ${coinDescriptions.join(', ')}, and ${last}.`);
        }
    }
    
    output.push(`The total amount of cash is ${currency}${cashData.total_amount?.toFixed(2) || '0.00'}.`);
    
    return output.join(' ');
}

/**
 * Smart scene analysis - auto-detects menu, cash, or general scene
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} Analysis result with spoken description
 */
export async function analyzeScene(base64Image) {
    console.log('🔍 Smart analyzing scene...');
    
    const prompt = `You are helping a visually impaired person understand what's in front of them.

First, determine what type of content this image shows:
- MENU: A restaurant menu, food menu, or price list
- CASH: Money, bills, coins, or currency
- SCENE: A general scene, room, street, or environment

Then provide a helpful description.

For SCENE type, describe:
1. What's directly in front of the person
2. Any obstacles or hazards to avoid
3. Navigation hints (doors, paths, stairs)
4. Any text or signs visible

Respond in JSON format:
{
  "type": "MENU" | "CASH" | "SCENE",
  "spoken_description": "A natural, helpful description to be spoken aloud"
}`;

    try {
        const response = await fetch(VISION_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [{
                    role: 'user',
                    content: [
                        { type: 'text', text: prompt },
                        { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
                    ]
                }],
                max_tokens: 1000
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        const data = await response.json();
        let content = data.choices[0].message.content;
        
        // Parse JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const result = JSON.parse(jsonMatch[0]);
            
            // If it's a menu or cash, use specialized functions for better results
            if (result.type === 'MENU') {
                return await readMenu(base64Image);
            } else if (result.type === 'CASH') {
                return await detectCash(base64Image);
            }
            
            console.log('✅ Scene analyzed:', result.type);
            return result;
        }
        
        return { type: 'SCENE', spoken_description: content };
        
    } catch (error) {
        console.error('❌ Scene analysis failed:', error);
        return { type: 'ERROR', spoken_description: 'I had trouble analyzing the scene. Please try again.' };
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
