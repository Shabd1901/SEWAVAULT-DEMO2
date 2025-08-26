import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useCamera } from "@/hooks/use-camera";
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
}

export default function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { stream, startCamera, stopCamera, isActive } = useCamera();
  const [isScanning, setIsScanning] = useState(false);
  const [codeReader] = useState(() => new BrowserMultiFormatReader());

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    let scanning = true;
    
    if (isActive && isScanning && videoRef.current) {
      const video = videoRef.current;
      
      const scanBarcode = async () => {
        try {
          const result = await codeReader.decodeOnceFromVideoDevice(undefined, video);
          if (result && scanning) {
            onBarcodeScanned(result.getText());
            setIsScanning(false);
          }
        } catch (err) {
          if (!(err instanceof NotFoundException) && scanning) {
            // Continue scanning on other errors
            setTimeout(scanBarcode, 100);
          }
        }
      };

      // Also check for demo barcode input
      const checkMockBarcode = () => {
        const mockBarcode = (window as any).mockBarcode;
        if (mockBarcode && scanning) {
          onBarcodeScanned(mockBarcode);
          (window as any).mockBarcode = null;
          setIsScanning(false);
          return;
        }
        if (scanning) {
          setTimeout(checkMockBarcode, 500);
        }
      };

      // Start both real scanning and demo checking
      scanBarcode();
      checkMockBarcode();
    }

    return () => {
      scanning = false;
    };
  }, [isActive, isScanning, onBarcodeScanned, codeReader]);

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
              Demo: Set window.mockBarcode = "ABX_1001_IFUD7D_RSSB" (or any token 1001-1020)
            </p>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
