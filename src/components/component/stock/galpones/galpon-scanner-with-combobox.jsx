"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import QrScannerComponent from "@/components/component/qr-scanner";

export default function GalponScannerWithCombobox({ onScanSuccess, description }) {
  const { toast } = useToast();

  useEffect(() => {
    loadGalpones();
  }, []);

  const loadGalpones = async () => {
    try {
      const response = await fetch("/api/syndra/catalogo/galpones");
      const data = await response.json();

      if (response.ok && data.Estado && data.Galpones) {
        setGalpones(data.Galpones);
      } else {
        toast({
          title: "Advertencia",
          description: "No se pudieron cargar los galpones",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error al cargar galpones:", error);
      toast({
        title: "Error",
        description: "Error al cargar el catálogo de galpones",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGalpones(false);
    }
  };

  return (
    <div className="space-y-4 p-4">

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-muted-foreground">O</span>
        </div>
      </div>

      <QrScannerComponent
        onScanSuccess={onScanSuccess}
        description={description}
      />
    </div>
  );
}
