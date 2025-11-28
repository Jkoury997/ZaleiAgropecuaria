import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode } from 'lucide-react';

export default function QrScannerComponent({
  title,
  description,
  onScanSuccess, // Callback para enviar el resultado escaneado
  stopScanner,   // Propiedad para detener el escáner
}) {
  const [deviceType, setDeviceType] = useState(null); // Manejar el tipo de dispositivo
  const [scanning, setScanning] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Estado para manejar la pausa
  const [manualInput, setManualInput] = useState(''); // Para el valor ingresado manualmente

  const scannerId = 'html5qr-code-full-region';
  const html5QrCodeRef = useRef(null);

  // Detectar tipo de dispositivo desde localStorage
  useEffect(() => {
    const savedDeviceType = localStorage.getItem('device');
    if (savedDeviceType) {
      setDeviceType(savedDeviceType);
    } else {
      setDeviceType('camera'); // Valor por defecto
      localStorage.setItem('device', 'camera');
    }
  }, []);

  useEffect(() => {
    if (stopScanner) {
      stopScanner(() => stopScanning());
    }
  }, [stopScanner]);

  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('Este dispositivo no soporta la API de getUserMedia necesaria para el escaneo de QR.');
    }
  }, []);

  useEffect(() => {
    if (scanning && deviceType === 'camera') {
      startScanning();
    }

    return () => stopScanning();
  }, [scanning, deviceType]);

  const startScanning = () => {
    if (!html5QrCodeRef.current) {
      html5QrCodeRef.current = new Html5Qrcode(scannerId);
    }

    html5QrCodeRef.current.start(
      { facingMode: "environment" }, // Usa la cámara trasera
      {
        fps: 10,
        qrbox: 250
      },
      handleScan
    ).then(() => {
      setScannerStarted(true);
    }).catch(err => {
      console.error('Ocurrió un error al intentar iniciar el escaneo:', err);
      setScanning(false);
    });
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
      }).catch(err => {
        console.error('Error al detener el escaneo:', err);
      });
    }
  };

  const handleScan = (data) => {
    if (data && !isPaused) {
      if (onScanSuccess) {
        onScanSuccess(data); // Llama a la función de callback para enviar el resultado
      }
  
      // Verificar que el escáner está inicializado antes de pausar
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.pause();
      }
      setIsPaused(true);
    }
  };

  const resumeScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleInputChange = (e) => {
    setManualInput(e.target.value); // Actualizar el valor ingresado
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir el envío predeterminado del formulario
      if (manualInput.trim() !== '') {
        onScanSuccess(manualInput); // Enviar el código completo al presionar Enter
        setManualInput(''); // Limpiar el campo de entrada
      }
    }
  };

  return (
    <div className="flex flex-col items-center mb-2">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>

          {/* Escaneo por Cámara */}
          {deviceType === 'camera' && !scannerStarted && (
            <Button size="lg" className="w-full" onClick={() => setScanning(true)}>
              Iniciar Escáner
            </Button>
          )}
          {deviceType === 'camera' && scanning && (
            <div className='border p-2 rounded shadow-none bg-white' id={scannerId} style={{ width: '100%' }} />
          )}
          {deviceType === 'camera' && isPaused && (
            <Button size="m" className="w-full mt-1" onClick={resumeScanning}>
              Escanear de nuevo
            </Button>
          )}

          {/* Entrada Manual para PDA */}
          {deviceType === 'reader' && (
            <div className="relative flex-grow flex items-center gap-2">
              <div className="relative flex-grow">
                <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Escanea el código QR"
                  value={manualInput}
                  onChange={handleInputChange} // Actualiza el estado
                  onKeyDown={handleInputKeyDown} // Detecta Enter para enviar
                  className="pl-10"
                  inputMode="none"
                  autoFocus
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
