import { useEffect, useRef, useState } from "react";

export default function Camera({ onCapture }) {

  const videoRef = useRef(null);

  const canvasRef = useRef(null);

  const [stream, setStream] =
    useState(null);

  // START CAMERA
  const startCamera = async () => {

    try {

      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: true
        });

      setStream(mediaStream);

      if (videoRef.current) {

        videoRef.current.srcObject =
          mediaStream;
      }

    } catch (err) {

      console.log(err);

      alert(
        "Camera access denied"
      );
    }
  };

  // CAPTURE IMAGE
  const captureImage = () => {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    canvas.width = video.videoWidth;

    canvas.height =
      video.videoHeight;

    ctx.drawImage(
      video,
      0,
      0
    );

    const image =
      canvas.toDataURL(
        "image/png"
      );

    onCapture(image);

    stopCamera();
  };

  // STOP CAMERA
  const stopCamera = () => {

    stream?.getTracks().forEach(
      (track) => track.stop()
    );
  };

  useEffect(() => {

    return () => {

      stopCamera();
    };

  }, [stream]);

  return (

    <div>

      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={styles.video}
      />

      {/* BUTTONS */}
      <div style={styles.btnRow}>

        <button
          onClick={startCamera}
          style={styles.startBtn}
        >
          Open Camera
        </button>

        <button
          onClick={captureImage}
          style={styles.captureBtn}
        >
          Capture Image
        </button>

      </div>

      {/* HIDDEN CANVAS */}
      <canvas
        ref={canvasRef}
        style={{
          display: "none"
        }}
      />

    </div>
  );
}

const styles = {

  video: {
    width: "100%",
    borderRadius: 20,
    marginTop: 15,
    background: "black"
  },

  btnRow: {
    display: "flex",
    gap: 10,
    marginTop: 15
  },

  startBtn: {
    flex: 1,
    padding: 14,
    border: "none",
    borderRadius: 12,
    background:
      "linear-gradient(90deg,#2563eb,#3b82f6)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  },

  captureBtn: {
    flex: 1,
    padding: 14,
    border: "none",
    borderRadius: 12,
    background:
      "linear-gradient(90deg,#7c3aed,#8b5cf6)",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  }
};