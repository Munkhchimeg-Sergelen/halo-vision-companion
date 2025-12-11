# 🚀 Halo Vision Companion - Complete Setup Guide

## ✅ Integration Complete!

All team modules have been successfully integrated:
- ✅ **Voice Pipeline** - Real ElevenLabs STT/TTS
- ✅ **Vision AI** - Real OpenAI Vision API
- ✅ **Agent Orchestrator** - Real OpenAI Chat API
- ✅ **Modern React UI** - Beautiful, accessible interface
- ✅ **Camera Integration** - Live camera feed with capture

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **API Keys** (see below)

## 🔑 Required API Keys

You need two API keys to run this app:

### 1. ElevenLabs API Key (for Voice)
- Go to: https://elevenlabs.io
- Sign up / Log in
- Navigate to: Profile → API Keys
- Copy your API key

### 2. OpenAI API Key (for Vision & Chat)
- Go to: https://platform.openai.com/api-keys
- Sign up / Log in
- Click "Create new secret key"
- Copy your API key

## ⚙️ Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Create .env File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your API keys:

```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_OPENAI_API_KEY=your_openai_key_here
VITE_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

**Note:** The voice ID is optional. Default is Adam voice.

### Step 3: Run the App

```bash
npm run dev
```

The app will open at: `http://localhost:5173`

## 🎯 How to Use

### 1. **Conversation Mode** (Top Button - Blue)
- **Click once** → Starts listening (10 seconds max)
- **Speak your question** → "What do you see?" or "Read this menu"
- **Click again** (or wait) → Stops recording
- **Wait** → AI processes and responds with voice

### 2. **Camera Mode** (Bottom Button - Pink)
- **Click once** → Opens live camera feed
- **See yourself** in bottom half with viewfinder
- **Click again** → Captures photo and analyzes scene
- **Listen** → AI describes what it sees
- **Click again** → Take another photo (camera stays on)

## 🎨 Features

### Voice Pipeline
- ✅ Real-time microphone recording
- ✅ ElevenLabs Speech-to-Text
- ✅ ElevenLabs Text-to-Speech (natural voice)
- ✅ 10-second recording window

### Vision AI
- ✅ Live camera preview
- ✅ Photo capture
- ✅ OpenAI Vision analysis
- ✅ Scene description
- ✅ Menu reading (specialized)
- ✅ Cash detection (specialized)

### Agent Orchestrator
- ✅ Context-aware responses
- ✅ Intent detection
- ✅ Conversation history
- ✅ Vision + voice integration

### UI/UX
- ✅ Modern gradient design
- ✅ Smooth animations
- ✅ Accessible (large buttons, ARIA labels)
- ✅ Real-time status updates
- ✅ Professional camera viewfinder

## 🧪 Testing

### Test Conversation:
1. Click top button
2. Say: "Hello, can you help me?"
3. Wait for response

### Test Camera:
1. Click bottom button
2. Point camera at something
3. Click again to capture
4. Listen to description

### Test Menu Reading:
1. Open camera
2. Point at a menu
3. Say: "Read this menu"
4. Listen to menu items

## 🐛 Troubleshooting

### Camera Not Working
- **Check permissions**: Browser should ask for camera access
- **Try different browser**: Chrome/Edge work best
- **Check console**: F12 → Console for errors

### Voice Not Working
- **Check API key**: Make sure VITE_ELEVENLABS_API_KEY is set
- **Check microphone**: Browser should ask for mic access
- **Check console**: Look for API errors

### AI Not Responding
- **Check API key**: Make sure VITE_OPENAI_API_KEY is set
- **Check credits**: OpenAI account needs credits
- **Check console**: Look for 401/403 errors

### "Module not found" Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📱 Mobile Deployment (Optional)

To deploy to iOS/Android:

```bash
# Build web app
npm run build

# Add mobile platforms
npx cap add ios
npx cap add android

# Sync and open
npx cap sync
npx cap open ios    # or android
```

See `MOBILE_DEPLOYMENT.md` for detailed instructions.

## 🔧 Development

### Project Structure
```
src/
  ├── SimpleApp.jsx          # Main React UI
  ├── modules/
  │   ├── voice/
  │   │   ├── mic.js         # Microphone recording
  │   │   ├── stt.js         # Speech-to-Text
  │   │   └── tts.js         # Text-to-Speech
  │   ├── vision/
  │   │   ├── camera.js      # Camera capture
  │   │   └── vision_agent.js # Vision AI
  │   └── agent/
  │       ├── orchestrator.js # Main agent
  │       └── prompts.js      # AI prompts
```

### Key Files
- `SimpleApp.jsx` - Main UI component
- `.env` - API keys (DO NOT COMMIT)
- `package.json` - Dependencies
- `vite.config.js` - Build config

## 🚀 Deployment to Production

### Option 1: Netlify
```bash
npm run build
# Drag 'dist' folder to Netlify
```

### Option 2: Vercel
```bash
npm run build
vercel --prod
```

### Option 3: GitHub Pages
```bash
npm run build
# Push 'dist' folder to gh-pages branch
```

## 📊 API Usage & Costs

### ElevenLabs
- **Free tier**: 10,000 characters/month
- **Cost**: ~$0.30 per 1,000 characters after free tier

### OpenAI
- **Vision API**: ~$0.01 per image
- **Chat API**: ~$0.002 per 1,000 tokens
- **Estimate**: ~$0.05 per conversation

## 🔐 Security Notes

- ✅ API keys are in `.env` (not committed)
- ✅ Keys are only used client-side (for demo)
- ⚠️ For production, use a backend proxy
- ⚠️ Never commit `.env` file

## 📝 Team Roles

- **Role 1**: Voice Pipeline (mic, STT, TTS)
- **Role 2**: Vision & Scene Understanding
- **Role 3**: Navigation & Agent Logic
- **Role 4**: Integration & Frontend (YOU!)

## 🎉 Success Checklist

- [ ] API keys added to `.env`
- [ ] `npm install` completed
- [ ] `npm run dev` running
- [ ] Browser opens at localhost:5173
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Conversation works (voice in/out)
- [ ] Camera works (live feed visible)
- [ ] Photo capture works
- [ ] AI describes scenes

## 🆘 Need Help?

1. Check console (F12) for errors
2. Verify API keys are correct
3. Check API credits/limits
4. Try different browser
5. Clear cache and restart

## 🎊 You're All Set!

Your Halo Vision Companion is ready to help people see the world! 🌍✨

**Next Steps:**
1. Test all features
2. Add your API keys
3. Demo to your team
4. Deploy to production
5. Submit your project!

Good luck! 🚀
