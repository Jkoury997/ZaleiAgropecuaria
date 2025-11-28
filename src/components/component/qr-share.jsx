import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2Icon } from "lucide-react";
import QRCode from "react-qr-code";

export default function ShareQrView({ Codigo, Descripcion }) {
  const handleShare = () => {
    const svg = document.getElementById(`qr-code-${Codigo}`).querySelector('svg');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], `${Codigo}.png`, { type: 'image/png' });
        
        if (navigator.share) {
          navigator.share({
            title: 'Compartir QR',
            text: Descripcion,
            files: [file],
          })
          .then(() => console.log('Compartido con éxito'))
          .catch((error) => console.log('Error al compartir:', error));
        } else {
          alert('La API de Web Share no está soportada en este navegador.');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Share2Icon className="h-4 w-4" />
          <span className="sr-only">Compartir</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center gap-6">
          <div id={`qr-code-${Codigo}`} className="bg-white p-2 items-center text-center">
            <QRCode className="p-5" value={Codigo} size={250} />
            <DialogTitle className="text-center mb-3">{Codigo}</DialogTitle>
            <DialogDescription className="text-center">
              {Descripcion}
            </DialogDescription>
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Button onClick={handleShare}>Compartir QR</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
