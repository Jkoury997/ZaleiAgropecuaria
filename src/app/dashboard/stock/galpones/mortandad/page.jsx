"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GalponScannerWithCombobox from "@/components/component/stock/galpones/galpon-scanner-with-combobox";
import SuccessUI from "@/components/ui/success-ui";
import MortandadForm from "@/components/component/stock/galpones/mortandad-form";

function MortandadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "avicola";
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(1);
  const [galpon, setGalpon] = useState("");
  const [lotes, setLotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [completeTask, setCompleteTask] = useState(false);
  const Steps = [1, 2];

  const handleScan = async (scannedData) => {
    setIsLoading(true);
    try {
      console.log("Galpón escaneado:", scannedData);
      setGalpon(scannedData);
      
      // Obtener los lotes del galpón
      const response = await fetch(`/api/syndra/rutinas/lotesGalpon?Galpon=${encodeURIComponent(scannedData)}`);
      const data = await response.json();

      if (response.ok && data.Estado) {
        // data.Lista contiene los lotes con Codigo y Descripcion
        const lotesData = data.Lista || [];
        setLotes(lotesData);
        
        if (lotesData.length > 0) {
          toast({
            title: "Galpón escaneado",
            description: `Galpón: ${scannedData} - ${lotesData.length} lote(s) encontrado(s)`,
            variant: "success",
          });
          setActiveStep(2);
        } else {
          toast({
            title: "Sin lotes activos",
            description: "No se encontraron lotes activos en este galpón",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: data.Mensaje || data.error || "Error al obtener los lotes del galpón",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al procesar el QR:", error);
      toast({
        title: "Error",
        description: "Error al procesar el código QR",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    if(isLoading) return;
    setIsLoading(true);

    try {
      const payload = {
        Fecha: formData.fecha,
        Galpon: formData.galpon,
        Lotes: formData.lotes,
        Observaciones: formData.observaciones,
      };

      console.log("Enviando payload:", payload);

      const response = await fetch("/api/syndra/rutinas/parteMortandad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.Estado) {
        toast({
          title: "Éxito",
          description: "Parte de mortandad registrado correctamente",
          variant: "success",
        });
        handleReset();
      } else {
        toast({
          title: "Error",
          description: data.Mensaje || data.error || "Error al registrar el parte de mortandad",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al enviar el parte:", error);
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(1);
    setGalpon("");
    setLotes([]);
    setCompleteTask(false);
    setIsLoading(false);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <GalponScannerWithCombobox
            onScanSuccess={handleScan}
            description="Escanear el código QR del galpón"
          />
        );
      case 2:
        return (
          <MortandadForm
            galpon={galpon}
            lotes={lotes}
            onSubmit={handleSubmit}
            onBack={() => setActiveStep(1)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => router.push(`/dashboard?step=galpones`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <Card>
        {completeTask ? (
          <SuccessUI />
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Mortandad
              </CardTitle>
              <CardDescription className="text-center">
                Registre la mortandad en el galpón
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  {Steps.map((step) => (
                    <div
                      key={step}
                      className={`w-1/2 h-2 rounded-full mx-1 ${
                        step <= activeStep ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500">
                  Paso {activeStep} de {Steps.length}
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                renderStepContent()
              )}
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    }>
      <MortandadPageContent />
    </Suspense>
  );
}
