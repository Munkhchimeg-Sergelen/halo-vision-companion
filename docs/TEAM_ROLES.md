# Team Roles & Responsibilities

## 👤 Role 1: Voice Pipeline Engineer
**Branch**: `feature/voice-pipeline`

### Tasks:
- [ ] Implement microphone capture (mic.js)
  - Request microphone permissions
  - Set up MediaRecorder
  - Handle audio chunk collection
- [ ] Integrate ElevenLabs STT (stt.js)
  - Format audio for API
  - Send to ElevenLabs endpoint
  - Parse transcript response
- [ ] Integrate ElevenLabs TTS (tts.js)
  - Send text to API
  - Receive audio stream
  - Play through AudioContext
- [ ] Handle audio playback and errors
- [ ] Ensure low latency (< 2 seconds)

### Files:
- `src/modules/voice/mic.js`
- `src/modules/voice/stt.js`
- `src/modules/voice/tts.js`

### Success Criteria:
✅ User can speak and hear responses  
✅ Latency < 2 seconds  
✅ Clear audio quality  
✅ Error handling for permissions  

### API Documentation:
- ElevenLabs Docs: https://elevenlabs.io/docs

---

## 👤 Role 2: Vision & Scene Understanding Engineer
**Branch**: `feature/vision`

### Tasks:
- [ ] Implement camera capture (camera.js)
  - Request camera permissions
  - Set up video stream
  - Capture frames to canvas
  - Convert to base64
- [ ] Integrate OpenAI Vision API (vision_agent.js)
  - Format image for API
  - Send with appropriate prompts
  - Parse structured responses
- [ ] Extract scene descriptions
- [ ] Implement OCR for text reading
- [ ] Structure output JSON consistently

### Files:
- `src/modules/vision/camera.js`
- `src/modules/vision/vision_agent.js`

### Success Criteria:
✅ Accurate scene descriptions  
✅ Working OCR for text  
✅ Clean JSON output format  
✅ Camera permissions handled  

### API Documentation:
- OpenAI Vision: https://platform.openai.com/docs/guides/vision

---

## 👤 Role 3: Navigation & Agent Logic Engineer
**Branch**: `feature/agent-logic`

### Tasks:
- [ ] Write system prompts (prompts.js)
  - Main Halo personality prompt
  - Navigation-specific guidance
  - Scene description templates
- [ ] Implement orchestrator (orchestrator.js)
  - Combine user input + vision context
  - Call OpenAI Chat API
  - Manage conversation history
  - Route based on intent
- [ ] Handle navigation logic
  - Spatial awareness
  - Distance estimation
  - Obstacle warnings
- [ ] Manage conversation context
- [ ] Integrate all inputs

### Files:
- `src/modules/agent/orchestrator.js`
- `src/modules/agent/prompts.js`

### Success Criteria:
✅ Smart, contextual responses  
✅ Navigation guidance works  
✅ Handles all 3 demo scenarios  
✅ Natural conversation flow  

### API Documentation:
- OpenAI Chat: https://platform.openai.com/docs/guides/chat

---

## 👤 Role 4: Integration, Frontend & Demo Engineer
**Branch**: `feature/ui-integration`

### Tasks:
- [ ] Complete UI implementation (controls.js)
  - Wire up voice button (hold to speak)
  - Wire up capture button
  - Connect all modules
  - Handle event flow
- [ ] Integrate all modules in main.js
  - Initialize all systems
  - Handle initialization errors
  - Set up app state
- [ ] Polish interface
  - Smooth animations
  - Loading states
  - Error messages
- [ ] Test end-to-end flow
- [ ] Record demo video (1-2 minutes)
  - Scene 1: Environment awareness
  - Scene 2: Text reading
  - Scene 3: Navigation
- [ ] Write final README
- [ ] Handle submission to portal

### Files:
- `src/modules/ui/controls.js`
- `src/main.js`
- `index.html`
- `styles/main.css`
- `README.md`

### Success Criteria:
✅ All modules connected and working  
✅ Smooth user experience  
✅ Demo video recorded  
✅ Submission complete on time  

---

## 🔄 Integration Points

### Between Role 1 & 4:
- Voice button triggers mic.js functions
- Audio blob passed to stt.js
- Response text sent to tts.js

### Between Role 2 & 4:
- Capture button triggers camera.js
- Base64 image passed to vision_agent.js
- Vision data stored in controls.js

### Between Role 3 & 4:
- controls.js calls orchestrate() with transcript + vision
- orchestrator.js returns response text
- controls.js passes to TTS

### Between Role 2 & 3:
- Vision JSON structure must match orchestrator expectations
- Scene data enriches LLM context

## 📅 Timeline Checkpoints

**7:20 PM** - First Integration Check
- Each role should have working module
- Test individual components

**8:10 PM** - Full Integration Check
- All modules connected
- End-to-end flow working

**8:40 PM** - Polish Complete
- Demo scenarios tested
- UI polished

**9:10 PM** - Submission Ready
- Video recorded
- README updated
- Repo clean
