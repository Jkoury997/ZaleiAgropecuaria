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
  Scale,
  Skull,
} from "lucide-react";

import { useEffect, useState, Suspense } from "react";
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

function DashboardContent() {
  const [showDialog, setShowDialog] = useState(false);
  const searchParams = useSearchParams();
  const stepParam = searchParams.get('step');
  const [currentStep, setCurrentStep] = useState(stepParam || "home");
  const { toast } = useToast();

  // Estructura de navegación jerárquica
  const navigationStructure = [
    {
      id: "avicola",
      name: "Avícola",
      icon: BirdIcon,
      items: [
        { 
          id: "cajones",
          name: "Cajones", 
          icon: EggIcon, 
          url: "/dashboard/stock/cajones/create?from=avicola" 
        },
        { 
          id: "paquetes",
          name: "Paquetes", 
          icon: PackageIcon, 
          url: "/dashboard/stock/pallets/move?from=avicola" 
        },
        { 
          id: "galpones",
          name: "Galpones", 
          icon: WarehouseIcon,
          items: [
            { 
              id: "peso-alimentos",
              name: "Peso de Alimentos", 
              icon: Scale, 
              url: "/dashboard/stock/galpones/peso-alimentos?from=avicola" 
            },
            { 
              id: "mortandad",
              name: "Mortandad", 
              icon: Skull, 
              url: "/dashboard/stock/galpones/mortandad?from=avicola" 
            },
          ]
        },
      ]
    },
    {
      id: "agro",
      name: "Agro",
      icon: SproutIcon,
      items: [
        { 
          id: "despachos",
          name: "Despachos", 
          icon: ClipboardList, 
          url: "/dashboard/stock/despachos?from=agro" 
        },
        { 
          id: "cosecha",
          name: "Cosecha", 
          icon: SproutIcon, 
          url: "/dashboard/stock/cosecha?from=agro" 
        },
      ]
    }
  ];

  // Función para encontrar el camino hacia un step
  const findPath = (stepId, structure = navigationStructure, path = []) => {
    for (const item of structure) {
      if (item.id === stepId) {
        return [...path, item.id];
      }
      if (item.items) {
        const result = findPath(stepId, item.items, [...path, item.id]);
        if (result) return result;
      }
    }
    return null;
  };

  // Función para obtener el título actual
  const getCurrentTitle = () => {
    if (currentStep === "home") return "Inicio";
    
    const findItemById = (id, structure = navigationStructure) => {
      for (const item of structure) {
        if (item.id === id) return item.name;
        if (item.items) {
          const found = findItemById(id, item.items);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findItemById(currentStep) || "Dashboard";
  };

  // Función para ir hacia atrás en la navegación
  const goBack = () => {
    const path = findPath(currentStep);
    if (path && path.length > 1) {
      // Volver al paso anterior en el path
      setCurrentStep(path[path.length - 2]);
    } else {
      // Si no hay path o solo tiene un elemento, volver a home
      setCurrentStep("home");
    }
  };

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
    if (currentStep === "home") {
      // Mostrar las opciones principales
      return navigationStructure.map(item => ({
        name: item.name,
        icon: item.icon,
        onClick: () => setCurrentStep(item.id)
      }));
    }

    // Buscar el item actual en la estructura
    const findCurrentItem = (id, structure = navigationStructure) => {
      for (const item of structure) {
        if (item.id === id) return item;
        if (item.items) {
          const found = findCurrentItem(id, item.items);
          if (found) return found;
        }
      }
      return null;
    };

    const currentItem = findCurrentItem(currentStep);
    
    if (currentItem && currentItem.items) {
      // Si el item actual tiene subitems, mostrarlos
      return currentItem.items.map(subItem => ({
        name: subItem.name,
        icon: subItem.icon,
        ...(subItem.url ? { url: subItem.url } : { onClick: () => setCurrentStep(subItem.id) })
      }));
    }

    return [];
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
              onClick={goBack}
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}
          <h2 className="text-2xl font-bold">
            {getCurrentTitle()}
          </h2>
        </div>

        {/* Render the IconGrid */}
        <IconGrid items={getItems()} />
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
