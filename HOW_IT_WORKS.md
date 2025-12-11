# 🎯 How Halo Works - Integration Guide

## What Is Halo?

Halo is a **voice assistant for blind/visually impaired people**. They press a button, speak to it, and it responds with helpful information about their surroundings.

**NO visual maps. NO graphical UI complexity. Just voice + camera.**

---

## The User Experience (What Happens)

### Scenario 1: Scene Description
1. **User** points phone at their surroundings
2. **User** presses "Capture Scene" button
3. **Halo** takes a photo, analyzes it
4. **Halo** speaks: *"You're in a kitchen. There's a counter on your left, a refrigerator straight ahead about 2 meters away, and a dining table on your right."*

### Scenario 2: Reading Text
1. **User** points phone at a food label
2. **User** presses "Capture Scene" button
3. **User** holds "Speak" button and asks: *"What does this say?"*
4. **Halo** responds: *"It says: Organic Oat Milk, Unsweetened, One Liter. Best before December 2025."*

### Scenario 3: Navigation
1. **User** has already captured a scene
2. **User** holds "Speak" button and asks: *"Where is the door?"*
3. **Halo** responds: *"The door is at your 2 o'clock position, approximately 4 meters ahead. There's a chair in your path about 2 meters away - step to your right to avoid it."*

---

## The Technical Flow (How It Works)

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
│  (Visually Impaired Person with Phone)                 │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
      [VOICE INPUT]              [CAMERA INPUT]
             │                          │
             ↓                          ↓
    ┌────────────────┐        ┌────────────────┐
    │  MICROPHONE    │        │    CAMERA      │
    │   (mic.js)     │        │  (camera.js)   │
    └────────┬───────┘        └────────┬───────┘
             │                          │
             ↓                          ↓
    ┌────────────────┐        ┌────────────────┐
    │  SPEECH-TO-    │        │  VISION API    │
    │  TEXT (STT)    │        │ (OpenAI Vision)│
    │  (stt.js)      │        │(vision_agent.js)│
    └────────┬───────┘        └────────┬───────┘
             │                          │
             └──────────┬───────────────┘
                        ↓
              ┌──────────────────┐
              │  ORCHESTRATOR    │
              │  (Brain/Logic)   │
              │(orchestrator.js) │
              │  + OpenAI LLM    │
              └────────┬─────────┘
                       ↓
              ┌──────────────────┐
              │  TEXT-TO-SPEECH  │
              │      (TTS)       │
              │    (tts.js)      │
              └────────┬─────────┘
                       ↓
              ┌──────────────────┐
              │     SPEAKER      │
              │  (Audio Output)  │
              └──────────────────┘
                       ↓
              ┌──────────────────┐
              │      USER        │
              │  Hears Response  │
              └──────────────────┘
```

---

## Detailed Integration Flow

### Flow 1: Voice Question with Vision Context

```javascript
// STEP 1: User holds "Speak" button
User action: mousedown on voiceBtn
    ↓
UI (controls.js): calls startRecording()
    ↓
mic.js: mediaRecorder.start() // Records audio
    ↓
[User speaks: "What's around me?"]
    ↓
// STEP 2: User releases button
User action: mouseup on voiceBtn
    ↓
UI (controls.js): calls stopRecording()
    ↓
mic.js: mediaRecorder.stop() → returns audioBlob
    ↓
// STEP 3: Convert audio to text
UI (controls.js): calls transcribeAudio(audioBlob)
    ↓
stt.js: sends audioBlob to ElevenLabs API
    ↓
stt.js: returns transcript = "What's around me?"
    ↓
// STEP 4: Get vision context (if available)
UI (controls.js): retrieves lastVisionData (from previous capture)
    ↓
// STEP 5: Send to brain
UI (controls.js): calls orchestrate(transcript, visionData)
    ↓
orchestrator.js: 
    - Combines: "User said: 'What's around me?'"
    - Adds: "Visual context: Kitchen with counter, fridge..."
    - Sends to OpenAI Chat API
    ↓
OpenAI: returns "You're in a kitchen. There's a counter on your left..."
    ↓
orchestrator.js: returns response text
    ↓
// STEP 6: Speak the response
UI (controls.js): calls speak(responseText)
    ↓
tts.js: sends text to ElevenLabs TTS API
    ↓
tts.js: receives audio, plays through speakers
    ↓
User hears response!
```

### Flow 2: Capture Scene

```javascript
// User clicks "Capture Scene" button
User action: click on captureBtn
    ↓
UI (controls.js): calls captureFrame()
    ↓
camera.js: 
    - Gets video stream from camera
    - Draws frame to canvas
    - Converts to base64 image
    - Returns base64Image
    ↓
UI (controls.js): calls analyzeScene(base64Image)
    ↓
vision_agent.js:
    - Sends image to OpenAI Vision API
    - Prompt: "Analyze this image for a visually impaired person..."
    - Returns: {
        scene_description: "Kitchen with...",
        objects: ["counter", "fridge", "table"],
        text_detected: ["Organic Milk"],
        navigation_hints: ["Clear path ahead"]
      }
    ↓
UI (controls.js): 
    - Stores visionData for later use
    - Optionally speaks scene description
    - Updates UI status
    ↓
User hears: "Scene captured. You're in a kitchen..."
```

---

## The Code Integration (What Each Module Does)

### Module 1: Voice Pipeline (Role 1)

**mic.js**: Records audio from microphone
```javascript
export async function startRecording() {
    // Start MediaRecorder
    // Collect audio chunks
}

