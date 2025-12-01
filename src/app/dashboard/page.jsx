"use client";
import IconGrid from "@/components/component/acces-fast";
import {
  HomeIcon,
  EggIcon,
  PackageIcon,
  WarehouseIcon,
  ClipboardList,
  BirdIcon,
  SproutIcon,
  ArrowLeft,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const [showDialog, setShowDialog] = useState(false);
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState(stepParam || "home");
  const { toast } = useToast();

  // Check if the choice is already stored in localStorage
  useEffect(() => {
    const choice = localStorage.getItem("device");
    console.log("Device choice in localStorage:", choice);
    if (!choice) {
      setShowDialog(true);
    }
  }, []);

  // Actualizar el step cuando cambia el parámetro de la URL
  useEffect(() => {
    if (stepParam) {
      setCurrentStep(stepParam);
    }
  }, [stepParam]);

  const handleChoice = (choice) => {
    localStorage.setItem("device", choice);
    setShowDialog(false);
  };

  // Definir los items según el paso actual
  const getItems = () => {
    switch (currentStep) {
      case "home":
        return [
          { 
            name: "Avícola", 
            icon: BirdIcon, 
            onClick: () => setCurrentStep("avicola") 
          },
          { 
            name: "Agro", 
            icon: SproutIcon, 
            onClick: () => setCurrentStep("agro") 
          },
        ];
      
      case "avicola":
        return [
          { name: "Cajones", icon: EggIcon, url: "/dashboard/stock/cajones/create?from=avicola" },
          { name: "Paquetes", icon: PackageIcon, url: "/dashboard/stock/pallets/move?from=avicola" },
          { name: "Galpones", icon: WarehouseIcon, url: "/dashboard/stock/galpones?from=avicola" },
        ];
      
      case "agro":
        return [
          { name: "Despachos", icon: ClipboardList, url: "/dashboard/stock/despachos?from=agro" },
          { name: "Cosecha", icon: SproutIcon, url: "/dashboard/stock/cosecha?from=agro" },
        ];
      
      default:
        return [];
    }
  };

  return (
    <>
      {/* Show the dialog automatically if showDialog is true */}
      <AlertDialog open={showDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seleccione un dispositivo</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea usar la cámara o el lector?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="mb-2" onClick={() => handleChoice("camera")}>
              Usar Cámara
            </AlertDialogAction>
            <AlertDialogAction className="mb-2" onClick={() => handleChoice("reader")}>
              Usar Lector
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4">
        {/* Título con botón de volver integrado */}
        <div className="flex items-center gap-2 mb-4">
          {currentStep !== "home" && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setCurrentStep("home")}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">
            {currentStep === "home" && "Inicio"}
            {currentStep === "avicola" && "Avícola"}
            {currentStep === "agro" && "Agro"}
          </h2>
        </div>

        {/* Render the IconGrid */}
        <IconGrid items={getItems()} />
      </div>
    </>
  );
}
