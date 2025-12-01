"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import QrScannerComponent from "@/components/component/qr-scanner";
import { useToast } from "@/hooks/use-toast";
import ProductList from "@/components/component/stock/despacho/product-list";
import Signature from "@/components/component/stock/despacho/signature";
import SuccessUI from "@/components/ui/success-ui";
import OrdenDespacho from "@/components/component/stock/despacho/pdf-despacho";
import { Button } from "@/components/ui/button";
import PrintOrden from "@/components/component/stock/despacho/print-order";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const [activeStep, setActiveStep] = useState(1);
  const [productos, setProductos] = useState([]);
  const [despacho, setDespacho] = useState({});
  const [proveedor, setProveedor] = useState({});
  const [retiro, setRetiro] = useState([]);
  const [completeTask, setCompleteTask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [firma, setFirma] = useState(null);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "home";
  const Steps = [1, 2, 3, 4];
  const [orderRun, setOrderRun] = useState(0);

  const empresa = {
    nombre: "Zalei Agropecuaria S.A",
    direccion: "RP50 10000, B6005 Gral. Arenales, Provincia de Buenos Aires",
  };

  // Efecto para manejar la alerta al recargar la página
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (activeStep >= 2) {
        event.preventDefault();
        event.returnValue = ""; // Necesario para algunos navegadores
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [activeStep]);

  const handleScan = async (scannedData) => {
    setIsLoading(true);
    try {
      const parsedData = JSON.parse(scannedData);
      const { Id, Almacen } = parsedData;

      if (!Id || !Almacen) {
        throw new Error(
          "Faltan campos requeridos (Id o Almacen) en los datos del QR."
        );
      }

      const response = await fetch(
        `/api/syndra/agro/servicioDespacho?Id=${Id}&Almacen=${Almacen}`
      );
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor.");
      }

      const data = await response.json();
      console.log(data);
      setDespacho(data.Despacho);
      setProveedor(data.Proveedor);

      if (data.Despacho.Lista.length > 0) {
        setProductos(data.Despacho.Lista);
      }

      setActiveStep(2);
    } catch (error) {
      console.error(
        "Error al procesar los datos del QR:",
        error.message || error.Mensaje
      );
      toast({
        title: "Error al procesar los datos del QR",
        description: "Error al obtener los datos del QR.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetiro = async (retiroData) => {
    setIsLoading(true);
    console.log(retiroData);
    setRetiro(retiroData);
    try {
      console.log("Enviando retiro:", retiroData);

      // Tomar el CodAlmacen desde retiroData si existe, si no desde despacho
      const codAlmacenFromRetiro =
        retiroData?.[0]?.CodAlmacen || despacho?.CodAlmacen;
      const { Id } = despacho;

      if (!Id || !codAlmacenFromRetiro) {
        throw new Error(
          "Faltan campos requeridos (Id o CodAlmacen) en los datos del QR o retiroData."
        );
      }

      const response = await fetch(
        `/api/syndra/agro/servicioDespacho?Id=${Id}&Almacen=${codAlmacenFromRetiro}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productos: retiroData }),
        }
      );

      if (!response.ok) throw new Error("Error al procesar el retiro.");

      const result = await response.json();
      console.log("Retiro procesado correctamente:", result);
      setCompleteTask(true);

      setTimeout(() => {
        setActiveStep(3);
        setCompleteTask(false);
      }, 3000); // Pausa de 3 segundos (3000 milisegundos)
    } catch (error) {
      console.error("Error al procesar el retiro:", error.message);
      toast({
        title: "Error al procesar el retiro",
        description: "El retiro no se pudo procesar correctamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(1);
    setProductos([]);
    setDespacho({});
    setProveedor({});

    setRetiro([]);
    setFirma(null);
    setIsLoading(false);
    setCompleteTask(false);

    // Limpia el guard global (por las dudas)
    if (typeof window !== "undefined" && window.__savedOrders) {
      window.__savedOrders = new Set();
    }

    // Y forza nueva “corrida” para la próxima orden
    setOrderRun((n) => n + 1);
  };

  // Función que se ejecuta cuando se guarda la firma
  const handleSignatureSave = (dataURL) => {
    setFirma(dataURL);
    setActiveStep(4);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <QrScannerComponent
            onScanSuccess={handleScan}
            description="Escanear el QR de la orden de trabajo"
          />
        );
      case 2:
        return (
          <ProductList
            listProducts={productos}
            despachoInfo={despacho}
            onRetiraSubmit={handleRetiro}
          />
        );
      case 3:
        return <Signature onSave={handleSignatureSave} />;
      case 4:
        return (
          <div className="w-full max-w-full overflow-x-hidden">
            <PrintOrden
              firma={firma}
              proveedor={proveedor}
              despacho={despacho}
              productos={retiro}
              empresa={empresa}
              runKey={orderRun}
            />
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleReset}
                variant="outline"
                className="bg-black text-white"
              >
                Realizar otro despacho
              </Button>
            </div>
          </div>
        );
      default:
        return <div>Contenido del paso desconocido</div>;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => router.push(`/dashboard?step=${from}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      <Card>
        {completeTask ? (
          // Mostrar este contenido si completeTask es true
          <SuccessUI></SuccessUI>
        ) : (
          // Mostrar este contenido si completeTask es false
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Despacho Insumo
              </CardTitle>
              <CardDescription className="text-center">
                Utiliza este formulario para realizar despacho de insumo con
                orden de trabajo.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  {Steps.map((step) => (
                    <div
                      key={step}
                      className={`w-1/2 h-2 rounded-full ${
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
                <div className="flex justify-center items-center">
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
