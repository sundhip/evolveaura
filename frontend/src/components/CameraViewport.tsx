"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../lib/api';
import { audioEngine } from '../lib/AudioEngine';

interface CameraViewportProps {
  userQuestId: string;
  questTitle: string;
  questPath: string; // SCHOLAR, WARRIOR, SAGE, CREATOR
  onClose: () => void;
  onVerifySuccess: (xpGained: number, streak: number, shadowExtracted: boolean) => void;
  onCapture?: (dataUrl: string, objectName: string) => void;
}

export default function CameraViewport({ userQuestId, questTitle, questPath, onClose, onVerifySuccess, onCapture }: CameraViewportProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [detectedObject, setDetectedObject] = useState<string>('Searching...');
  const [confidence, setConfidence] = useState<number>(0);
  const [lockProgress, setLockProgress] = useState<number>(0); // 0 to 100% over 3s
  const [isCaptured, setIsCaptured] = useState<boolean>(false);
  const [capturedImg, setCapturedImg] = useState<string | null>(null);
  const [timeoutSeconds, setTimeoutSeconds] = useState<number>(60);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Challenge items based on quest path
  const expectedObjects = questPath === 'WARRIOR' 
    ? ["dumbbell", "sports ball", "backpack", "running_shoe"]
    : ["book", "notebook", "laptop", "keyboard", "pen"];

  // 1. Initialize camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 } 
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraPermission('granted');
      } catch (err) {
        console.warn('Camera access denied or unavailable, using simulator fallback', err);
        setCameraPermission('denied');
      }
    }
    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 2. Timeout Countdown (60 seconds)
  useEffect(() => {
    if (isCaptured) return;
    if (timeoutSeconds <= 0) {
      // Trigger timeout alert and close
      audioEngine.playMidnightDrop(); // Low warning alarm pulse tone
      alert(`[Warning: Camera Timeout] The system timed out without detecting a matching object for the ${questPath} path. Make sure your workspace is clearly visible.`);
      onClose();
      return;
    }
    const timer = setTimeout(() => setTimeoutSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeoutSeconds, isCaptured]);

  // 3. Simulated real-time AI object detection loop
  useEffect(() => {
    if (isCaptured) return;

    // Pick a random target object
    const targetObj = expectedObjects[Math.floor(Math.random() * expectedObjects.length)];
    let ticks = 0;
    let lockPct = 0;

    const interval = setInterval(() => {
      ticks++;

      // Scanning phase: first 10 ticks (3 seconds)
      if (ticks < 10) {
        const simulatedConf = Math.floor(Math.random() * 30) + 40; // 40% to 70%
        setConfidence(simulatedConf);
        setDetectedObject('Scanning...');
        lockPct = Math.max(0, lockPct - 15);
        setLockProgress(lockPct);
      } else {
        // Target found phase: confidence stays >= 88% continuously
        const simulatedConf = Math.floor(Math.random() * 10) + 88; // 88% to 98%
        setConfidence(simulatedConf);
        setDetectedObject(targetObj);

        lockPct = Math.min(100, lockPct + 10); // increments by 10% every 300ms
        setLockProgress(lockPct);

        if (lockPct >= 100) {
          clearInterval(interval);
          handleCapture(targetObj);
        }
      }
    }, 300);

    return () => clearInterval(interval);
  }, [cameraPermission, isCaptured]);

  // 4. Capture Frame & Stylize
  const handleCapture = (objectName: string) => {
    setIsCaptured(true);
    audioEngine.playVerifyInit(); // play capture shutter sound/chirp

    // Draw frame to canvas and apply high-contrast dark slate filters
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw video or simulated canvas placeholder
        let drawn = false;
        if (cameraPermission === 'granted' && video && video.readyState >= 2) {
          try {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            drawn = true;
          } catch (e) {
            console.warn("Failed to draw video frame onto canvas:", e);
          }
        }

        if (!drawn) {
          // Draw a cool grid placeholder in case camera is simulated or failed
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          for (let i = 0; i < canvas.width; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let i = 0; i < canvas.height; i += 40) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
          }

          // Text marker
          ctx.fillStyle = '#8B5CF6';
          ctx.font = 'bold 16px monospace';
          ctx.fillText(`SIMULATED OBJECT: ${objectName.toUpperCase()}`, 40, canvas.height / 2);
        }

        // Apply Slate Overlay filter styling
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Burn secure hash string to bottom corner
        ctx.fillStyle = '#60A5FA';
        ctx.font = '10px monospace';
        const timestamp = new Date().toISOString();
        const secureHash = `[EVOLVEAURA SYSTEM SECURE_HASH_VALID] - ${timestamp}`;
        ctx.fillText(secureHash, 15, canvas.height - 15);

        // Save as base64 data url
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImg(dataUrl);
        
        // Save to Record of Trials in localStorage for the grid gallery
        const existingTrials = JSON.parse(localStorage.getItem('record_of_trials') || '[]');
        existingTrials.unshift({
          id: Math.random().toString(),
          questTitle,
          questPath,
          timestamp,
          image: dataUrl
        });
        localStorage.setItem('record_of_trials', JSON.stringify(existingTrials.slice(0, 12))); // cap at 12 records
        
        // Trigger verification submit
        if (onCapture) {
          onCapture(dataUrl, objectName);
        } else {
          submitVerification(objectName);
        }
      }
    }
  };

  // 5. Submit to Backend
  const submitVerification = async (objectName: string) => {
    setIsVerifying(true);
    setErrorMsg(null);
    try {
      // Create session first
      const session = await apiRequest('/verification/create', {
        method: 'POST',
        body: JSON.stringify({ userQuestId })
      });

      // Submit classification match
      const submitRes = await apiRequest('/verification/submit', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: session.id,
          objectResult: objectName,
          devBypass: false
        })
      });

      audioEngine.playQuestClear(); // Play quest clear boot chime
      onVerifySuccess(submitRes.xpGained, submitRes.streak, submitRes.shadowExtracted);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Try again.');
      audioEngine.playMidnightDrop(); // Warning buzzer
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div id="camera-viewport-modal" className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] text-[9px] font-bold uppercase tracking-wider font-mono">
              System Verification Target
            </span>
            <h3 className="text-white font-extrabold text-sm mt-0.5 leading-relaxed truncate max-w-xs">{questTitle}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Frame */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          {cameraPermission === 'granted' && !isCaptured ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : isCaptured ? (
            capturedImg && (
              <img src={capturedImg} alt="Capture proof" className="absolute inset-0 w-full h-full object-cover border-4 border-emerald-500/25" />
            )
          ) : (
            <div className="text-center p-6 space-y-3">
              <Camera className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
              <p className="text-xs text-slate-400 font-mono">Simulator Sandbox Feed Active</p>
            </div>
          )}

          {/* Real-time Bounding Box Visual Overlay */}
          {!isCaptured && (
            <div className="absolute inset-6 border border-dashed border-[#8B5CF6]/40 pointer-events-none rounded-xl flex items-center justify-center">
              <div id="ai-bounding-box-overlay" className={`absolute w-48 h-48 border-2 transition-all duration-300 rounded-lg flex flex-col justify-between p-2 ${
                confidence >= 85 
                  ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] bg-emerald-500/5' 
                  : 'border-[#8B5CF6] bg-slate-900/10'
              }`}>
                <div className="flex justify-between items-start text-[9px] font-mono font-bold leading-none">
                  <span className={`${confidence >= 85 ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#8B5CF6] bg-[#8B5CF6]/15'} px-1.5 py-0.5 rounded`}>
                    {detectedObject}
                  </span>
                  <span className={`${confidence >= 85 ? 'text-emerald-400 bg-emerald-500/10' : 'text-[#8B5CF6] bg-[#8B5CF6]/15'} px-1.5 py-0.5 rounded`}>
                    {confidence}%
                  </span>
                </div>

                {/* Progress bar of lock-on */}
                {confidence >= 85 && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[7px] text-emerald-400 font-mono font-bold uppercase">
                      <span>LOCKING SECURE TRIAL...</span>
                      <span>{lockProgress}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${lockProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overlay Status info */}
          {!isCaptured && (
            <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg p-2 font-mono text-[9px] text-slate-400 space-y-0.5 pointer-events-none">
              <div>Path: {questPath}</div>
              <div>Scan Targets: {expectedObjects.join(', ')}</div>
              <div>Timeout: {timeoutSeconds}s</div>
            </div>
          )}
        </div>

        {/* Action / Result Bar */}
        <div className="p-6 bg-slate-900/90 border-t border-slate-800/80 space-y-4">
          {isCaptured ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                {isVerifying ? (
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                ) : errorMsg ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <Check className="w-5 h-5 text-emerald-400" />
                )}
                <div className="text-xs font-mono">
                  {isVerifying && <p className="text-white font-bold">Verifying Secure Matrix Hash...</p>}
                  {errorMsg && <p className="text-red-400 font-bold">Verification Failed: {errorMsg}</p>}
                  {!isVerifying && !errorMsg && <p className="text-emerald-400 font-bold">Trial Successfully Verified!</p>}
                  <p className="text-slate-500 text-[10px] mt-0.5">Hash burned: [EVOLVEAURA SYSTEM SECURE_HASH_VALID]</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                {errorMsg && (
                  <button 
                    onClick={() => {
                      setIsCaptured(false);
                      setCapturedImg(null);
                      setLockProgress(0);
                    }}
                    className="flex-1 py-3 bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Recapture Frame
                  </button>
                )}
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer text-center"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                Scanning workspace for verification targets. Keep the matching items (e.g. <strong>{expectedObjects.join(' / ')}</strong>) inside the bounding box.
              </p>
              <div className="w-20 h-0.5 bg-slate-800 mx-auto mt-4" />
            </div>
          )}
        </div>

        {/* Hidden Canvas for Frame Processing */}
        <canvas ref={canvasRef} width={640} height={480} className="hidden" />
      </div>
    </div>
  );
}
