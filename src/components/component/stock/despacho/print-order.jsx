"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";


import ReactToPrint from "react-to-print";
import OrdenAImprimir from "@/components/component/stock/despacho/orden-al-imprimir";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export default function PrintOrden({ firma, despacho, productos, empresa, proveedor, runKey }) {
  const componentRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [serverUrl, setServerUrl] = useState("");

  // ✅ Clave estable por despacho + corrida
  const saveKey = useMemo(() => {
    const id = despacho?.Id ?? despacho?.Numero ?? "sin_id";
    return `printorden:${id}:${runKey ?? 0}`;
  }, [despacho?.Id, despacho?.Numero, runKey]);

  const didSaveRef = useRef(false);

  const uploadToServer = async (blob) => {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    const hh = String(hoy.getHours()).padStart(2, "0");
    const mi = String(hoy.getMinutes()).padStart(2, "0");
    const ss = String(hoy.getSeconds()).padStart(2, "0");

    const numero = despacho?.Numero || despacho?.Id || "sin_numero";
    const providerName =
      proveedor?.Nombre?.toString()?.trim() ||
      proveedor?.RazonSocial?.toString()?.trim() ||
      "generico";

    const filename = `orden-despacho-${numero}-${yyyy}${mm}${dd}-${hh}${mi}${ss}.pdf`;

    const fd = new FormData();
    fd.append("provider", providerName);
    fd.append("file", new File([blob], filename, { type: "application/pdf" }));

    const res = await fetch("/api/utils/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Error de subida");
    return data.url; // /api/upload/{provider}/{filename}
  };

  // Auto-guardado apenas aparece (con anti-doble)
  useEffect(() => {
    if (!componentRef.current) return;
    if (!Array.isArray(productos) || productos.length === 0) return;
    if (didSaveRef.current) return;

    if (typeof window !== "undefined") {
      if (!window.__savedOrders) window.__savedOrders = new Set();
      if (window.__savedOrders.has(saveKey)) return;
      window.__savedOrders.add(saveKey);
    }

    didSaveRef.current = true;

    (async () => {
      try {
        setSaving(true);
        // asegurar layout estable
        await new Promise((r) => setTimeout(r, 0));
        // 👉 Generar PDF desde el propio componente
        const blob = await componentRef.current.generatePdf({ scale: 2 }); // el parámetro se ignora

        const url = await uploadToServer(blob);
        setServerUrl(url);
      } catch (e) {
        console.error("Auto-guardado PDF falló:", e);
      } finally {
        setSaving(false);
      }
    })();
  }, [productos, saveKey]);

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="mx-auto w-full max-w-screen-lg px-2 sm:px-4">
        <div className="flex gap-2 justify-center items-center mb-4 no-print">
          {/* Botón de impresión opcional */}
          <ReactToPrint
            trigger={() => (
              <Button className="bg-blue-500 text-white" disabled={saving}>
                <Printer className="mr-2 h-4 w-4" /> Imprimir Orden
              </Button>
            )}
            // 👇 ReactToPrint necesita el nodo DOM: se lo damos desde el método expuesto
            content={() => componentRef.current?.getNode?.()}
            pageStyle={`@page { size: A4 portrait; margin: 12mm; } @media print { html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}
          />
        </div>

        {saving && <p className="text-center text-sm mb-4">Guardando PDF…</p>}
        {serverUrl && (
          <p className="text-center text-sm mb-4">
            PDF guardado:{" "}
            <a className="underline" href={serverUrl} target="_blank" rel="noreferrer">
              {serverUrl}
            </a>
          </p>
        )}

        {/* Lo que capturamos y guardamos */}
        <OrdenAImprimir
          ref={componentRef}
          firma={firma}
          despacho={despacho}
          productos={productos}
          empresa={empresa}
          proveedor={proveedor}
          companyLogoUrl="/brand/mk-logo.svg"
          theme={{
            brand: "#0E7C66",
            brandSoft: "#E6F2EF",
            radius: "16px",
            shadow: "0 10px 30px rgba(0,0,0,.08)",
            fontFamily:
              "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
            border: "#E5E7EB",
            mutedText: "#5B6069",
          }}
        />
      </div>
    </div>
  );
}
