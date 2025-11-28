"use client";

import React, { forwardRef, useMemo, useRef, useImperativeHandle } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// 🎨 Tema por defecto
const defaultTheme = {
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  textColor: "#0b0b0c",
  mutedText: "#5b6069",
  bg: "#ffffff",
  softBg: "#f7f7f8",
  border: "#e5e7eb",
  strongBorder: "#111827",
  brand: "#0E7C66",
  brandSoft: "#E6F2EF",
  radius: "14px",
  shadow: "0 6px 20px rgba(0,0,0,0.06)",
};

const A4 = { wMm: 210, hMm: 297 };

const OrdenAImprimir = forwardRef(
  (
    {
      firma,
      despacho = {},
      productos = [],
      empresa = {},
      proveedor = {},
      theme,
      companyLogoUrl,
    },
    ref
  ) => {
    const th = { ...defaultTheme, ...(theme ?? {}) };

    const rootRef = useRef(null);
    

    // Filtrar productos con Retira > 0
    const items = useMemo(
      () =>
        Array.isArray(productos)
          ? productos.filter((p) => Number(p?.Retira) > 0)
          : [],
      [productos]
    );

    // Calcular depósito y total
    const { usedDepotCode, usedDepotName, totalUnidades } = useMemo(() => {
      const first = items[0];
      const code = first?.CodAlmacen ?? despacho?.CodAlmacen ?? null;
      const name =
        first?.DescAlmacen ??
        (code && code === despacho?.CodAlmacen ? despacho?.Almacen : null) ??
        null;
      const total = items.reduce((acc, it) => acc + Number(it?.Retira || 0), 0);
      return {
        usedDepotCode: code,
        usedDepotName: name ?? code ?? null,
        totalUnidades: total,
      };
    }, [items, despacho?.CodAlmacen, despacho?.Almacen]);

    // 👉 Exponemos métodos al padre
useImperativeHandle(ref, () => ({
  getNode: () => rootRef.current,


     // PDF DIRECTO (sin html2canvas): texto/tabla vectorial con jsPDF
  async generatePdf() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfW = 210;
    const pdfH = 297;
    const margin = 12;
    let y = margin;

    // helpers
    const line = (x1, y1, x2, y2) => pdf.line(x1, y1, x2, y2);
    const textR = (t, x, y) => pdf.text(String(t ?? ""), x, y, { align: "right" });
    const text = (t, x, y) => pdf.text(String(t ?? ""), x, y);

    const newPage = () => {
      pdf.addPage();
      y = margin;
    };

    // HEADER
    pdf.setFontSize(14);
    pdf.text(empresa?.nombre || "MI EMPRESA", margin, y);
    pdf.setFontSize(10);
    y += 6;
    pdf.text("Orden de Despacho", margin, y);
    y += 4;
    line(margin, y, pdfW - margin, y);
    y += 6;

    // INFO PROVEEDOR / ORDEN
    pdf.setFontSize(10);
    const leftX = margin, rightX = pdfW - margin;

    text(`Proveedor: ${proveedor?.Nombre || proveedor?.RazonSocial || "-"}`, leftX, y);
    textR(`Orden #: ${despacho?.Numero || despacho?.Id || "-"}`, rightX, y);
    y += 5;

    text(`Dirección: ${proveedor?.Direccion || "-"}`, leftX, y);
    textR(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, rightX, y);
    y += 5;

    text(`CUIT: ${proveedor?.Cuit || "-"}`, leftX, y);
    const usedDepotCode = productos?.[0]?.CodAlmacen ?? despacho?.CodAlmacen ?? "-";
    const usedDepotName =
      productos?.[0]?.DescAlmacen ??
      (usedDepotCode === despacho?.CodAlmacen ? despacho?.Almacen : usedDepotCode) ??
      "-";
    textR(`Almacén retiro: ${usedDepotName}`, rightX, y);
    y += 8;

    // TABLA
    // columnas: Código (30), Descripción (120), Retira (30) aprox
    const colX = { codigo: margin, desc: margin + 32, retira: pdfW - margin };
    const rowH = 6;

    // header tabla
    pdf.setFontSize(10);
    pdf.setFont(undefined, "bold");
    text("Código", colX.codigo, y);
    text("Descripción", colX.desc, y);
    textR("Retira", colX.retira, y);
    pdf.setFont(undefined, "normal");
    y += 3;
    line(margin, y, pdfW - margin, y);
    y += 4;

    const items = Array.isArray(productos)
      ? productos.filter((p) => Number(p?.Retira) > 0)
      : [];

    const maxY = pdfH - margin - 40; // dejar espacio para firma/footer

    // filas
    items.forEach((p) => {
      // salto de página si no entra
      if (y + rowH > maxY) {
        newPage();
        // reimprimir header de tabla en la nueva página
        pdf.setFont(undefined, "bold");
        text("Código", colX.codigo, y);
        text("Descripción", colX.desc, y);
        textR("Retira", colX.retira, y);
        pdf.setFont(undefined, "normal");
        y += 3;
        line(margin, y, pdfW - margin, y);
        y += 4;
      }

      text(p?.Codigo ?? "", colX.codigo, y);
      // cortar descripción simple (una línea), si querés multilínea, hay que medir y wrappear
      const desc = (p?.Descripcion ?? "").slice(0, 90);
      text(desc, colX.desc, y);
      textR(p?.Retira ?? "0", colX.retira, y);
      y += rowH;
    });

    // total
    const totalUnidades = items.reduce((acc, it) => acc + Number(it?.Retira || 0), 0);
    y += 2;
    line(margin, y, pdfW - margin, y);
    y += rowH;
    pdf.setFont(undefined, "bold");
    text("Total unidades", colX.desc, y);
    textR(totalUnidades, colX.retira, y);
    pdf.setFont(undefined, "normal");
    y += 10;

    // FIRMA (si no entra, nueva página)
    if (y + 28 > pdfH - margin) newPage();

    pdf.setFontSize(10);
    text("Firma de Recepción:", margin, y);
    y += 20;

    if (firma) {
      // Cargar imagen de firma
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.crossOrigin = "anonymous";
        im.src = firma;
      });
      // ancho/alto aproximados
      const fw = 50, fh = 20;
      pdf.addImage(img, "PNG", margin, y - 18, fw, fh);
    } else {
      text("__________________________", margin, y - 2);
    }

    return pdf.output("blob");
  },
}));

    return (
      <>
        <div
          ref={rootRef}
          className="w-full"
          style={{
            fontFamily: th.fontFamily,
            color: th.textColor,
          }}
        >
          {/* Encabezado */}
          <div className="print-header">
            <Card
              className="w-full max-w-full print:shadow-none"
              style={{
                borderColor: th.border,
                borderRadius: th.radius,
                boxShadow: th.shadow,
                background: th.bg,
              }}
            >
              <CardHeader className="text-center border-b" style={{ borderColor: th.border }}>
                <div className="mx-auto flex items-center justify-center gap-3 mb-2">
                  {companyLogoUrl && (
                    <img
                      src={companyLogoUrl}
                      alt="logo"
                      style={{ height: 26, width: "auto", objectFit: "contain" }}
                    />
                  )}
                  <div>
                    <div className="font-extrabold">
                      {empresa?.nombre || "MI EMPRESA"}
                    </div>
                    <div
                      className="text-xs font-semibold"
                      style={{ color: th.mutedText }}
                    >
                      Orden de Despacho
                    </div>
                  </div>
                </div>
                <CardTitle>
                  <div
                    style={{
                      height: 6,
                      width: "100%",
                      background: th.brand,
                      borderRadius: 4,
                      marginTop: 8,
                    }}
                  />
                </CardTitle>
                <p className="text-xs mt-2" style={{ color: th.mutedText }}>
                  {empresa?.direccion || ""}
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* Contenido */}
          <div className="print-content">
            {/* Proveedor + Detalles */}
            <Card
              className="w-full max-w-full print:shadow-none"
              style={{
                borderColor: th.border,
                borderRadius: th.radius,
                boxShadow: th.shadow,
                background: th.bg,
              }}
            >
              <CardContent className="p-3 sm:p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="text-xs sm:text-sm leading-tight">
                    <h3 className="font-semibold">Proveedor:</h3>
                    <div
                      className="rounded p-2 mt-1"
                      style={{
                        background: th.softBg,
                        border: `1px dashed ${th.border}`,
                      }}
                    >
                      <p>{proveedor?.Nombre || proveedor?.RazonSocial || "-"}</p>
                      <p>{proveedor?.Direccion || "-"}</p>
                      <p>{proveedor?.Cuit || "-"}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs sm:text-sm leading-tight">
                    <h3 className="font-semibold">Detalles de la orden:</h3>
                    <div
                      className="mt-1 inline-block text-left rounded p-2"
                      style={{
                        background: th.softBg,
                        border: `1px dashed ${th.border}`,
                      }}
                    >
                      <p>Orden #: {despacho?.Numero || despacho?.Id || "-"}</p>
                      <p>Fecha: {new Date().toLocaleDateString("es-AR")}</p>
                      <p>Almacén de la orden: {despacho?.Almacen || "-"}</p>
                      <p>
                        Almacén de retiro: {usedDepotName || "-"}
                        {usedDepotCode && usedDepotCode !== usedDepotName
                          ? ` (${usedDepotCode})`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabla */}
            <Card
              className="w-full max-w-full print:shadow-none mt-3"
              style={{
                borderColor: th.border,
                borderRadius: th.radius,
                boxShadow: th.shadow,
                background: th.bg,
              }}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="overflow-x-auto">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow style={{ background: th.brandSoft }}>
                        <TableHead style={{ borderColor: th.border }}>Código</TableHead>
                        <TableHead style={{ borderColor: th.border }}>Descripción</TableHead>
                        <TableHead className="text-right" style={{ borderColor: th.border }}>
                          Retira
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((p, i) => (
                        <TableRow key={i} style={{ borderColor: th.border }}>
                          <TableCell style={{ borderColor: th.border }}>{p?.Codigo}</TableCell>
                          <TableCell style={{ borderColor: th.border }}>{p?.Descripcion}</TableCell>
                          <TableCell className="text-right" style={{ borderColor: th.border }}>
                            {p?.Retira}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow style={{ borderColor: th.border }}>
                        <TableCell
                          colSpan={2}
                          className="text-right font-semibold"
                          style={{ borderColor: th.border }}
                        >
                          Total unidades
                        </TableCell>
                        <TableCell className="text-right font-semibold" style={{ borderColor: th.border }}>
                          {totalUnidades}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pie */}
          <div className="print-footer">
            <Card
              className="w-full max-w-full print:shadow-none"
              style={{
                borderColor: th.border,
                borderRadius: th.radius,
                boxShadow: th.shadow,
                background: th.bg,
              }}
            >
              <CardContent className="p-3 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <h3 className="font-semibold">Nota:</h3>
                    <p style={{ color: th.mutedText }}>
                      Entregado a las{" "}
                      {new Date().toLocaleString("es-AR", {
                        timeZone: "America/Argentina/Buenos_Aires",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Firma de Recepción:</h3>
                    {firma ? (
                      <img
                        src={firma}
                        alt="Firma de Recepción"
                        className="mt-3 max-w-full"
                        style={{ maxHeight: 80 }}
                      />
                    ) : (
                      <div
                        className="mt-6 border-b border-dashed pt-6"
                        style={{ borderColor: th.border }}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CSS impresión */}
        <style jsx global>{`
          @media print {
            html,
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-header {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              height: 130px;
            }
            .print-footer {
              position: fixed;
              bottom: 0;
              left: 0;
              right: 0;
              height: 130px;
            }
            .print-content {
              margin-top: 140px;
              margin-bottom: 140px;
            }
            .print-header,
            .print-content,
            .print-footer,
            table,
            th,
            td {
              font-size: 10px !important;
              line-height: 1.2 !important;
            }
          }
        `}</style>
      </>
    );
  }
);

export default OrdenAImprimir;