export async function stopRecording() {
    // Stop MediaRecorder
    // Return audio as Blob
}
```

**stt.js**: Converts audio to text
```javascript
export async function transcribeAudio(audioBlob) {
    // Send to ElevenLabs STT API
    // Return transcript text
}
```

**tts.js**: Converts text to speech
```javascript
export async function speak(text) {
    // Send to ElevenLabs TTS API
    // Play audio through speakers
}
```

---

### Module 2: Vision (Role 2)

**camera.js**: Captures photos
```javascript
export async function captureFrame() {
    // Get video stream
    // Draw to canvas
    // Return base64 image
}
```

**vision_agent.js**: Analyzes images
```javascript
export async function analyzeScene(base64Image) {
    // Send image to OpenAI Vision
    // Return structured data:
    // {
    //   scene_description: "...",
    //   objects: [...],
    //   text_detected: [...],
    //   navigation_hints: [...]
    // }
}
```

---

### Module 3: Agent Logic (Role 3)

**prompts.js**: System prompts
```javascript
export const SYSTEM_PROMPT = `
You are Halo, a vision companion for blind users.
Describe scenes clearly, provide navigation hints...
`;
```

**orchestrator.js**: The brain
```javascript
export async function orchestrate(userTranscript, visionData) {
    // Combine transcript + vision context
    // Send to OpenAI Chat API
    // Return response text
}
```

---

### Module 4: UI Integration (Role 4)

**controls.js**: Connects everything
```javascript
// Wire voice button
voiceBtn.addEventListener('mousedown', async () => {
    await startRecording();
});

voiceBtn.addEventListener('mouseup', async () => {
    const audioBlob = await stopRecording();
    const transcript = await transcribeAudio(audioBlob);
    const response = await orchestrate(transcript, lastVisionData);
    await speak(response);
});

// Wire capture button
captureBtn.addEventListener('click', async () => {
    const image = await captureFrame();
    const visionData = await analyzeScene(image);
    lastVisionData = visionData; // Store for later
    await speak(visionData.scene_description);
});
```

**main.js**: Initializes everything
```javascript
async function initializeApp() {
    await initializeMicrophone();
    await initializeSTT();
    await initializeTTS();
    await initializeCamera();
    await initializeVision();
    await initializeOrchestrator();
    initializeUI(); // Last
}
```

---

## Key Integration Points

### 1. Voice Button Flow
```
Button Press → mic.startRecording()
Button Release → mic.stopRecording() → audioBlob
audioBlob → stt.transcribeAudio() → transcript
transcript + visionData → orchestrator.orchestrate() → response
response → tts.speak() → audio output
```

### 2. Capture Button Flow
```
Button Click → camera.captureFrame() → base64Image
base64Image → vision.analyzeScene() → visionData
visionData → store for context + optionally speak description
```

### 3. Data Flow
```
lastVisionData (stored globally) is used as context when user asks questions
```

---

## What "Integration" Means

**Integration = Calling functions in the right order**

That's it! Each module exports functions. Role 4 (Integration) just calls them:

```javascript
// This IS the integration:
const audioBlob = await stopRecording();        // From mic.js
const transcript = await transcribeAudio(audioBlob);  // From stt.js
const response = await orchestrate(transcript);       // From orchestrator.js
await speak(response);                               // From tts.js
```

No complex systems. Just function calls.

---

## MVP Requirements (Minimum to Demo)

### Must Have:
1. ✅ Voice input works (mic → STT)
2. ✅ Camera capture works
3. ✅ Vision API returns description
4. ✅ Orchestrator combines inputs
5. ✅ TTS speaks response

### Can Skip:
- ❌ Perfect navigation (just basic descriptions OK)
- ❌ Complex error handling
- ❌ Beautiful animations
- ❌ Mobile optimization

### Demo Script (2 minutes):
1. Show UI (2 buttons)
2. Click "Capture" → shows camera → speaks "Kitchen detected"
3. Hold "Speak" → ask "What's around me?" → hear response
4. Hold "Speak" → ask "Where's the door?" → hear navigation hint
5. Done! 🎉

---

## Common Integration Questions

### Q: How does vision data get to orchestrator?
**A:** Role 4 passes it as a parameter:
```javascript
const visionData = await analyzeScene(image);
const response = await orchestrate(transcript, visionData); // ← Here
```

### Q: When does camera capture happen?
**A:** Only when user clicks "Capture Scene" button. Not automatic.

### Q: What if there's no vision data?
**A:** Orchestrator still works with just voice:
```javascript
const response = await orchestrate(transcript, null); // No vision
```

### Q: How do modules communicate?
**A:** They don't! Role 4 passes data between them:
```javascript
Module A → data → Role 4 → data → Module B
```

---

## Next Steps for Your Teammate

1. **Read this document**
2. **Look at `src/modules/ui/controls.js`** - see the TODOs
3. **Trace one flow**: Pick "voice button" and follow the comments
4. **Ask GPT**: "Explain how controls.js connects mic.js, stt.js, orchestrator.js, and tts.js in sequence"

**It's simpler than you think!** 🚀

---

## Still Confused?

The entire integration is just this:

```javascript
// When user speaks:
audio → text → brain → response text → speech → user hears

// When user captures:
camera → image → vision API → description → store for later
```

That's Halo. That's the whole thing. 🎯
