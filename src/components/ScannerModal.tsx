import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, RefreshCw, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBarcodeDetected: (barcode: string) => void;
  onSwitchToImage: () => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onBarcodeDetected,
  onSwitchToImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing camera...');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const startCamera = async () => {
    stopCamera();
    setError(null);
    setStatus('Requesting camera access...');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStatus('Point camera at a barcode...');
      setIsScanning(true);

      // Initialize ZXing stream reader
      const reader = new BrowserMultiFormatReader();
      codeReaderRef.current = reader;

      reader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
        if (result && result.getText()) {
          const code = result.getText();
          setStatus(`Found barcode: ${code}`);
          stopCamera();
          onBarcodeDetected(code);
        }
      });
    } catch (err: any) {
      console.warn('Camera start error:', err);
      let errorMsg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please enable camera in browser settings or use the image upload option.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = 'No camera device found on this system.';
      } else {
        errorMsg = err.message || 'Camera failed to start.';
      }
      setError(errorMsg);
      setIsScanning(false);
    }
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 rounded-3xl shadow-2xl overflow-hidden text-white border border-slate-700">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <Camera className="text-teal-400" size={20} />
            <h2 className="font-bold text-base">Scan Barcode with Camera</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onSwitchToImage}
              className="p-2 text-xs text-teal-300 hover:text-white flex items-center gap-1 rounded-lg hover:bg-slate-800 transition"
              title="Use image instead"
            >
              <ImageIcon size={16} />
              <span className="hidden sm:inline">Use Image</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Video Viewport */}
        <div className="relative aspect-4/3 sm:aspect-square bg-black overflow-hidden flex items-center justify-center">
          {error ? (
            <div className="p-6 text-center max-w-xs space-y-3">
              <AlertCircle size={44} className="text-amber-400 mx-auto" />
              <p className="text-sm text-slate-300 leading-relaxed">{error}</p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs rounded-xl shadow transition"
                >
                  Retry Camera
                </button>
                <button
                  onClick={onSwitchToImage}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-teal-200 font-medium text-xs rounded-xl transition"
                >
                  Upload Barcode Image Instead
                </button>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Viewfinder Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                <div className="relative w-64 h-40 border-2 border-teal-400/90 rounded-2xl shadow-[0_0_20px_rgba(45,212,191,0.3)] flex items-center justify-center overflow-hidden">
                  {/* Laser scan animation bar */}
                  {isScanning && (
                    <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent animate-pulse" />
                  )}
                  {/* Corner notches */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-3 border-l-3 border-teal-300" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-3 border-r-3 border-teal-300" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-3 border-l-3 border-teal-300" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-3 border-r-3 border-teal-300" />

                  <span className="text-[11px] font-medium text-teal-200/90 bg-slate-950/70 px-2.5 py-1 rounded-full backdrop-blur-xs">
                    Align Barcode Here
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 truncate">
            {isScanning && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            )}
            <span className="truncate">{status}</span>
          </div>

          <button
            onClick={toggleCameraFacing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl flex items-center gap-1.5 transition shrink-0"
            title="Flip camera"
          >
            <RefreshCw size={13} />
            <span>Flip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
