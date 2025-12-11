# 🎤 Role 1 (Voice Interface) - Integration Contract

## Overview

Role 1 handles the **voice input** and **voice output** of the system.
- **Input**: User speaks → I convert to text
- **Output**: System response text → I convert to speech

---

## What I Provide to Others

### 1. Speech-to-Text (Input)

```javascript
/**
 * Transcribe user's voice to text
 * @param {Blob} audioBlob - Recorded audio from microphone
 * @returns {Promise<string>} - Plain text of what user said
 */
export async function transcribeAudio(audioBlob)
```

**Returns:**
- Type: `string`
- Format: Plain text, lowercase, punctuation included
- Examples:
  - `"what's around me?"`
  - `"read the menu to me"`
  - `"where is the door?"`
  - `"how far is the table?"`

**Used by:** Role 4 (UI) → passes to Role 3 (Orchestrator)

---

### 2. Text-to-Speech (Output)

```javascript
/**
 * Speak text aloud to user
 * @param {string} text - Response text to speak
 * @returns {Promise<void>} - Resolves when speech finishes
 */
export async function speak(text)
```

**Accepts:**
- Type: `string`
- Format: Plain text, conversational
- Length: Reasonable (max ~500 characters)

**Used by:** Role 4 (UI) → receives from Role 3 (Orchestrator)

---

## What I Need from Others

### From Role 3 (Orchestrator) ⚠️ CRITICAL

Your `orchestrate()` function **MUST** return text in this format:

#### Function Signature:
```javascript
/**
 * @param {string} userText - What user said (from Role 1)
 * @param {object} visionData - Scene data (from Role 2)
 * @returns {Promise<string>} - Response text ready to speak
 */
export async function orchestrate(userText, visionData)
```

#### Return Value Requirements:

| Requirement | ✅ Correct | ❌ Wrong |
|-------------|-----------|----------|
| **Type** | Plain string | JSON object, HTML |
| **Format** | Natural language | Technical/code-like |
| **Length** | ~100-500 chars | 2000+ chars |
| **Numbers** | "three meters" | "3m", "3.0m" |
| **Punctuation** | Use commas, periods | Run-on sentences |
| **Characters** | Letters, numbers, basic punctuation | ★→←•※⚠️ |

#### ✅ GOOD Examples:

```javascript
// Scene description
return "You're in a kitchen. There's a counter 2 meters to your left and a refrigerator straight ahead, about 3 meters away.";

// Menu reading
return "The menu says: Classic Burger for ten dollars ninety-nine cents, Cheese Burger for twelve dollars, and Fries for five dollars.";

// Navigation
return "The door is at your 2 o'clock position, approximately 4 meters away. Clear path ahead.";

// Short answer
return "The table is about 3 meters to your right.";

// Safety warning
return "Caution: there's a chair directly in your path, about 1 meter ahead. Please step to your left.";
```

#### ❌ BAD Examples:

```javascript
// ❌ JSON object (I can't speak JSON!)
return {
  "response": "You're in a kitchen",
  "confidence": 0.95
};

// ❌ Technical format
return "scene_type: kitchen, obj_list: [counter@2m_9oclock, fridge@3m_12oclock]";

// ❌ Special characters
return "Kitchen★Counter→2m←Fridge→3m•Table→4m";

// ❌ Too abbreviated
return "Kitchen. Cntr 2m L. Frig 3m F. Tbl 4m R.";

// ❌ HTML/Markdown
return "You're in a **kitchen**. <br>Counter on left.";

// ❌ Too long (would take 2+ minutes to speak!)
return "You are currently located in a kitchen environment which contains multiple objects including but not limited to a granite countertop measuring approximately 2 meters in distance from your current position at a relative bearing of 9 o'clock, a stainless steel refrigerator appliance positioned at your 12 o'clock position approximately 3 meters away...";
```

#### Why These Requirements?

**Conversational tone:**
- Users hear this spoken aloud
- Should sound natural, not robotic
- Like talking to a friend

**Spell out numbers:**
- TTS pronounces "3m" as "three M" (sounds weird!)
- Say "three meters" instead

**Reasonable length:**
- Users can't see text, must remember by ear
- Long responses are overwhelming
- Break into shorter responses if needed

**No special characters:**
- TTS doesn't know how to pronounce ★→←
- Stick to letters, numbers, basic punctuation

---

### From Role 2 (Vision) ℹ️ INFO ONLY

**I don't directly call your functions!**

But for smooth integration with Role 3:

#### Recommended Data Structure:

```javascript
// ✅ Easy for Role 3 to convert to speech
{
  scene_description: "kitchen",
  objects: [
    {
      name: "counter",
      distance_meters: 2.0,
      direction: "left" // or "9 o'clock"
    },
    {
      name: "refrigerator",
      distance_meters: 3.0,
      direction: "ahead" // or "12 o'clock"
    }
  ],
  text_detected: ["Exit", "Fire Extinguisher"],
  navigation_advice: "Clear path ahead for 3 meters"
}

// ❌ Hard to convert to speech
{
  img_analysis_result_v2: {
    detection_boxes: [[120,50,300,400], [400,200,550,450]],
    class_ids: [23, 14],
    conf_scores: [0.95, 0.87]
  }
}
```

