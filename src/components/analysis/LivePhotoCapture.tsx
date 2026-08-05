'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Camera,
  CheckCircle,
  ChevronRight,
  ImagePlus,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";

export const PHOTO_FIELDS = [
  "front",
  "left_profile",
  "right_profile",
  "forehead_closeup",
  "left_cheek_closeup",
  "right_cheek_closeup",
] as const;

export type PhotoField = (typeof PHOTO_FIELDS)[number];
export type AnalysisPhotoFiles = Record<PhotoField, File>;

interface LivePhotoCaptureProps {
  onComplete: (photos: AnalysisPhotoFiles) => void;
  onBack: () => void;
}

interface ShotDefinition {
  id: PhotoField;
  label: string;
  description: string;
  yaw: [number, number];
  closeup?: boolean;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  yaw?: number;
  fillRatio?: number;
}

const SHOTS: ShotDefinition[] = [
  { id: "front", label: "Front", description: "Face the camera directly.", yaw: [-10, 10] },
  {
    id: "left_profile",
    label: "Left profile",
    description: "Turn right until your left profile is visible.",
    yaw: [-50, -40],
  },
  {
    id: "right_profile",
    label: "Right profile",
    description: "Turn left until your right profile is visible.",
    yaw: [40, 50],
  },
  {
    id: "forehead_closeup",
    label: "Forehead closeup",
    description: "Face forward and move closer until your face fills the guide.",
    yaw: [-10, 10],
    closeup: true,
  },
  {
    id: "left_cheek_closeup",
    label: "Left cheek closeup",
    description: "Face forward and bring your left cheek close to the camera.",
    yaw: [-10, 10],
    closeup: true,
  },
  {
    id: "right_cheek_closeup",
    label: "Right cheek closeup",
    description: "Face forward and bring your right cheek close to the camera.",
    yaw: [-10, 10],
    closeup: true,
  },
];

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MIN_IMAGE_DIMENSION = 480;
const WASM_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm";
const MODEL_PATH =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

function getYawAndFill(landmarks: Array<{ x: number; y: number }>) {
  const nose = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  if (!nose || !leftEye || !rightEye) return null;

  const eyeCenter = (leftEye.x + rightEye.x) / 2;
  const eyeDistance = Math.max(Math.abs(rightEye.x - leftEye.x), 0.001);
  const yaw = Math.atan2(nose.x - eyeCenter, eyeDistance) * (180 / Math.PI);
  const xs = landmarks.map((landmark) => landmark.x);
  const ys = landmarks.map((landmark) => landmark.y);
  const fillRatio = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));

  return { yaw, fillRatio };
}

function validateDetection(
  result: any,
  shot: ShotDefinition,
  sourceLabel: string
): ValidationResult {
  const landmarks = result?.faceLandmarks?.[0];
  if (!landmarks) {
    return { valid: false, message: `${sourceLabel}: no face detected.` };
  }

  const pose = getYawAndFill(landmarks);
  if (!pose) {
    return { valid: false, message: `${sourceLabel}: keep your full face visible.` };
  }

  const [minYaw, maxYaw] = shot.yaw;
  if (pose.yaw < minYaw || pose.yaw > maxYaw) {
    return {
      valid: false,
      message: `${sourceLabel}: adjust your angle. Target ${minYaw}° to ${maxYaw}° yaw.`,
      yaw: pose.yaw,
      fillRatio: pose.fillRatio,
    };
  }

  if (shot.closeup && pose.fillRatio < 0.6) {
    return {
      valid: false,
      message: `${sourceLabel}: move closer until your face fills at least 60% of the frame.`,
      yaw: pose.yaw,
      fillRatio: pose.fillRatio,
    };
  }

  return {
    valid: true,
    message: shot.closeup ? "Closeup framing is ready." : "Position is correct. Hold steady.",
    yaw: pose.yaw,
    fillRatio: pose.fillRatio,
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("The selected image could not be opened."));
    };
    image.src = objectUrl;
  });
}

