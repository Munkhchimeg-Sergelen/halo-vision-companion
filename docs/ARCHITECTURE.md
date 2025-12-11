# Architecture Overview

## System Flow

```
User Speech → Mic → STT → Orchestrator → TTS → Speaker
                              ↑
Camera → Vision API ──────────┘
```

## Module Breakdown

### Voice Pipeline (Role 1)
- **mic.js**: Captures audio from microphone using MediaRecorder API
- **stt.js**: ElevenLabs Speech-to-Text integration
- **tts.js**: ElevenLabs Text-to-Speech integration

### Vision Module (Role 2)
- **camera.js**: Camera frame capture via getUserMedia
- **vision_agent.js**: OpenAI Vision API integration for scene analysis and OCR

### Agent Logic (Role 3)
- **orchestrator.js**: Main decision-making logic and LLM integration
- **prompts.js**: System prompts and instruction templates

### UI Layer (Role 4)
- **controls.js**: Event handlers and integration of all modules
- **index.html**: Main interface with buttons and transcript
- **main.css**: Styling with gradient background and modern UI

## Data Flow

1. **Voice Input**: User holds button → mic captures → STT converts → text
2. **Vision Input**: User taps capture → camera grabs frame → Vision analyzes → JSON
3. **Processing**: Orchestrator combines inputs → LLM reasons → generates response
4. **Voice Output**: Response text → TTS converts → audio plays

## API Integration Points

### ElevenLabs
- **STT Endpoint**: `https://api.elevenlabs.io/v1/speech-to-text`
- **TTS Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Authentication**: `xi-api-key` header

### OpenAI
- **Vision Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-4-vision-preview` for vision, `gpt-4` for orchestration
- **Authentication**: Bearer token

## State Management

Global state in `main.js`:
```javascript
{
    isRecording: boolean,
    currentTranscript: string,
    lastVisionData: object,
    conversationHistory: array,
    initialized: boolean
}
```

## Error Handling

Each module includes:
- Try-catch blocks for API calls
- User-friendly error messages
- Graceful degradation if a module fails

## Performance Considerations

- **Latency Target**: < 2 seconds end-to-end
- **Audio Format**: WebM for browser compatibility
- **Image Resolution**: 1280x720 optimal for Vision API
- **Conversation History**: Limit to last 10 messages to manage token usage
