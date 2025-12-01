"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SuccessUI from "@/components/ui/success-ui";
import StepContent from "@/components/component/stock/cosecha/step-content";

export default function Page() {
  const [activeStep, setActiveStep] = useState(1);
  const [campos, setCampos] = useState([]);
  const [sementeras, setSementeras] = useState([]);
  const [selectedCampo, setSelectedCampo] = useState("");
  const [selectedSementera, setSelectedSementera] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [imagen, setImagen] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [completeTask, setCompleteTask] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "home";
  const Steps = [1, 2, 3];

  useEffect(() => {
    fetchCampos();
  }, []);

  useEffect(() => {
    if (selectedCampo) {
      fetchSementeras(selectedCampo);
    } else {
      setSementeras([]);
      setSelectedSementera("");
    }
  }, [selectedCampo]);

  const fetchCampos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/syndra/catalogo/campos");
      const data = await response.json();

      if (response.ok && data.Estado) {
        setCampos(data.Campos || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al obtener los campos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar los campos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSementeras = async (codigoCampo) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/syndra/catalogo/sementeras?Almacen=${codigoCampo}`
      );
      const data = await response.json();

      if (response.ok && data.Estado) {
        setSementeras(data.Sementeras || []);
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al obtener las sementeras",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar las sementeras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagen(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSementera) {
      toast({
        title: "Error",
        description: "Debe seleccionar una sementera",
        variant: "destructive",
      });
      return;
    }

    if (!cantidad || parseFloat(cantidad) <= 0) {
      toast({
        title: "Error",
        description: "Debe ingresar una cantidad válida",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        Grano: 0,
        Sementera: parseInt(selectedSementera),
        Cantidad: parseFloat(cantidad),
        Imagen: imagen || "",
      };

      const response = await fetch("/api/syndra/agro/cosecha/cargar", {
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
          description: "Cosecha cargada correctamente",
          variant: "success",
        });

        setTimeout(() => {
          router.push(`/dashboard/stock/cosecha?from=${from}`);
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al cargar la cosecha",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => router.push(`/dashboard/stock/cosecha?from=${from}`)}
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
                Carga de Cosecha
              </CardTitle>
              <CardDescription className="text-center">
                Registre la cosecha realizada en el campo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <div className="mb-3">
                <div className="flex justify-between mb-2">
                  {Steps.map((step) => (
                    <div
                      key={step}
                      className={`w-1/3 h-2 rounded-full mx-1 ${
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
                <StepContent
                  activeStep={activeStep}
                  campos={campos}
                  sementeras={sementeras}
                  selectedCampo={selectedCampo}
                  setSelectedCampo={setSelectedCampo}
                  selectedSementera={selectedSementera}
                  setSelectedSementera={setSelectedSementera}
                  cantidad={cantidad}
                  setCantidad={setCantidad}
                  imagen={imagen}
                  handleImageUpload={handleImageUpload}
                  isLoading={isLoading}
                  setActiveStep={setActiveStep}
                  handleSubmit={handleSubmit}
                />
              )}
            </CardContent>
          </>
        )}
      </Card>
    </>
  );
}
