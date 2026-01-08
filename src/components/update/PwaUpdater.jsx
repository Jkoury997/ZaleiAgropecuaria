"use client";

import { useEffect, useState } from "react";

export default function PwaUpdater() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // si tu SW lo registra otro plugin, podés borrar este register
    });

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      // Si ya hay uno esperando
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setShow(true);
      }

      // Cuando encuentra un update
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShow(true);
          }
        });
      });
    });

    // Cuando el nuevo SW toma control -> recargar
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  const updateNow = () => {
    if (!waitingWorker) return;
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed", bottom: 16, left: 16, right: 16,
      padding: 12, background: "black", color: "white",
      borderRadius: 12, display: "flex", gap: 12, alignItems: "center",
      justifyContent: "space-between", zIndex: 9999
    }}>
      <div>Hay una nueva versión disponible.</div>
      <button
        onClick={updateNow}
        style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer" }}
      >
        Actualizar
      </button>
    </div>
  );
}
