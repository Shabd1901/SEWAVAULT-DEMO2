import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
}

export default function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, startCamera, stopCamera, isActive } = useCamera();
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive && isScanning) {
      // Simulate barcode detection for demo
      // In production, use QuaggaJS or similar library
      intervalId = setInterval(() => {
        // Check for demo barcode input in console
        const mockBarcode = (window as any).mockBarcode;
        if (mockBarcode) {
          onBarcodeScanned(mockBarcode);
          (window as any).mockBarcode = null;
          setIsScanning(false);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, isScanning, onBarcodeScanned]);

  const handleStartCamera = async () => {
    try {
      await startCamera();
      setIsScanning(true);
    } catch (error) {
      console.error("Failed to start camera:", error);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setIsScanning(false);
  };

  return (
    <div className="camera-preview relative">
      {isActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            data-testid="video-camera-preview"
          />
          <div className="barcode-scanner-overlay" />
          <div className="absolute bottom-4 left-4 right-4 flex space-x-2">
            <Button
              onClick={handleStopCamera}
              variant="secondary"
              className="flex-1"
              data-testid="button-stop-camera"
            >
              Stop Camera
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-gray-900 h-64 flex items-center justify-center text-white text-center">
          <div>
            <Camera size={48} className="mx-auto mb-2" />
            <p className="mb-4">Camera Preview</p>
            <Button
              onClick={handleStartCamera}
              className="bg-primary hover:bg-primary/90"
              data-testid="button-start-camera"
            >
              Start Camera
            </Button>
            <p className="text-xs mt-2 text-gray-400">
              Demo: Use console to set mockBarcode = "ABX_1001_IFUD7D_RSSB"
            </p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
