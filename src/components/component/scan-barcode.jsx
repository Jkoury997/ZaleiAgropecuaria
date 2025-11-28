import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Barcode } from 'lucide-react';

export default function ScanBarcode({
  title,
  description,
  onScanSuccess, // Callback para enviar el resultado escaneado
}) {
  const [deviceType, setDeviceType] = useState(null); // Para determinar el tipo de dispositivo
  const [scanning, setScanning] = useState(false);
  const [scannerStarted, setScannerStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Pausar escaneo
  const [barcode, setBarcode] = useState(''); // Manejar el valor del input manual
  const scannerId = 'html5qr-code-full-region';
  const html5QrCodeRef = useRef(null);

  // Detectar tipo de dispositivo desde localStorage
  useEffect(() => {
    const savedDeviceType = localStorage.getItem('device');
    if (savedDeviceType) {
      setDeviceType(savedDeviceType);
    } else {
      setDeviceType('camera'); // Default a cámara
      localStorage.setItem('device', 'camera');
    }
  }, []);

  // Manejar el escaneo si es cámara
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

    html5QrCodeRef.current
      .start(
        { facingMode: 'environment' }, // Cámara trasera
        {
          fps: 5, // Fotogramas por segundo
          qrbox: 250, // Tamaño del área de escaneo
          formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13], // Formato EAN-13
        },
        handleScan
      )
      .then(() => {
        setScannerStarted(true);
      })
      .catch((err) => {
        console.error('Error al iniciar el escaneo:', err);
        setScanning(false);
      });
  };

  const stopScanning = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current
        .stop()
        .then(() => {
          html5QrCodeRef.current.clear();
        })
        .catch((err) => {
          console.error('Error al detener el escaneo:', err);
        });
    }
  };

  const handleScan = (data) => {
    console.log('Código escaneado:', data);
    if (data && !isPaused) {
      onScanSuccess(data);
      
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

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      // Enviar el código al presionar Enter
      onScanSuccess(barcode);
      setBarcode(''); // Limpiar el estado después de enviar
    }
  };

  const handleInputChange = (e) => {
    setBarcode(e.target.value); // Actualizar el estado mientras se escribe
  };

  return (
    <div className="flex flex-col items-center mb-2">
      <div className="max-w-md w-full px-4 sm:px-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-muted-foreground">{description}</p>
          </div>

          {/* Lector por cámara */}
          {deviceType === 'camera' && !scannerStarted && (
            <Button size="lg" className="w-full" onClick={() => setScanning(true)}>
              Iniciar Escáner
            </Button>
          )}
          {deviceType === 'camera' && scanning && (
            <div className="border p-2 rounded shadow-none bg-white" id={scannerId} style={{ width: '100%' }} />
          )}
          {deviceType === 'camera' && isPaused && (
            <Button size="m" className="w-full mt-1" onClick={resumeScanning}>
              Escanear de nuevo
            </Button>
          )}

          {/* Lector por PDA */}
          {deviceType === 'reader' && (
            <div className="relative flex-grow">
              <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Escanea el código de barras"
                value={barcode}
                onChange={handleInputChange} // Actualiza el estado
                onKeyDown={handleInputKeyDown} // Detecta Enter para enviar
                className="pl-10"
                inputMode="none"
                autoFocus
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

