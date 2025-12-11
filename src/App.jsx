import { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState('Ready');
  const [conversationStatus, setConversationStatus] = useState('Click to begin');
  const [cameraStatus, setCameraStatus] = useState('Take a photo');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Don't initialize camera on mount - wait for user click
  useEffect(() => {
    console.log('🎬 App mounted');
    return () => {
      // Cleanup camera on unmount
      if (streamRef.current) {
        console.log('🛑 Stopping camera stream');
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initCamera = async () => {
    try {
      console.log('📷 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      console.log('✅ Got camera stream:', stream);
      console.log('📹 Stream active:', stream.active);
      console.log('📹 Video tracks:', stream.getVideoTracks());
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('📺 Setting video srcObject');
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            console.log('📺 Video metadata loaded');
            console.log('📺 Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            resolve();
          };
        });
        
        // Play video
        await videoRef.current.play();
        console.log('▶️ Video playing');
      }
      
      console.log('✅ Camera initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Camera init failed:', error);
      return false;
    }
  };

  const handleConversationClick = async () => {
    if (!isConversationActive) {
      await startConversation();
    } else {
      await stopConversation();
    }
  };

  const startConversation = async () => {
    try {
      setIsConversationActive(true);
      setConversationStatus('Listening...');
      setStatus('🎤 Listening...');
      
      // Mock: Simulate recording for 5 seconds
      setTimeout(async () => {
        setStatus('⏳ Processing...');
        setConversationStatus('Processing...');
        
        // Mock response
        setTimeout(() => {
          const mockResponse = "Hello! I'm Halo, your vision companion. How can I help you today?";
          setStatus('🗣️ Speaking...');
          speak(mockResponse);
          
          setTimeout(() => {
            setStatus('✅ Ready');
            setConversationStatus('Click to stop');
          }, 2000);
        }, 1000);
      }, 5000);
      
    } catch (error) {
      console.error('❌ Conversation failed:', error);
      setStatus('❌ Error');
      setIsConversationActive(false);
    }
  };

  const stopConversation = () => {
    setIsConversationActive(false);
    setConversationStatus('Click to begin');
    setStatus('✅ Conversation stopped');
    setTimeout(() => setStatus('Ready'), 2000);
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCameraClick = async () => {
    if (!isCameraActive) {
      showCameraPreview();
    } else {
      await captureAndAnalyze();
    }
  };

  const showCameraPreview = async () => {
    console.log('🎥 showCameraPreview called');
    console.log('🎥 Current isCameraActive:', isCameraActive);
    setStatus('📷 Opening camera...');
    
    // Initialize camera if not already done
    const success = await initCamera();
    
    if (!success) {
      setStatus('❌ Camera access denied');
      console.error('❌ Camera initialization failed');
      return;
    }
    
    console.log('🎥 Setting isCameraActive to true');
    setIsCameraActive(true);
    setCameraStatus('Click to capture');
    setStatus('📷 Camera ready - Click to capture');
    
    // Force a check after state update
    setTimeout(() => {
      console.log('🎥 After setState - isCameraActive:', isCameraActive);
      console.log('🎥 Video element:', videoRef.current);
      console.log('🎥 Video srcObject:', videoRef.current?.srcObject);
      console.log('🎥 Video playing:', !videoRef.current?.paused);
    }, 100);
    
    console.log('✅ Camera preview shown');
  };

  const captureAndAnalyze = async () => {
    try {
      setStatus('📸 Capturing...');
      setCameraStatus('Capturing...');
      
      // Capture frame
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      if (canvas && video) {
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
      }
      
      // Hide camera
      setIsCameraActive(false);
      setCameraStatus('Take a photo');
      
      // Mock analysis
      setStatus('🔍 Analyzing...');
      setTimeout(() => {
        const mockDescription = "You are in an office space with a desk in front of you. There's a laptop on the desk and a window to your right.";
        setStatus('🗣️ Describing scene...');
        speak(mockDescription);
        
        setTimeout(() => {
          setStatus('✅ Scene captured');
        }, 3000);
      }, 1500);
      
    } catch (error) {
      console.error('❌ Capture failed:', error);
      setStatus('❌ Error');
      setIsCameraActive(false);
    }
  };

  return (
    <div className={`app-container ${isCameraActive ? 'camera-active' : ''}`}>
      {/* Conversation Button */}
      <button
        className={`half-button conversation-btn ${isConversationActive ? 'active' : ''}`}
        onClick={handleConversationClick}
        aria-label="Conversation with Halo. Click to start or stop conversation."
      >
        <div className="button-content">
          <span className="icon" role="img" aria-hidden="true">💬</span>
          <span className="label">Start Conversation</span>
          <span className="status-indicator">{conversationStatus}</span>
        </div>
      </button>

      {/* Camera Button */}
      <button
        className={`half-button camera-btn ${isCameraActive ? 'active' : ''}`}
        onClick={handleCameraClick}
        aria-label="Capture scene. Click to take a photo."
      >
        <div className="button-content">
          <span className="icon" role="img" aria-hidden="true">📷</span>
          <span className="label">{isCameraActive ? 'Capture Photo' : 'Capture Scene'}</span>
          <span className="status-indicator">{cameraStatus}</span>
        </div>
      </button>

      {/* Status Overlay */}
      <div className="status-overlay" role="status" aria-live="polite">
        <p>{status}</p>
      </div>

      {/* Camera Preview */}
      {console.log('🎥 Rendering - isCameraActive:', isCameraActive)}
      {isCameraActive && (
        <div className="camera-preview active" style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50vh',
          background: '#000',
          zIndex: 500,
          display: 'block'
        }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1
            }}
          />
          <div className="camera-overlay" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2,
            pointerEvents: 'none'
          }}>
            <div className="camera-frame" style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              height: '70%',
              border: '3px solid rgba(255, 255, 255, 0.8)',
              borderRadius: '12px',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)'
            }}></div>
          </div>
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

export default App;
