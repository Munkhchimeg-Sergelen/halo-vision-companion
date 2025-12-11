import { useState, useRef, useEffect } from 'react';
import './App.css';

// Import real modules
import { startRecording, stopRecording } from './modules/voice/mic.js';
import { transcribeAudio } from './modules/voice/stt.js';
import { speak } from './modules/voice/tts.js';
import { captureFrame } from './modules/vision/camera.js';
import { analyzeScene } from './modules/vision/vision_agent.js';
import { orchestrate } from './modules/agent/orchestrator.js';

function SimpleApp() {
  const [showCamera, setShowCamera] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [status, setStatus] = useState('Ready to help you see the world');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const recordingRef = useRef(false);

  // Initialize video element on mount
  useEffect(() => {
    console.log('App mounted, video ref:', videoRef.current);
  }, []);

  // Conversation handlers - REAL IMPLEMENTATION
  const toggleConversation = async () => {
    if (!isConversationActive) {
      await startConversation();
    } else {
      await stopConversation();
    }
  };

  const startConversation = async () => {
    try {
      setIsConversationActive(true);
      setStatus('🎤 Listening... Speak now');
      recordingRef.current = true;
      
      // Start recording
      await startRecording();
      
      // Auto-stop after 10 seconds (or user can click to stop)
      setTimeout(async () => {
        if (recordingRef.current) {
          await stopConversation();
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ Conversation failed:', error);
      setStatus('❌ Error: ' + error.message);
      setIsConversationActive(false);
    }
  };

  const stopConversation = async () => {
    try {
      recordingRef.current = false;
      setStatus('⏳ Processing your voice...');
      
      // Stop recording and get audio
      const audioBlob = await stopRecording();
      
      // Transcribe audio
      setStatus('🎧 Converting speech to text...');
      const transcript = await transcribeAudio(audioBlob);
      console.log('Transcript:', transcript);
      
      if (!transcript) {
        setStatus('❌ Could not understand. Try again.');
        setIsConversationActive(false);
        return;
      }
      
      // Get AI response
      setStatus('🧠 Thinking...');
      const response = await orchestrate(transcript);
      
      // Speak response
      setStatus('🗣️ Speaking...');
      await speak(response);
      
      setStatus('✅ Ready to help');
      setIsConversationActive(false);
      
    } catch (error) {
      console.error('❌ Stop conversation failed:', error);
      setStatus('❌ Error: ' + error.message);
      setIsConversationActive(false);
    }
  };

  // Camera handlers
  const handleCameraClick = async () => {
    if (!showCamera) {
      await openCamera();
    } else {
      await capturePhoto();
    }
  };

  const openCamera = async () => {
    console.log('🎥 Opening camera...');
    setStatus('📷 Opening camera...');
    
    try {
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user' 
        } 
      });
      console.log('✅ Got stream:', stream);
      console.log('📹 Stream active:', stream.active);
      
      streamRef.current = stream;
      
      // Attach to video element
      if (videoRef.current) {
        console.log('📺 Video element found:', videoRef.current);
        videoRef.current.srcObject = stream;
        
        // Force play
        try {
          await videoRef.current.play();
          console.log('▶️ Video playing!');
        } catch (playErr) {
          console.error('Play error:', playErr);
        }
      } else {
        console.error('❌ Video ref is null!');
      }
      
      // Show the video
      setShowCamera(true);
      setStatus('📷 Live camera - Click to capture');
      console.log('✅ Camera opened successfully');
      
    } catch (err) {
      console.error('❌ Camera error:', err);
      alert('Camera error: ' + err.message);
      setStatus('❌ Camera error');
    }
  };

  const capturePhoto = async () => {
    try {
      console.log('📸 Capturing photo...');
      setStatus('📸 Capturing scene...');
      
      // Capture frame using real camera module
      const base64Image = await captureFrame();
      
      if (!base64Image) {
        setStatus('❌ Failed to capture image');
        return;
      }
      
      console.log('✅ Photo captured');
      
      // Analyze with real vision AI
      setStatus('👁️ Analyzing scene with AI...');
      const visionData = await analyzeScene(base64Image);
      
      console.log('Vision analysis:', visionData);
      
      // Get spoken description from orchestrator
      setStatus('🧠 Generating description...');
      const description = await orchestrate('Describe what you see', visionData);
      
      // Speak the description
      setStatus('🗣️ Describing scene...');
      await speak(description);
      
      setStatus('📷 Camera ready - Click to capture again');
      
    } catch (error) {
      console.error('❌ Capture failed:', error);
      setStatus('❌ Error: ' + error.message);
    }
  };

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Half - Conversation Button */}
      <button 
        onClick={toggleConversation}
        style={{
          width: '100%',
          height: '50vh',
          background: isConversationActive 
            ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
          border: 'none',
          color: 'white',
          fontSize: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1,
          position: 'relative',
          boxShadow: isConversationActive ? '0 -8px 32px rgba(99, 102, 241, 0.4)' : 'none'
        }}
      >
        <div style={{ 
          fontSize: '96px', 
          marginBottom: '24px',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          animation: isConversationActive ? 'pulse 2s infinite' : 'none'
        }}>💬</div>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: '700',
          letterSpacing: '-0.5px',
          marginBottom: '8px'
        }}>
          {isConversationActive ? 'Listening...' : 'Talk to Halo'}
        </div>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '500',
          opacity: 0.9,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {isConversationActive ? 'Tap to stop' : 'Tap to start'}
        </div>
      </button>

      {/* Bottom Half - Camera Button */}
      <button 
        onClick={handleCameraClick}
        style={{
          width: '100%',
          height: '50vh',
          background: showCamera
            ? 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)'
            : 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
          border: 'none',
          color: 'white',
          fontSize: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: showCamera ? 600 : 1,
          boxShadow: showCamera ? '0 8px 32px rgba(236, 72, 153, 0.4)' : 'none'
        }}
      >
        <div style={{ 
          fontSize: '96px', 
          marginBottom: '24px',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
          transform: showCamera ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.3s'
        }}>📷</div>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: '700',
          letterSpacing: '-0.5px',
          marginBottom: '8px'
        }}>
          {showCamera ? 'Take Picture' : 'Open Camera'}
        </div>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '500',
          opacity: 0.9,
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {showCamera ? 'Tap to capture' : 'Tap to view'}
        </div>
      </button>

      {/* Status Overlay */}
      <div style={{
        position: 'fixed',
        top: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '100px',
        fontSize: '15px',
        zIndex: 1000,
        fontWeight: '600',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        maxWidth: '90%',
        textAlign: 'center'
      }}>
        {status}
      </div>

      {/* Video element - ALWAYS in DOM */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50vh',
          objectFit: 'cover',
          background: '#000',
          zIndex: 500,
          display: showCamera ? 'block' : 'none',
          transition: 'opacity 0.3s',
          opacity: showCamera ? 1 : 0
        }}
      />

      {/* Modern camera overlay - only show when camera active */}
      {showCamera && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50vh',
          zIndex: 501,
          pointerEvents: 'none'
        }}>
          {/* Viewfinder frame */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '75%',
            border: '4px solid rgba(255, 255, 255, 0.9)',
            borderRadius: '24px',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4), inset 0 0 40px rgba(255, 255, 255, 0.1)',
            animation: 'fadeIn 0.3s'
          }}>
            {/* Corner accents */}
            <div style={{ position: 'absolute', top: '-4px', left: '-4px', width: '40px', height: '40px', borderTop: '6px solid #ec4899', borderLeft: '6px solid #ec4899', borderRadius: '24px 0 0 0' }} />
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '40px', height: '40px', borderTop: '6px solid #ec4899', borderRight: '6px solid #ec4899', borderRadius: '0 24px 0 0' }} />
            <div style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '40px', height: '40px', borderBottom: '6px solid #ec4899', borderLeft: '6px solid #ec4899', borderRadius: '0 0 0 24px' }} />
            <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '40px', height: '40px', borderBottom: '6px solid #ec4899', borderRight: '6px solid #ec4899', borderRadius: '0 0 24px 0' }} />
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default SimpleApp;