**Tips:**
- Use clear, descriptive property names
- Include units explicitly (`distance_meters` not `dist`)
- Structure data how you'd describe it to a human

---

### From Role 4 (UI/Integration)

#### Call My Functions in This Order:

```javascript
// 1. User holds voice button
voiceBtn.addEventListener('mousedown', async () => {
    await startRecording(); // ← MY FUNCTION
});

// 2. User releases voice button
voiceBtn.addEventListener('mouseup', async () => {
    // Get the audio
    const audioBlob = await stopRecording(); // ← MY FUNCTION
    
    // Convert to text
    const userText = await transcribeAudio(audioBlob); // ← MY FUNCTION
    
    // Send to orchestrator (Role 3)
    const response = await orchestrate(userText, lastVisionData); // ROLE 3
    
    // Speak the response
    await speak(response); // ← MY FUNCTION
});
```

**Key Points:**
1. Always call `stopRecording()` before `transcribeAudio()`
2. Wait for `transcribeAudio()` to finish before calling orchestrator
3. Pass orchestrator's response directly to `speak()`
4. Handle errors at each step

---

## Integration Testing Checklist

### At 7:20 PM Integration:

**Test 1: Basic Flow**
```javascript
// User says: "What's around me?"
const response = await orchestrate("what's around me?", mockVisionData);
await speak(response);
// ✅ Should sound natural
// ✅ Should mention objects from vision data
// ✅ Should be clear and helpful
```

**Test 2: Menu Reading**
```javascript
// User says: "Read the menu"
const response = await orchestrate("read the menu", menuVisionData);
await speak(response);
// ✅ Should read text from vision data
// ✅ Numbers should sound natural ("ten dollars" not "ten dollars and zero cents")
// ✅ Should be organized (not just list of words)
```

**Test 3: Navigation**
```javascript
// User says: "Where is the door?"
const response = await orchestrate("where is the door?", hallwayData);
await speak(response);
// ✅ Should give direction and distance
// ✅ Should warn of obstacles if any
// ✅ Should be concise
```

**Test 4: Error Handling**
```javascript
// No vision data available
const response = await orchestrate("what's around me?", null);
await speak(response);
// ✅ Should still work gracefully
// ✅ Should ask user to capture scene first
```

### Red Flags 🚩

If I hear these issues, I'll ask for adjustment:

- 🚩 Response sounds robotic or technical
- 🚩 Takes forever to speak (> 30 seconds)
- 🚩 Numbers sound weird ("three M" instead of "three meters")
- 🚩 Special characters are pronounced literally
- 🚩 Response is JSON/technical format

---

## Error Handling

### What I Do:

```javascript
// If STT fails
if (transcriptionError) {
    await speak("Sorry, I didn't catch that. Please try again.");
}

// If TTS fails
if (speechError) {
    console.error("Unable to speak response:", error);
    // Show in UI instead (Role 4 handles this)
}
```

### What You Should Do (Role 3):

```javascript
// If you can't generate response
if (somethingWrong) {
    // Still return a string!
    return "Sorry, I'm having trouble processing that. Could you try again?";
    // ❌ DON'T throw error or return null
}

// If vision data is missing
if (!visionData) {
    return "Please capture a scene first by tapping the camera button.";
}

// If user question is unclear
if (!understoodQuestion) {
    return "I'm not sure what you're asking. Could you rephrase that?";
}
```

---

## Example Integration Flow

### Complete Scenario: User Asks About Scene

```javascript
// 1. User holds button, speaks: "What's around me?"

// 2. Role 1 (me):
const audioBlob = await stopRecording();
const userText = await transcribeAudio(audioBlob);
// → "what's around me?"

// 3. Role 4 calls Role 3:
const response = await orchestrate(
    "what's around me?",
    {
        scene_description: "kitchen",
        objects: [
            {name: "counter", distance_meters: 2, direction: "left"},
            {name: "fridge", distance_meters: 3, direction: "ahead"}
        ]
    }
);
// Role 3 returns:
// → "You're in a kitchen. There's a counter 2 meters to your left and a refrigerator 3 meters straight ahead."

// 4. Role 1 (me):
await speak("You're in a kitchen. There's a counter 2 meters to your left and a refrigerator 3 meters straight ahead.");

// 5. User hears response! ✅
```

---

## Quick Reference

### My Functions:

| Function | Input | Output | Who Calls |
|----------|-------|--------|-----------|
| `initializeMicrophone()` | none | `boolean` | Role 4 (once) |
| `startRecording()` | none | `void` | Role 4 (on button press) |
| `stopRecording()` | none | `Blob` | Role 4 (on button release) |
| `transcribeAudio(blob)` | `Blob` | `string` | Role 4 |
| `speak(text)` | `string` | `void` | Role 4 |
| `stopSpeaking()` | none | `void` | Role 4 (if needed) |

### What I Need:

| From | Function | Returns | Format |
|------|----------|---------|--------|
| Role 3 | `orchestrate(text, vision)` | `string` | Plain text, conversational, ~100-500 chars |

---

## Contact

Questions during development? Find me:
- Check this doc first
- Ask in team chat
- Debug together at 7:20 PM integration

Let's make Halo sound amazing! 🎤✨

— Role 1 (Voice Interface)
