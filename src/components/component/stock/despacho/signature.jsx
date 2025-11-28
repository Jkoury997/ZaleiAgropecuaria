"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Firma Digital responsive (mobile-ready)
 * - Ocupa el ancho real del contenedor (sin overflow).
 * - Mantiene aspecto; recalibra en resize/orientation sin deformar.
 * - Si pasás maxWidth="auto" o no pasás nada, usa 100% del contenedor.
 */
export default function Signature({
  onSave,
  maxWidth = "auto",           // "auto" ⇒ usa ancho del contenedor
  baseHeight = 240,            // alto cuando width = (maxWidth numérico) o base para aspect
  mobileMinWidth = 220,
  penColor = "#111",
  backgroundColor = "#fff",
}) {
  const sigCanvas = useRef(null);
  const cardRef = useRef(null);
  const containerRef = useRef(null);

  // Normalizamos maxWidth: número válido o null (auto)
  const numericMax = Number.isFinite(Number(maxWidth)) ? Number(maxWidth) : null;

  const [firmaURL, setFirmaURL] = useState(null);
  const [cssW, setCssW] = useState(300);
  const [cssH, setCssH] = useState(baseHeight);

  // ratio de aspecto estable
  const aspect = baseHeight / (numericMax || baseHeight / (baseHeight / 500)); // fallback estable

  useEffect(() => {
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  // Calcula tamaño objetivo (dentro del contenedor, sin desbordar)
  const calcTargetSize = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { w: 300, h: Math.round(300 * aspect) };

    // ancho disponible real del contenedor
    const available = Math.floor(el.getBoundingClientRect().width);

    // Si numericMax es null (auto) ⇒ no limitamos por max, solo por available
    const maxCap = numericMax ?? available;

    const w = Math.max(mobileMinWidth, Math.min(available, maxCap));
    const h = Math.round(w * aspect);
    return { w, h };
  }, [numericMax, mobileMinWidth, aspect]);

  // Redimensionar preservando firma
  const resizeCanvasSafely = useCallback((w, h) => {
    const instance = sigCanvas.current;
    if (!instance) return;

    const snapshot = instance.isEmpty() ? null : instance.toDataURL();

    setCssW(w);
    setCssH(h);

    requestAnimationFrame(() => {
      try {
        instance.clear();
        if (snapshot) {
          instance.fromDataURL(snapshot, { ratio: 1, width: w, height: h });
        }
      } catch {
        instance.clear();
      }
    });
  }, []);

  // Observa resize/orientación
  useEffect(() => {
    const apply = () => {
      const { w, h } = calcTargetSize();
      if (w !== cssW || h !== cssH) resizeCanvasSafely(w, h);
    };

    apply();

    const ro = new ResizeObserver(apply);
    if (containerRef.current) ro.observe(containerRef.current);

    window.addEventListener("orientationchange", apply);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", apply);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calcTargetSize, resizeCanvasSafely]);

  const handleEnd = () => {
    if (!sigCanvas.current) return;
    setFirmaURL(sigCanvas.current.toDataURL());
  };

  const limpiar = () => {
    sigCanvas.current?.clear();
    setFirmaURL(null);
  };

  const guardar = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert("Por favor, realizá una firma antes de guardar.");
      return;
    }
    const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
    setFirmaURL(dataURL);
    onSave?.(dataURL);
  };

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-full md:max-w-2xl mx-auto" // no desborda en mobile
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Firma Digital</CardTitle>
      </CardHeader>

      <CardContent className="!p-4 pt-2"> {/* menos padding ayuda en pantallas chicas */}
        <div
          ref={containerRef}
          className="border border-gray-300 rounded-md overflow-hidden w-full max-w-full"
        >
          <SignatureCanvas
            ref={sigCanvas}
            penColor={penColor}
            backgroundColor={backgroundColor}
            minWidth={0.8}
            maxWidth={2.5}
            throttle={8}
            onEnd={handleEnd}
            canvasProps={{
              className: "block touch-none select-none max-w-full",
              // CSS size (lo visible) — no excede contenedor
              style: { width: `${cssW}px`, height: `${cssH}px`, maxWidth: "100%" },
              // Tamaño interno del canvas
              width: cssW,
              height: cssH,
            }}
          />
        </div>

      </CardContent>

      <CardFooter className="flex justify-between gap-2">
        <Button onClick={limpiar} variant="outline" className="flex-1">
          Limpiar
        </Button>
        <Button onClick={guardar} className="flex-1">
          Guardar Firma
        </Button>
      </CardFooter>
    </Card>
  );
}