function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not capture the image."));
          return;
        }
        resolve(new File([blob], `${name}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  });
}

const PhotoPreview = ({ file, label }: { file: File; label: string }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  if (!url) return <div className="w-full h-full bg-muted" aria-label={`Loading ${label}`} />;
  return <img src={url} alt={label} className="w-full h-full object-cover" />;
};

export const LivePhotoCapture = ({ onComplete, onBack }: LivePhotoCaptureProps) => {
  const [consented, setConsented] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<Partial<AnalysisPhotoFiles>>({});
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [alignment, setAlignment] = useState<ValidationResult>({
    valid: false,
    message: "Loading face guidance...",
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const lastVideoTimestampRef = useRef(0);
  const validatingFileRef = useRef(false);

  const currentShot = SHOTS[currentStep];
  const hasAllPhotos = PHOTO_FIELDS.every((field) => photos[field]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const loadLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;

    setIsLoadingModel(true);
    try {
      const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_PATH },
        runningMode: "VIDEO",
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      return landmarkerRef.current;
    } finally {
      setIsLoadingModel(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setGalleryError(null);
    try {
      await loadLandmarker();
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "Could not access the camera. Choose a photo instead."
      );
      setIsCameraActive(false);
    }
  }, [loadLandmarker, stopCamera]);

  useEffect(() => {
    if (!consented) return;
    void startCamera();
    return stopCamera;
  }, [consented, startCamera, stopCamera]);

  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !streamRef.current) return;

    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => {
      setCameraError("The camera preview could not start. Please retry camera access.");
    });
  }, [isCameraActive]);

  useEffect(() => {
    if (!isCameraActive || reviewMode || !videoRef.current || !landmarkerRef.current) return;

    const detect = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (
        validatingFileRef.current ||
        !video ||
        !landmarker ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        animationRef.current = requestAnimationFrame(detect);
        return;
      }

      const timestamp = Math.max(performance.now(), lastVideoTimestampRef.current + 1);
      lastVideoTimestampRef.current = timestamp;
      const result = landmarker.detectForVideo(video, timestamp);
      setAlignment(validateDetection(result, currentShot, currentShot.label));
      animationRef.current = requestAnimationFrame(detect);
    };

    animationRef.current = requestAnimationFrame(detect);
    return () => {
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    };
  }, [currentShot, isCameraActive, reviewMode]);

  const validateFile = useCallback(
    async (file: File): Promise<ValidationResult> => {
      if (!ACCEPTED_TYPES.has(file.type)) {
        return { valid: false, message: "Use a JPG, PNG, or WebP image." };
      }
      if (file.size > MAX_IMAGE_BYTES) {
        return { valid: false, message: "That image is larger than 8MB." };
      }

      try {
        const image = await loadImage(file);
        if (image.width < MIN_IMAGE_DIMENSION || image.height < MIN_IMAGE_DIMENSION) {
          return { valid: false, message: "Images must be at least 480×480 pixels." };
        }

        const landmarker = await loadLandmarker();
        validatingFileRef.current = true;
        await landmarker.setOptions({ runningMode: "IMAGE" });
        const result = landmarker.detect(image);
        return validateDetection(result, currentShot, currentShot.label);
      } catch (error) {
        return {
          valid: false,
          message: error instanceof Error ? error.message : "Could not validate that image.",
        };
      } finally {
        if (landmarkerRef.current) {
          await landmarkerRef.current.setOptions({ runningMode: "VIDEO" });
        }
        validatingFileRef.current = false;
      }
    },
    [currentShot, loadLandmarker]
  );

  const savePhoto = (file: File) => {
    setPhotos((previous) => ({ ...previous, [currentShot.id]: file }));
    setGalleryError(null);
    if (currentStep < SHOTS.length - 1) {
      setCurrentStep((step) => step + 1);
    } else {
      stopCamera();
      setReviewMode(true);
    }
  };

  const capturePhoto = async () => {
    if (!isCameraActive || !alignment.valid || !videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not prepare the camera frame.");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      savePhoto(await canvasToFile(canvas, currentShot.id));
    } finally {
      setIsCapturing(false);
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setGalleryError("Checking your photo...");
    const validation = await validateFile(file);
    if (!validation.valid) {
      setGalleryError(`${validation.message} Choose a different photo or use the live camera instead.`);
      return;
    }
    savePhoto(file);
  };

  const retakePhoto = (index: number) => {
    const field = SHOTS[index].id;
    setPhotos((previous) => {
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setCurrentStep(index);
    setGalleryError(null);
    setReviewMode(false);
    void startCamera();
  };

  const confirmSubmit = () => {
    if (!hasAllPhotos) return;
    onComplete(photos as AnalysisPhotoFiles);
  };

  if (!consented) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="rounded-gg-lg overflow-hidden border-0 shadow-elevated">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Before your scan
              </span>
              <h2 className="font-heading text-2xl font-bold">A clearer look at your skin</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                GlowGuide uses six photos and your quiz answers to provide cosmetic skincare guidance.
                This is not a medical diagnosis and does not replace advice from a qualified clinician.
              </p>
            </div>
            <label className="flex gap-3 items-start rounded-gg border border-border bg-muted/40 p-4 text-sm">
              <input
                type="checkbox"
                checked={consented}
                onChange={(event) => setConsented(event.target.checked)}
                className="mt-1 h-4 w-4 accent-primary"
              />
              <span>I consent to capturing and processing these photos for my cosmetic skin analysis.</span>
            </label>
            <div className="flex justify-between gap-3">
              <Button variant="outline" onClick={onBack}>Back to quiz</Button>
              <Button disabled={!consented} onClick={() => setConsented(true)}>
                Continue to camera <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewMode) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Final review</span>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Review your six photos</h2>
          <p className="text-sm text-muted-foreground">Retake any frame before sending your scan.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SHOTS.map((shot, index) => (
            <div key={shot.id} className="group relative rounded-gg border border-border overflow-hidden bg-muted aspect-[4/3]">
              {photos[shot.id] && (
                <PhotoPreview file={photos[shot.id]!} label={shot.label} />
              )}
              <div className="absolute inset-x-0 bottom-0 bg-foreground/75 p-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-background uppercase tracking-wider">{shot.label}</span>
                <Button variant="secondary" size="icon" className="h-7 w-7" onClick={() => retakePhoto(index)}>
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Button disabled={!hasAllPhotos} onClick={confirmSubmit} className="px-8">
            Confirm & Continue <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center space-y-2">
        <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
          Step 2 — Vision analysis · {currentStep + 1} of {SHOTS.length}
        </span>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{currentShot.label}</h2>
        <p className="text-sm text-muted-foreground">{currentShot.description}</p>
      </div>

      <Card className={`rounded-gg-lg overflow-hidden border-2 shadow-elevated ${alignment.valid ? "border-success" : "border-destructive/70"}`}>
        <div className="relative aspect-video bg-foreground/90 flex items-center justify-center overflow-hidden">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="p-8 text-center max-w-sm space-y-3">
              <AlertTriangle className="h-10 w-10 text-warning mx-auto" />
              <p className="text-background font-semibold">Live camera unavailable</p>
              <p className="text-sm text-background/70">Choose a photo from your device instead.</p>
            </div>
          )}
          <div className={`absolute inset-8 rounded-[35%] border-2 pointer-events-none ${alignment.valid ? "border-success shadow-[0_0_30px_rgba(126,200,160,0.6)]" : "border-destructive/80"}`} />
          <div className="absolute top-4 left-4 rounded-full bg-foreground/75 text-background px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {currentStep + 1} / {SHOTS.length}
          </div>
          <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-bold shadow-soft ${alignment.valid ? "bg-success text-success-foreground" : "bg-background/95 text-destructive"}`}>
            {alignment.valid ? <CheckCircle className="inline h-3.5 w-3.5 mr-1" /> : null}
            {isLoadingModel ? "Loading face guidance..." : alignment.message}
          </div>
        </div>
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {currentShot.closeup ? "Keep your face forward and fill at least 60% of the frame." : "Good light, no filters, and keep steady."}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={onBack}>Back</Button>
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              <ImagePlus className="mr-2 h-4 w-4" /> Choose photo
            </Button>
            <Button onClick={capturePhoto} disabled={!isCameraActive || !alignment.valid || isCapturing}>
              {isCapturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              Capture
            </Button>
          </div>
        </CardContent>
      </Card>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleGalleryChange} className="hidden" />

      {(cameraError || galleryError) && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 space-y-3 text-sm">
            <p className="text-destructive">{galleryError || cameraError}</p>
            {galleryError && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>Choose Different Photo</Button>
                <Button size="sm" variant="outline" onClick={() => { setGalleryError(null); void startCamera(); }}>Use Live Camera Instead</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-2">
        {SHOTS.map((shot, index) => (
          <div key={shot.id} className={`h-2 rounded-full transition-all ${photos[shot.id] ? "w-8 bg-success" : index === currentStep ? "w-8 bg-primary" : "w-2 bg-border"}`} aria-label={`${shot.label}: ${photos[shot.id] ? "complete" : "pending"}`} />
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
