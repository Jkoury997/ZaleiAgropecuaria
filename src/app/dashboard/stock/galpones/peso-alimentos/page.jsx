"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QrScannerComponent from "@/components/component/qr-scanner";
import SuccessUI from "@/components/ui/success-ui";
import PesoAlimentosForm from "@/components/component/stock/galpones/peso-alimentos-form";

function PesoAlimentosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "avicola";
  const { toast } = useToast();

  const [activeStep, setActiveStep] = useState(2);
  const [galpon, setGalpon] = useState("GPOS1");
  const [isLoading, setIsLoading] = useState(false);
  const [completeTask, setCompleteTask] = useState(false);
  const Steps = [1, 2];

  const handleScan = async (scannedData) => {
    setIsLoading(true);
    try {
      // Por ahora solo guardamos el string escaneado
      console.log("Galpón escaneado:", scannedData);
      setGalpon(scannedData);
      
      toast({
        title: "Galpón escaneado",
        description: `Galpón: ${scannedData}`,
        variant: "success",
      });
      
      setActiveStep(2);
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
    setIsLoading(true);
    try {
      const payload = {
        Fecha: formData.fecha,
        Galpon: galpon,
        Kilos: parseFloat(formData.kilos),
        Observaciones: formData.observaciones,
        Imagen: formData.imagen,
      };

      console.log("Enviando payload:", payload);

      const response = await fetch("/api/syndra/rutinas/parteAlimento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.Estado) {
        setCompleteTask(true);
        toast({
          title: "Éxito",
          description: "Parte de alimento registrado correctamente",
          variant: "success",
        });

        setTimeout(() => {
          handleReset();
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: data.Mensaje || "Error al registrar el parte de alimento",
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
    setActiveStep(2);
    setGalpon("GPOS1");
    setCompleteTask(false);
    setIsLoading(false);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <QrScannerComponent
            onScanSuccess={handleScan}
            description="Escanear el código QR del galpón"
          />
        );
      case 2:
        return (
          <PesoAlimentosForm
            galpon={galpon}
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
                Peso de Alimentos
              </CardTitle>
              <CardDescription className="text-center">
                Registre el peso de alimentos en el galpón
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
      <PesoAlimentosPageContent />
    </Suspense>
  );
}
