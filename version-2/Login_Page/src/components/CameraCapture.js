const hCamera = React.createElement;
function CameraCapture({ photo, onCapture }) {
  const videoRef = React.useRef(null);
  const streamRef = React.useRef(null);
  const [status, setStatus] = React.useState("Camera is off");
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setStatus("Camera ready");
    } catch {
      setStatus("Camera permission is required to capture login photo.");
    }
  }
  function capturePhoto() {
    if (!videoRef.current?.srcObject) {
      setStatus("Start camera before capturing.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    onCapture(canvas.toDataURL("image/jpeg", 0.76));
    setStatus("Photo captured");
  }
  return hCamera(
    "div",
    { className: "camera-box" },
    hCamera("video", { ref: videoRef, autoPlay: true, playsInline: true }),
    photo ? hCamera("img", { className: "captured-photo", src: photo, alt: "Captured login" }) : null,
    hCamera(
      "div",
      { className: "camera-actions" },
      hCamera("button", { type: "button", className: "ghost-button", onClick: startCamera }, "Start camera"),
      hCamera("button", { type: "button", className: "ghost-button", onClick: capturePhoto }, "Capture photo")
    ),
    hCamera("p", { className: "camera-status" }, status)
  );
}
window.CameraCapture = CameraCapture;
