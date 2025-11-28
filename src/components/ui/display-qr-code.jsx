import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "@/components/ui/button";

export function DisplayQRCode({ value, onPrint }) {
  return (
    <div className="text-center">
      <QRCodeCanvas value={value} size={256} />
      <div className="mt-4">
        <Button onClick={onPrint}>Imprimir QR</Button>
      </div>
    </div>
  );
}
