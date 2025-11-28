import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PrinterIcon } from "lucide-react";
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PrintView({ Codigo, Descripcion }) {
  const handlePrint = async () => {
    const content = document.getElementById(`printable-${Codigo}`);
    
    // Capturar el contenido como un canvas
    const canvas = await html2canvas(content, {
      scale: 2, // Aumentamos la escala para mejor calidad
      useCORS: true, // Para evitar problemas de imágenes bloqueadas por CORS
    });
    
    const imgData = canvas.toDataURL('image/png');

    // Crear un nuevo documento PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // Ancho de la página en mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // Altura de la página en mm

    const imgProps = pdf.getImageProperties(imgData);
    const imgRatio = imgProps.width / imgProps.height;
    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / imgRatio;

    // Si la imagen es más alta que el ancho permitido, se ajusta a la altura de la página
    if (imgHeight > pdfHeight) {
      imgHeight = pdfHeight;
      imgWidth = imgHeight * imgRatio;
    }

    // Centrar la imagen en el PDF
    const x = (pdfWidth - imgWidth) / 2;
    const y = (pdfHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);

    // Crear un Blob y abrirlo en una nueva pestaña
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfWindow = window.open(pdfUrl, '_blank');

    // Esperar a que el PDF se cargue y luego imprimir
    pdfWindow.onload = () => {
      pdfWindow.print();
    };
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <PrinterIcon className="h-4 w-4" />
          <span className="sr-only">Imprimir</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col items-center justify-center gap-6" id={`printable-${Codigo}`}>
          <div className="bg-white p-2 items-center text-center mt-3">
            <QRCode value={Codigo} size={200} />
            <DialogTitle className="text-center mb-3 mt-3">{Codigo}</DialogTitle>
            <DialogDescription className="text-center">
              {Descripcion}
            </DialogDescription>
          </div>
        </div>
        <div className="flex justify-center">
          <Button onClick={handlePrint}>Crear PDF</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
