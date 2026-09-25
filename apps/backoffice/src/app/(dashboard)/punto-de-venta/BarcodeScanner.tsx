'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}

interface Props {
  onDetected: (value: string) => void;
}

export function BarcodeScanner({ onDetected }: Props) {
  const [open, setOpen] = useState(false);
  const [supported, setSupported] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setSupported('BarcodeDetector' in window && !!navigator.mediaDevices);
  }, []);
  useEffect(() => {
    if (!open || !videoRef.current) return;
    let active = true;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout>;
    const start = async () => {
      const DetectorClass = (
        window as unknown as { BarcodeDetector: new (options: { formats: string[] }) => Detector }
      ).BarcodeDetector;
      const detector = new DetectorClass({
        formats: ['ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e'],
      });
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      const scan = async () => {
        if (!active || !videoRef.current) return;
        const results = await detector.detect(videoRef.current);
        if (results[0]?.rawValue) {
          onDetected(results[0].rawValue);
          setOpen(false);
          return;
        }
        timer = setTimeout(scan, 350);
      };
      await scan();
    };
    start().catch(() => setOpen(false));
    return () => {
      active = false;
      clearTimeout(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onDetected, open]);

  if (!supported) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
        title="Escanear con cámara"
      >
        <Camera className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-semibold">Apuntá al código de barras</p>
              <button type="button" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <video
              ref={videoRef}
              className="aspect-video w-full rounded-xl bg-black object-cover"
              muted
              playsInline
            />
          </div>
        </div>
      )}
    </>
  );
}
