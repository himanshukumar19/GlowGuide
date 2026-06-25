import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RefreshCw, CheckCircle, AlertTriangle, ChevronRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface LivePhotoCaptureProps {
  onComplete: (photos: string[]) => void;
  onBack: () => void;
}

interface CaptureAngle {
  id: string;
  name: string;
  description: string;
  guidePath: string; // SVG path or instruction description
}

const CAPTURE_ANGLES: CaptureAngle[] = [
  {
    id: "front",
    name: "Front Facing",
    description: "Align your face directly with the center guide.",
    // Center face oval
    guidePath: "M12,4 C8.5,4 5.5,7 5.5,11 C5.5,15 8.5,19 12,19 C15.5,19 18.5,15 18.5,11 C18.5,7 15.5,4 12,4 Z"
  },
  {
    id: "left-profile",
    name: "Left Profile",
    description: "Turn your face to the right (showing your left profile).",
    // Left profile silhouette
    guidePath: "M12,4 C9.5,4 7.5,6 7,8.5 C6.8,9.5 6,10 5,10 C4,10 3.5,11 3.5,12 C3.5,13 4.5,13.5 5,14 C5.5,14.5 6.5,15.5 7.5,17 C8.5,18.5 10.5,19 12,19 Z"
  },
  {
    id: "right-profile",
    name: "Right Profile",
    description: "Turn your face to the left (showing your right profile).",
    // Right profile silhouette (flipped)
    guidePath: "M12,4 C14.5,4 16.5,6 17,8.5 C17.2,9.5 18,10 19,10 C20,10 20.5,11 20.5,12 C20.5,13 19.5,13.5 19,14 C18.5,14.5 17.5,15.5 16.5,17 C15.5,18.5 13.5,19 12,19 Z"
  },
  {
    id: "tilt-left",
    name: "Tilted Left",
    description: "Tilt your head slightly up and to the left (showing jawline).",
    guidePath: "M12,4 C8.5,4.5 6,7.5 6,11.5 C6,15 9,18.5 12,19 C14,19.2 17.5,16 18,12 C18.5,8 15.5,4 12,4 Z"
  },
  {
    id: "tilt-right",
    name: "Tilted Right",
    description: "Tilt your head slightly up and to the right (showing jawline).",
    guidePath: "M12,4 C15.5,4.5 18,7.5 18,11.5 C18,15 15,18.5 12,19 C10,19.2 6.5,16 6,12 C5.5,8 8.5,4 12,4 Z"
  }
];

