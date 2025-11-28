import React, { useState, useRef, useEffect, forwardRef } from 'react';
import QRCode from 'qrcode.react';
import { Button } from '../ui/button';
import { Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    transform: 'rotate(180deg)',
  },
  details: {
    flex: 1,
    marginRight: '20px',
  },
  qrContainer: {
    textAlign: 'center',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    fontSize: '28px',
    margin: '0',
  },
  date: {
    fontSize: '18px',
    margin: '5px 0',
  },
  detailItem: {
    fontSize: '14px',
    margin: '5px 0',
  },
  qrImage: {
    width: '200px',
    height: '200px',
    padding: "20px",
  },
  largeText: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  footer: {
    position: 'absolute',
    bottom: '20px', // Añadido margen inferior
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  }
};

// Componente para el contenido del PDF
const PrintableContent = forwardRef(({ qrData, apiResponse, qrImage }, ref) => (
  <div ref={ref} style={{ position: 'relative', minHeight: '100vh', paddingTop: '50px' }}> {/* Añadido padding superior */}
    <div style={styles.container}>
      <div style={styles.details}>
        <div style={styles.header}>
          <h1 style={styles.title}>Zalei S.A. - N° {qrData?.IdPaquete}</h1>
          <p style={styles.largeText}>Fecha: {qrData?.Fecha || ''}</p>
          <p style={styles.largeText}>Cantidad: {qrData?.Cantidad || ''}</p>
        </div>
        <p style={styles.detailItem}><strong>Color:</strong> {apiResponse?.Articulo?.DescDetalle || ''}</p>
        <p style={styles.detailItem}><strong>Medida:</strong> {apiResponse?.Articulo?.DescMedida || ''}</p>
        <p style={styles.detailItem}><strong>Descripción:</strong> {apiResponse?.Articulo?.Descripcion || ''}</p>
        <p style={styles.detailItem}><strong>Galpón:</strong> {qrData?.Galpon || ''}</p>
      </div>
      <div style={styles.qrContainer}>
        <img src={qrImage} alt="QR Code" style={styles.qrImage} />
      </div>
    </div>

    {/* Footer Section */}
    <div style={styles.footer}>
      <div style={styles.details}>
        <div style={styles.header}>
          <h1 style={styles.title}>Zalei S.A. - N° {qrData?.IdPaquete}</h1>
          <p style={styles.largeText}>Fecha: {qrData?.Fecha || ''}</p>
          <p style={styles.largeText}>Cantidad: {qrData?.Cantidad || ''}</p>
        </div>
        <p style={styles.detailItem}><strong>Color:</strong> {apiResponse?.Articulo?.DescDetalle || ''}</p>
        <p style={styles.detailItem}><strong>Medida:</strong> {apiResponse?.Articulo?.DescMedida || ''}</p>
        <p style={styles.detailItem}><strong>Descripción:</strong> {apiResponse?.Articulo?.Descripcion || ''}</p>
        <p style={styles.detailItem}><strong>Galpón:</strong> {qrData?.Galpon || ''}</p>
      </div>
      <div style={styles.qrContainer}>
        <img src={qrImage} alt="QR Code" style={styles.qrImage} />
      </div>
    </div>
  </div>
));

// Componente principal
export default function QrPrinter({ qrData,apiResponse }) {
  const qrCanvasRef = useRef();
  const printRef = useRef();
  const [qrImage, setQrImage] = useState('');

  // Convertir qrData a JSON antes de pasarlo a QRCode
  const qrDataJson = JSON.parse(qrData);

  useEffect(() => {
    if (qrCanvasRef.current) {
      const qrCanvas = qrCanvasRef.current.querySelector('canvas');
      if (qrCanvas) {
        setQrImage(qrCanvas.toDataURL('image/png'));
      }
    }
  }, [qrData]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  return (
    <div className="flex flex-col items-center">
      {/* Generar y mostrar el código QR */}
      <div id="qr-canvas" className="m-3" ref={qrCanvasRef}>
        <QRCode value={qrData} size={200} />
      </div>
      {/* Componente que será impreso */}
      <div style={{ display: 'none' }}>
        <PrintableContent ref={printRef} qrData={qrDataJson} apiResponse={apiResponse} qrImage={qrImage} />
      </div>
      {/* Botón para imprimir directamente el contenido */}
      <Button onClick={handlePrint} className="flex items-center justify-center mt-4 p-2 rounded">
        <Printer className="mr-2" />
        Imprimir QR
      </Button>
    </div>
  );
}
