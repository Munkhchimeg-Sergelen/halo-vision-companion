# 🚀 Quick Start Guide

## Pre-Hackathon Setup (Do This NOW)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:
```env
VITE_ELEVENLABS_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
VITE_ELEVENLABS_VOICE_ID=optional_voice_id
```

### 3. Get API Keys

**ElevenLabs**:
1. Go to https://elevenlabs.io
2. Sign up / log in
3. Get API key from settings
4. Redeem hackathon credits if available

**OpenAI**:
1. Go to https://platform.openai.com
2. Sign up / log in
3. Create API key
4. Add credits to account

### 4. Test APIs (Outside Project)
- Test ElevenLabs in their playground
- Test OpenAI Vision in their playground
- DO NOT write working code yet - just verify keys work

### 5. Team Setup
Each member should:
```bash
# Clone or pull the repo
git pull

# Create your feature branch
git checkout -b feature/your-role

# Install dependencies
npm install
```

---

## At 6:30 PM - START CODING!

### Development Server
```bash
npm run dev
```

This will start Vite dev server (usually at http://localhost:5173)

### Workflow

1. **Work on your module** (see `docs/TEAM_ROLES.md`)
2. **Uncomment TODO sections** in your files
3. **Implement the logic** between TODOs
4. **Test your module** independently
5. **Commit frequently**:
   ```bash
   git add .
   git commit -m "Implemented STT module"
   git push origin your-branch
   ```

### Integration at 7:20 PM

Role 4 leads integration:
```bash
git checkout main
git merge feature/voice-pipeline
git merge feature/vision
git merge feature/agent-logic
git merge feature/ui-integration
# Resolve conflicts if any
```

Test end-to-end flow!

---

## File Structure

```
halo-vision-companion/
├── src/
│   ├── modules/
│   │   ├── voice/          ← Role 1
│   │   │   ├── mic.js
│   │   │   ├── stt.js
│   │   │   └── tts.js
│   │   ├── vision/         ← Role 2
│   │   │   ├── camera.js
│   │   │   └── vision_agent.js
│   │   ├── agent/          ← Role 3
│   │   │   ├── orchestrator.js
│   │   │   └── prompts.js
│   │   └── ui/             ← Role 4
│   │       └── controls.js
│   └── main.js             ← Role 4
├── index.html              ← Role 4
├── styles/main.css         ← Role 4
└── docs/
    ├── ARCHITECTURE.md
    └── TEAM_ROLES.md
```

---

## Testing Checklist

### Voice Module (Role 1)
- [ ] Microphone permission granted
- [ ] Audio recording works
- [ ] STT returns text
- [ ] TTS plays audio
- [ ] End-to-end < 2 seconds

### Vision Module (Role 2)
- [ ] Camera permission granted
- [ ] Frame capture works
- [ ] Vision API returns JSON
- [ ] Scene descriptions accurate
- [ ] OCR reads text

### Agent Module (Role 3)
- [ ] Orchestrator combines inputs
- [ ] LLM generates responses
- [ ] Intent detection works
- [ ] Navigation logic clear
- [ ] Conversation history maintained

### UI Integration (Role 4)
- [ ] Hold-to-speak button works
- [ ] Capture button works
- [ ] Status updates show
- [ ] Transcript logs messages
- [ ] Error handling works

---

## Demo Scenarios

### Scenario 1: Environment Awareness
1. Hold speak button
2. Say: "Halo, what's around me?"
3. Release button
4. *Halo describes the scene*

### Scenario 2: Text Reading
1. Point camera at text/label
2. Click capture
3. Hold speak button
4. Say: "Read this for me"
5. Release button
6. *Halo reads the text*

### Scenario 3: Navigation
1. Click capture
2. Hold speak button
3. Say: "Guide me to the door"
4. Release button
5. *Halo provides directions*

---

## Common Issues

### CORS Errors
- APIs should work from localhost
- If issues, check API key format

### Microphone Not Working
- Check browser permissions
- Try HTTPS or localhost only

### Camera Not Working
- Check browser permissions
- Ensure getUserMedia supported

### API Rate Limits
- ElevenLabs: Monitor usage
- OpenAI: Stay under limits

---

## Useful Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check git status
git status

# View git log
git log --oneline

# Create new branch
git checkout -b feature/my-feature
```

---

## Resources

- **ElevenLabs Docs**: https://elevenlabs.io/docs
- **OpenAI Vision**: https://platform.openai.com/docs/guides/vision
- **OpenAI Chat**: https://platform.openai.com/docs/guides/chat
- **Vite Docs**: https://vitejs.dev
- **MDN Web APIs**: https://developer.mozilla.org/en-US/docs/Web/API

---

## Emergency Contacts

- Team Lead: [Add contact]
- Backup: [Add contact]
- Discord: [Add server link]

---

**Good luck! Build something amazing! 🌟**
