"use client"

import React, { useRef, useState, useEffect } from "react"
import { Camera, RefreshCw, Upload, CheckCircle2, AlertCircle } from "lucide-react"

interface WebcamCaptureProps {
  onCaptureComplete: (imageUrl: string) => void
}

export function WebcamCapture({ onCaptureComplete }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [permissionState, setPermissionState] = useState<"prompt" | "granted" | "denied">("prompt")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUsingFileFallback, setIsUsingFileFallback] = useState(false)

  // Start webcam
  const startCamera = async () => {
    setErrorMessage(null)
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false
      })
      
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setPermissionState("granted")
    } catch (err: any) {
      console.error("Camera access error:", err)
      setPermissionState("denied")
      setErrorMessage("Could not access camera. Please grant permissions or use the file upload fallback.")
    }
  }

  useEffect(() => {
    if (!isUsingFileFallback) {
      startCamera()
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isUsingFileFallback])

  // Capture photo from video
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")
      
      if (context) {
        // Set canvas dimensions equal to video display size
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        
        // Draw the video frame onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        // Convert canvas image to base64 Data URL (JPEG format for small size)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
        setCapturedImage(dataUrl)
        
        // Stop stream after capture
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
        }
      }
    }
  }

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null)
    setIsUsingFileFallback(false)
    startCamera()
  }

  // Handle local file upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Submit/Save the photo to the database
  const savePhoto = async () => {
    if (!capturedImage) return
    setIsUploading(true)
    setErrorMessage(null)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to save photo")
      }

      onCaptureComplete(data.imageUrl)
    } catch (err: any) {
      console.error("Save photo error:", err)
      setErrorMessage(err.message || "Failed to save photo. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 max-w-md w-full mx-auto relative overflow-hidden border border-white/10">
      {/* Cyberpunk Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.15)_50%,rgba(0,0,0,0.15))] bg-[size:100%_4px] opacity-25"></div>

      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 mb-2">
          Biometric Verification
        </h2>
        <p className="text-xs text-slate-400 text-center mb-6">
          Please verify your identity. Capture your face to initialize your daily session.
        </p>

        {/* Video feed / Photo preview */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5 shadow-inner flex items-center justify-center">
          {capturedImage ? (
            // Preview Captured Image
            <img 
              src={capturedImage} 
              alt="Verification profile" 
              className="w-full h-full object-cover"
            />
          ) : isUsingFileFallback ? (
            // File upload placeholder
            <div className="flex flex-col items-center p-6 text-center text-slate-400">
              <Upload className="w-12 h-12 mb-3 text-indigo-400 animate-pulse" />
              <p className="text-sm font-medium mb-1">Upload Profile Photo</p>
              <p className="text-xs text-slate-500 mb-4">Drag and drop or browse from folder</p>
              <label className="px-4 py-2 bg-indigo-600/35 border border-indigo-500/30 text-indigo-200 text-xs rounded-lg hover:bg-indigo-600/50 cursor-pointer transition">
                Browse Files
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          ) : permissionState === "granted" ? (
            // Active Webcam stream
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]" // mirror effect
              />
              {/* Biometric overlay box */}
              <div className="absolute inset-4 border-2 border-dashed border-emerald-500/40 rounded-lg pointer-events-none flex items-center justify-center">
                <span className="text-[10px] text-emerald-400/60 uppercase tracking-widest font-mono bg-slate-950/70 px-2 py-0.5 rounded border border-emerald-500/20">
                  Align Face
                </span>
              </div>
            </>
          ) : (
            // Prompting / Loading
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <Camera className="w-12 h-12 mb-3 text-indigo-400/70 animate-spin" style={{ animationDuration: '3s' }} />
              <p className="text-sm mb-1">Awaiting Camera Authorization...</p>
              <button 
                onClick={startCamera}
                className="mt-4 px-4 py-2 bg-indigo-600/40 border border-indigo-500/30 text-indigo-200 text-xs rounded-lg hover:bg-indigo-600/60 transition"
              >
                Allow Access
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 bg-rose-950/40 border border-rose-500/20 p-3 rounded-lg text-rose-300 text-xs w-full">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Buttons Controls */}
        <div className="mt-6 flex gap-3 w-full justify-center">
          {capturedImage ? (
            // Verification State Controls
            <>
              <button
                onClick={retakePhoto}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800/80 border border-white/5 hover:bg-slate-700/80 text-slate-200 text-sm font-medium rounded-xl transition cursor-pointer"
                disabled={isUploading}
              >
                <RefreshCw className="w-4 h-4" />
                Retake
              </button>
              <button
                onClick={savePhoto}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-sm font-semibold rounded-xl shadow-lg shadow-emerald-950/20 transition cursor-pointer disabled:opacity-50"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save & Check-in
                  </>
                )}
              </button>
            </>
          ) : (
            // Stream state controls
            <>
              {!isUsingFileFallback && permissionState === "granted" && (
                <button
                  onClick={capturePhoto}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/30 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Capture Verification
                </button>
              )}
              {permissionState === "denied" && !isUsingFileFallback && (
                <button
                  onClick={() => setIsUsingFileFallback(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800/60 border border-white/5 hover:bg-slate-700/60 text-slate-200 text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Use Photo File Instead
                </button>
              )}
              {isUsingFileFallback && (
                <button
                  onClick={retakePhoto}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-800/60 border border-white/5 hover:bg-slate-700/60 text-slate-200 text-sm font-semibold rounded-xl transition cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  Use Camera Instead
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
