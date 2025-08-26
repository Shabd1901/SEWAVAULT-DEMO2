import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, User, RotateCcw } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string) => void;
  capturedPhoto: string | null;
}

export default function PhotoCapture({ onPhotoCapture, capturedPhoto }: PhotoCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, startCamera, stopCamera, isActive } = useCamera();
  const [isCapturing, setIsCapturing] = useState(false);

  const handleStartCamera = async () => {
    try {
      await startCamera();
    } catch (error) {
      console.error("Failed to start camera:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 300;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onPhotoCapture(photoDataUrl);
    
    stopCamera();
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    onPhotoCapture("");
    handleStartCamera();
  };

  // Demo fallback - create placeholder photo
  const createPlaceholderPhoto = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = 400;
    canvas.height = 300;

    // Create gradient background
    const gradient = context.createLinearGradient(0, 0, 400, 300);
    gradient.addColorStop(0, '#E3F2FD');
    gradient.addColorStop(1, '#BBDEFB');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 400, 300);

    // Add placeholder text
    context.fillStyle = '#1976D2';
    context.font = '20px Roboto, sans-serif';
    context.textAlign = 'center';
    context.fillText('Sangat Photo', 200, 140);
    context.fillText('(Demo Placeholder)', 200, 170);

    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onPhotoCapture(photoDataUrl);
  };

  if (capturedPhoto) {
    return (
      <div className="space-y-4">
        <div className="bg-gray-100 rounded-lg h-48 overflow-hidden">
          <img
            src={capturedPhoto}
            alt="Captured sangat photo"
            className="w-full h-full object-cover rounded-lg"
            data-testid="img-captured-photo"
          />
        </div>
        <Button
          onClick={retakePhoto}
          variant="secondary"
          className="w-full"
          data-testid="button-retake-photo"
        >
          <RotateCcw size={16} className="mr-2" />
          Retake Photo
        </Button>
      </div>
    );
  }

  if (isActive && stream) {
    return (
      <div className="space-y-4">
        <div className="camera-preview">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onLoadedMetadata={() => {
              if (videoRef.current && stream) {
                videoRef.current.srcObject = stream;
              }
            }}
            data-testid="video-photo-preview"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={capturePhoto}
            className="flex-1 bg-primary hover:bg-primary/90"
            data-testid="button-capture-photo"
          >
            <Camera size={16} className="mr-2" />
            Capture Photo
          </Button>
          <Button
            onClick={stopCamera}
            variant="secondary"
            data-testid="button-cancel-photo"
          >
            Cancel
          </Button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <User size={48} className="mx-auto mb-2" />
          <p>No photo captured</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          onClick={handleStartCamera}
          className="flex-1 bg-primary hover:bg-primary/90"
          data-testid="button-start-photo-camera"
        >
          <Camera size={16} className="mr-2" />
          Capture Photo
        </Button>
        <Button
          onClick={createPlaceholderPhoto}
          variant="secondary"
          className="flex-1"
          data-testid="button-demo-photo"
        >
          Demo Photo
        </Button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