export const LivePhotoCapture = ({ onComplete, onBack }: LivePhotoCaptureProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = CAPTURE_ANGLES[currentStep];
  const [alignmentState, setAlignmentState] = useState<"scanning" | "aligned">("scanning");
  const [alignmentStatus, setAlignmentStatus] = useState<string>("Aligning face in guide...");
  
  const lastFrameDataRef = useRef<Uint8ClampedArray | null>(null);
  const steadyFramesRef = useRef(0);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // 1. Real-time Optical Motion & Presence Analyzer (runs when camera is active)
  useEffect(() => {
    if (!isCameraActive || reviewMode || !videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 24;
    const ctx = canvas.getContext("2d");

    steadyFramesRef.current = 0;
    lastFrameDataRef.current = null;
    setAlignmentState("scanning");
    setAlignmentStatus("Aligning face in guide...");

    const intervalId = setInterval(() => {
      if (!videoRef.current || !ctx || reviewMode) return;

      try {
        ctx.drawImage(videoRef.current, 0, 0, 32, 24);
        const imgData = ctx.getImageData(0, 0, 32, 24);
        const data = imgData.data;

        let totalDiff = 0;
        let avgBrightness = 0;
        const lastData = lastFrameDataRef.current;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          avgBrightness += (r + g + b) / 3;

          if (lastData) {
            totalDiff += Math.abs(r - lastData[i]) +
                         Math.abs(g - lastData[i+1]) +
                         Math.abs(b - lastData[i+2]);
          }
        }

        const numPixels = data.length / 4;
        avgBrightness = avgBrightness / numPixels;
        const avgDiff = lastData ? totalDiff / (numPixels * 3) : 0;
        lastFrameDataRef.current = data;

        // Calculate spatial contrast variance to detect presence of features/human vs empty wall
        let varianceSum = 0;
        for (let i = 0; i < data.length; i += 4) {
          const b = (data[i] + data[i+1] + data[i+2]) / 3;
          varianceSum += Math.abs(b - avgBrightness);
        }
        const spatialVariance = varianceSum / numPixels;

        // Block obstruction checks
        if (avgBrightness < 18) {
          setAlignmentState("scanning");
          setAlignmentStatus("Feed too dark: Adjust lighting");
          steadyFramesRef.current = 0;
          return;
        }
        if (avgBrightness > 238) {
          setAlignmentState("scanning");
          setAlignmentStatus("Feed too bright: Adjust lighting");
          steadyFramesRef.current = 0;
          return;
        }

        // Flat surface detection (empty flat wall or covered camera has low spatial variance)
        if (spatialVariance < 12) {
          setAlignmentState("scanning");
          setAlignmentStatus("Position face inside guide...");
          steadyFramesRef.current = 0;
          return;
        }

        // Evaluate motion differentials with tuned thresholds
        if (avgDiff > 9.5) {
          // Significant motion (user adjusting, shaking, or walking away)
          setAlignmentState("scanning");
          setAlignmentStatus("Shaking detected: Hold steady");
          steadyFramesRef.current = 0;
        } else if (avgDiff >= 0.85 && avgDiff <= 9.5) {
          // Biological micro-movements (breathing, blinks, etc.) of a present user holding steady
          steadyFramesRef.current += 1;
          if (steadyFramesRef.current >= 4) {
            setAlignmentState("aligned");
            setAlignmentStatus("Position correct: Ready!");
          } else {
            setAlignmentStatus("Scanning... Hold steady");
          }
        } else {
          // Under 0.85 -> Stillness (empty static background noise or camera left untouched)
          setAlignmentState("scanning");
          setAlignmentStatus("Position face inside guide...");
          steadyFramesRef.current = 0;
        }
      } catch (err) {
        // Suppress canvas errors on initial loading frames
      }
    }, 250);

    return () => clearInterval(intervalId);
  }, [isCameraActive, reviewMode, currentStep]);

  // 2. Demo simulator timer (runs when device has no camera access)
  useEffect(() => {
    if (isCameraActive || reviewMode) return;

    setAlignmentState("scanning");
    setAlignmentStatus("Simulating face alignment...");

    const timer = setTimeout(() => {
      setAlignmentState("aligned");
      setAlignmentStatus("Position correct: Ready!");
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentStep, reviewMode, isCameraActive]);

  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      streamRef.current = stream;
      setIsCameraActive(true);
      
      // If the video element is already mounted, bind it immediately
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn("Camera access denied or unsupported, enabling demo mode:", err.message);
      setCameraError(
        "Could not access camera. Enabling interactive simulator to complete analysis."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!isCameraActive) {
      // Fallback Demo Mode: Generate a beautiful color canvas with angle labels
      generateDemoPhoto();
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Mirror the image for intuitive photo review
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to dataUrl
        const dataUrl = canvas.toDataURL("image/jpeg");
        const updatedPhotos = [...photos];
        updatedPhotos[currentStep] = dataUrl;
        setPhotos(updatedPhotos);

        advanceOrReview(updatedPhotos);
      }
    }
  };

  const generateDemoPhoto = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = 640;
        canvas.height = 480;

        // Draw a simulated face outline on canvas
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, "#BA94D1");
        gradient.addColorStop(1, "#E8A0BF");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px Playfair Display, serif";
        ctx.textAlign = "center";
        ctx.fillText(`SIMULATED: ${currentAngle.name}`, canvas.width / 2, canvas.height / 2 - 20);

        ctx.fillStyle = "#ffffff99";
        ctx.font = "14px Inter, sans-serif";
        ctx.fillText("Camera Permission Simulator Output", canvas.width / 2, canvas.height / 2 + 10);

        const dataUrl = canvas.toDataURL("image/jpeg");
        const updatedPhotos = [...photos];
        updatedPhotos[currentStep] = dataUrl;
        setPhotos(updatedPhotos);

        advanceOrReview(updatedPhotos);
      }
    }
  };

  const advanceOrReview = (updatedPhotos: string[]) => {
    if (currentStep < CAPTURE_ANGLES.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      stopCamera();
      setReviewMode(true);
    }
  };

  const retakePhoto = (index: number) => {
    setCurrentStep(index);
    setReviewMode(false);
    startCamera();
  };

  const handleConfirmSubmit = () => {
    onComplete(photos);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Step 2 — Vision Analysis
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mt-1">
          {reviewMode ? "Review Profile Photos" : `Angle: ${currentAngle.name}`}
        </h2>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
          {reviewMode
            ? "Inspect your facial profiles below. You can retake any profile to ensure accuracy."
            : currentAngle.description}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {!reviewMode ? (
          /* Capture Mode */
          <Card className="border border-border shadow-card bg-card rounded-gg-lg overflow-hidden relative">
            <div className="relative aspect-video bg-muted flex items-center justify-center overflow-hidden">
              {/* Video elements */}
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="p-8 text-center max-w-sm animate-pulse">
                  <AlertTriangle className="h-10 w-10 text-warning mx-auto mb-3" />
                  <p className="text-foreground font-semibold text-sm mb-1">
                    Camera Simulator Active
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cameraError || "Capturing placeholder profile scans to evaluate skin parameters."}
                  </p>
                </div>
              )}

              {/* Horizontal scanning bar overlay */}
              {isCameraActive && alignmentState === "scanning" && (
                <div className="absolute inset-x-0 h-0.5 bg-amber-400/50 animate-bounce top-1/3 shadow-[0_0_8px_rgba(245,176,65,0.8)] pointer-events-none" />
              )}

              {/* Head Silhouette Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg
                  viewBox="0 0 24 24"
                  className={`w-40 h-40 transition-all duration-500 ${
                    alignmentState === "scanning"
                      ? "text-amber-400/20 stroke-amber-400 animate-pulse scale-100"
                      : "text-success/20 stroke-success scale-105 drop-shadow-[0_0_10px_rgba(126,200,160,0.6)]"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={alignmentState === "scanning" ? "0.8" : "1.2"}
                >
                  <path d={currentAngle.guidePath} fill="currentColor" fillOpacity="0.08" />
                </svg>
              </div>

              {/* Position Guide Alert Banner */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-[10px] font-bold shadow-soft flex items-center gap-2 transition-all bg-card/95 backdrop-blur-sm border border-border pointer-events-none select-none">
                {alignmentState === "scanning" ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-amber-600 uppercase tracking-wider">Aligning face... Keep steady</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 text-success fill-success/20" />
                    <span className="text-primary uppercase tracking-wider">Position correct: Ready!</span>
                  </>
                )}
              </div>

              {/* Step indicator badge */}
              <div className="absolute top-4 left-4 bg-foreground/75 text-background px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Step {currentStep + 1} of 5
              </div>
            </div>

            {/* Video Action Bar */}
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium text-center sm:text-left">
                Ensure good overhead lighting and avoid heavy shadows.
              </span>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onBack} size="sm">
                  Back
                </Button>
                {cameraError && (
                  <Button variant="outline" size="sm" onClick={startCamera} className="border-border">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Camera
                  </Button>
                )}
                <Button
                  onClick={capturePhoto}
                  className={`font-semibold px-6 rounded-gg-sm transition-all duration-300 ${
                    alignmentState === "scanning"
                      ? "bg-muted text-muted-foreground cursor-not-allowed border border-border"
                      : "bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground shadow-primary"
                  }`}
                  disabled={alignmentState === "scanning"}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {alignmentState === "scanning" ? "Aligning..." : "Snap Photo"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Review Mode Grid */
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CAPTURE_ANGLES.map((angle, index) => (
                <div
                  key={angle.id}
                  className="group relative aspect-[3/4] rounded-gg border border-border shadow-soft bg-muted overflow-hidden transition-all hover:shadow-card"
                >
                  <img
                    src={photos[index]}
                    alt={angle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300 p-2 text-center">
                    <span className="text-[10px] font-bold text-background uppercase tracking-wider">
                      {angle.name}
                    </span>
                    <Button
                      onClick={() => retakePhoto(index)}
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-full shadow-soft"
                    >
                      <RefreshCw className="h-3 w-3 text-foreground" />
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-foreground/70 text-background text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5 text-success fill-success" />
                    {angle.name.split(" ")[0]}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA confirmation buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setPhotos([]);
                  setReviewMode(false);
                  setCurrentStep(0);
                  startCamera();
                }}
                className="border-border hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Retake All
              </Button>
              <Button
                onClick={handleConfirmSubmit}
                className="bg-primary hover:bg-primary-hover active:scale-95 text-primary-foreground font-semibold px-8 shadow-primary rounded-gg-sm"
              >
                Analyze Skin Scans
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
