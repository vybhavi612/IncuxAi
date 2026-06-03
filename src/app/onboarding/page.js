"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login?role=student");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.faceData) {
      router.push("/dashboard/student");
      return;
    }
    setUser(parsedUser);
    startCamera();

    return () => {
      stopCamera();
    };
  }, [router]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const savePhoto = async () => {
    if (!user || !capturedImage) return;
    setLoading(true);

    try {
      const res = await fetch("/api/user/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, faceData: capturedImage }),
      });

      if (!res.ok) throw new Error("Failed to save face data");

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard/student");
    } catch (err) {
      console.error(err);
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ marginTop: '5vh' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="mb-2">Setup Facial Recognition</h2>
        <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
          Please position your face in the camera and capture to complete registration.
        </p>

        <div style={{ position: 'relative', width: '100%', maxWidth: '400px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000' }}>
          {!capturedImage ? (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          ) : (
            <img 
              src={capturedImage} 
              alt="Captured face" 
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          {!capturedImage ? (
             <button className="btn btn-primary" onClick={capturePhoto}>Capture Photo</button>
          ) : (
             <>
               <button className="btn glass-panel" style={{ padding: '0.75rem 1.5rem' }} onClick={retakePhoto} disabled={loading}>Retake</button>
               <button className="btn btn-primary" onClick={savePhoto} disabled={loading}>
                 {loading ? "Saving..." : "Save & Continue"}
               </button>
             </>
          )}
        </div>
      </div>
    </main>
  );
}
