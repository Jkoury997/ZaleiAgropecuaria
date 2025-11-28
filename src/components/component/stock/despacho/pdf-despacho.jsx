"use client";

import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-react";

export default function OrdenDespacho({ firma,despacho,productos,empresa,cliente }) {
  // Referencias para cada sección
  const headerRef = useRef();
  const infoRef = useRef();   // Sección de cliente y detalles de envío
  const tableRef = useRef();  // Sección variable (tabla)
  const footerRef = useRef();

  const handleDownloadPDF = async () => {
    // Capturamos cada sección con html2canvas
    const headerCanvas = await html2canvas(headerRef.current, { scale: 2 });
    const infoCanvas = await html2canvas(infoRef.current, { scale: 2 });
    const footerCanvas = await html2canvas(footerRef.current, { scale: 2 });
    const tableCanvas = await html2canvas(tableRef.current, { scale: 2 });

    // Configuramos el PDF en tamaño A4
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculamos el ratio (suponiendo que todas las secciones tienen el mismo ancho)
    const ratio = headerCanvas.width / pageWidth;

    // Convertimos las alturas de las secciones a milímetros
    const headerHeightMm = headerCanvas.height / ratio;
    const infoHeightMm = infoCanvas.height / ratio;
    const footerHeightMm = footerCanvas.height / ratio;

    // Altura disponible para la tabla en cada página
    const availableHeightMm =
      pageHeight - headerHeightMm - infoHeightMm - footerHeightMm;
    const availableHeightPx = availableHeightMm * ratio;

    let position = 0; // posición actual en el canvas de la tabla
    let page = 1;     // contador de páginas

    // Procesamos la tabla en secciones mientras quede contenido
    while (position < tableCanvas.height) {
      if (page > 1) {
        pdf.addPage();
      }

      // --- Encabezado ---
      const headerImgData = headerCanvas.toDataURL("image/png");
      pdf.addImage(headerImgData, "PNG", 0, 0, pageWidth, headerHeightMm);

      // --- Sección de Cliente y Detalles ---
      const infoImgData = infoCanvas.toDataURL("image/png");
      pdf.addImage(
        infoImgData,
        "PNG",
        0,
        headerHeightMm,
        pageWidth,
        infoHeightMm
      );

      // --- Tabla (contenido variable) ---
      const canvasPage = document.createElement("canvas");
      canvasPage.width = tableCanvas.width;
      // Calculamos la altura de la porción: si lo que queda es menor que el alto disponible, lo usamos completo
      const sliceHeight = Math.min(
        availableHeightPx,
        tableCanvas.height - position
      );
      canvasPage.height = sliceHeight;
      const ctx = canvasPage.getContext("2d");

      // Dibujamos la porción correspondiente del canvas de la tabla
      ctx.drawImage(
        tableCanvas,
        0,
        position, // origen en el canvas completo
        tableCanvas.width,
        sliceHeight, // tamaño del segmento a extraer
        0,
        0, // posición en el canvas temporal
        tableCanvas.width,
        sliceHeight // tamaño en el canvas temporal
      );
      const tableImgData = canvasPage.toDataURL("image/png");
      pdf.addImage(
        tableImgData,
        "PNG",
        0,
        headerHeightMm + infoHeightMm,
        pageWidth,
        sliceHeight / ratio
      );

      // --- Pie de página ---
      const footerImgData = footerCanvas.toDataURL("image/png");
      pdf.addImage(
        footerImgData,
        "PNG",
        0,
        pageHeight - footerHeightMm,
        pageWidth,
        footerHeightMm
      );

      position += sliceHeight;
      page++;
    }

    const totalPages = page - 1;
    // Agregamos la numeración en cada página (por ejemplo, "Página X de Y")
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        10,             // 10 mm desde el borde izquierdo
        pageHeight - 5, // 5 mm desde el borde inferior
        { align: "left" }
      );
    }

    pdf.save(`Orden_${despacho.Numero}-${new Date().toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",})}.pdf`);
    const pdfBlobUrl = pdf.output("bloburl");
    window.open(pdfBlobUrl);
  };

  return (
    <> 
    <div className="flex justify-center items-center">
      <Button onClick={handleDownloadPDF} className="bg-blue-500 text-white">
      <Printer className="mr-2 h-4 w-4" /> Imprimir Orden
    </Button>
    </div>


    <Card className="w-full max-w-4xl mx-auto my-8 print:shadow-none">
      {/* Encabezado */}
      <div ref={headerRef}>
        <CardHeader className="text-center border-b">
          <CardTitle className="text-2xl font-bold">
            Orden de Despacho
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {empresa.nombre}
          </p>
          <p className="text-sm text-muted-foreground">
            {empresa.direccion}
          </p>
        </CardHeader>
      </div>

      {/* Sección de Cliente y Detalles del Envío */}
      <div ref={infoRef}>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Cliente:</h3>
              <p>{cliente.nombre || " "}</p>
              <p>{cliente.direccion || " "}</p>
              <p>{cliente.ciudad || " "}</p>
            </div>
            <div className="text-right">
              <h3 className="font-semibold">Detalles de la orden:</h3>
              <p>Orden #: {despacho.Numero}</p>
              <p>Fecha: {new Date().toLocaleDateString()}</p>
              <p>Almacen: {despacho.Almacen}</p>
            </div>
          </div>
        </CardContent>
      </div>

      {/* Contenido variable: Tabla de productos */}
      <div ref={tableRef}>
        <CardContent className="p-6 space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Retira</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map((producto, index) => (
                <TableRow key={index}>
                  <TableCell>{producto.Codigo}</TableCell>
                  <TableCell>{producto.Descripcion}</TableCell>
                  <TableCell>{producto.Retira}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </div>

      {/* Pie de página */}
      <div ref={footerRef}>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div>
              <h3 className="font-semibold">Nota:</h3>
              <p className="text-sm">Entregado a las {new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}</p>
            </div>
            <div>
        <h3 className="font-semibold">Firma de Recepción:</h3>
        {firma ? (
          <img
            src={firma}
            alt="Firma de Recepción"
            className="mt-4"
            style={{ maxHeight: "80px" }}
          />
        ) : (
          <div className="mt-4 border-b border-dashed border-gray-400 pt-8"></div>
        )}
      </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="justify-center">
        <Button onClick={handleDownloadPDF} className="bg-blue-500 text-white">
          <Printer className="mr-2 h-4 w-4" /> Imprimir Orden
        </Button>

        
      </CardFooter>
    </Card>
    </>
  );
}
