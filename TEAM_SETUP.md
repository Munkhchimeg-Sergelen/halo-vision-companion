# 🚀 Team Setup Guide - Halo Vision Companion

## Quick Setup (5 Minutes)

### 1. Clone & Install
```bash
git clone https://github.com/Munkhchimeg-Sergelen/halo-vision-companion.git
cd halo-vision-companion
npm install
cp .env.example .env
```

### 2. Get API Keys

#### ElevenLabs:
1. Discord: https://discord.com/invite/VnBvbbcdEC
2. Channel: #🎟️│coupon-codes → Redeem coupon
3. Go to: https://elevenlabs.io/app/settings/api-keys
4. Create key with: Text to Speech, Speech to Text, Agents (Write)
5. Copy key

#### OpenAI:
1. Go to: https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key
4. Add $5-10 credits to account

### 3. Add Keys to `.env`
```bash
nano .env  # or code .env
```

Add your keys:
```env
VITE_ELEVENLABS_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
```

### 4. Test Setup
```bash
npm run dev
```
Should open http://localhost:5173

---

## 👥 Pick Your Role & Create Branch

### Role 1: Voice Pipeline Engineer
```bash
git checkout -b feature/voice-pipeline
```

**Your Files:**
- `src/modules/voice/mic.js` - Microphone capture
- `src/modules/voice/stt.js` - ElevenLabs Speech-to-Text
- `src/modules/voice/tts.js` - ElevenLabs Text-to-Speech

**Your Tasks:**
- [ ] Implement mic capture with MediaRecorder
- [ ] Integrate ElevenLabs STT API
- [ ] Integrate ElevenLabs TTS API
- [ ] Handle audio playback
- [ ] Target: < 2 second latency

**Key TODOs:** Search for `TODO` in your 3 files

---

### Role 2: Vision & Scene Understanding Engineer
```bash
git checkout -b feature/vision
```

**Your Files:**
- `src/modules/vision/camera.js` - Camera frame capture
- `src/modules/vision/vision_agent.js` - OpenAI Vision API

**Your Tasks:**
- [ ] Implement camera access via getUserMedia
- [ ] Capture frames to canvas → base64
- [ ] Integrate OpenAI Vision API
- [ ] Extract scene descriptions
- [ ] Implement OCR for text reading
- [ ] Structure JSON output

**Key TODOs:** Search for `TODO` in your 2 files

---

### Role 3: Navigation & Agent Logic Engineer
```bash
git checkout -b feature/agent-logic
```

**Your Files:**
- `src/modules/agent/orchestrator.js` - Main brain
- `src/modules/agent/prompts.js` - System prompts

**Your Tasks:**
- [ ] Refine system prompts (can do now!)
- [ ] Implement orchestrator logic
- [ ] Combine STT + Vision inputs
- [ ] Call OpenAI Chat API
- [ ] Manage conversation history
- [ ] Handle navigation logic
- [ ] Intent detection

**Key TODOs:** Search for `TODO` in your 2 files

---

### Role 4: Integration, Frontend & Demo Engineer
```bash
git checkout -b feature/ui-integration
```

**Your Files:**
- `src/modules/ui/controls.js` - Event handlers
- `src/main.js` - App initialization
- `index.html` - Main UI
- `styles/main.css` - Styling

**Your Tasks:**
- [ ] Wire up voice button (hold to speak)
- [ ] Wire up capture button
- [ ] Connect all modules together
- [ ] Handle initialization
- [ ] Display status updates
- [ ] Show transcript log
- [ ] Error handling
- [ ] Record demo video (1-2 min)
- [ ] Final README update
- [ ] Submit to portal

**Key TODOs:** Search for `TODO` in your files

---

## ⏰ Timeline

| Time | Milestone |
|------|-----------|
| **6:30 PM** | Start coding! Uncomment TODOs |
| **7:20 PM** | First integration check - modules working |
| **8:10 PM** | Full end-to-end working |
| **8:40 PM** | Polish & features complete |
| **9:10 PM** | Demo recorded, submission ready |
| **9:30 PM** | SUBMIT! |

---

## 🎬 Demo Scenarios to Test

1. **Scene Description**
   - User: "What's around me?"
   - Agent describes environment

2. **Text Reading**
   - Capture image with text
   - User: "Read this for me"
   - Agent reads text

3. **Navigation**
   - Capture scene
   - User: "Guide me to the door"
   - Agent provides directions

---

## 🔄 Git Workflow

### During Development
```bash
# Work on your files
git add .
git commit -m "Implemented STT integration"
git push origin your-branch-name
```

### Integration (Role 4 leads)
```bash
git checkout main
git pull origin main
git merge feature/voice-pipeline
git merge feature/vision
git merge feature/agent-logic
git merge feature/ui-integration
# Resolve conflicts
git push origin main
```

---

## 📚 Important Files to Read

- `docs/TEAM_ROLES.md` - Detailed role breakdown
- `docs/ARCHITECTURE.md` - System design
- `QUICKSTART.md` - Complete guide
- Your module files - Read all TODO comments!

---

## 🆘 Need Help?

- Discord: https://discord.com/invite/VnBvbbcdEC
- Channel: #support-chat
- Check docs/ folder
- Ask your teammates!

---

## 🏆 Let's Win This!

**Remember:** 
- Build from scratch (no working code before 6:30 PM)
- Use TODOs as your guide
- Test your module independently first
- Communicate with team constantly
- Have fun! 🎉

Good luck team! 🇭🇺
