"use client";
import { useState, useEffect, Suspense } from "react";
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

function CargarCosechaContent() {
  const [activeStep, setActiveStep] = useState(1);
  const [campos, setCampos] = useState([]);
  const [sementeras, setSementeras] = useState([]);
  const [selectedCampo, setSelectedCampo] = useState("");
  const [selectedSementera, setSelectedSementera] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [imagen, setImagen] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completeTask, setCompleteTask] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "home";
  const Steps = [1, 2, 3];

  useEffect(() => {
    fetchCampos();
    
    // Cargar última carga desde localStorage (independiente de los filtros)
    const ultimaCarga = localStorage.getItem('cosechaUltimaCarga');
    if (ultimaCarga) {
      try {
        const datos = JSON.parse(ultimaCarga);
        // Pre-seleccionar campo y sementera de la última carga
        if (datos.campo) {
          setSelectedCampo(datos.campo);
          // Cargar sementeras del campo guardado
          fetchSementeras(datos.campo).then(() => {
            if (datos.sementera) {
              setSelectedSementera(datos.sementera);
            }
          });
        }
      } catch (error) {
        console.error('Error al cargar última carga:', error);
      }
    }
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
        return data.Sementeras || [];
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al obtener las sementeras",
          variant: "destructive",
        });
        return [];
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar las sementeras",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log('[ImageUpload] Archivo seleccionado:', file);
    
    if (file) {
      // Comprimir la imagen antes de procesarla
      console.log('[ImageUpload] Tamaño original:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.onload = async () => {
          // Crear canvas para redimensionar
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calcular nuevas dimensiones (máximo 1200px en el lado más largo)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Dibujar imagen redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con calidad reducida
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          console.log('[ImageUpload] Imagen comprimida, longitud:', compressedBase64.length);
          console.log('[ImageUpload] Tamaño aproximado:', (compressedBase64.length / 1024 / 1024).toFixed(2), 'MB');
          
          setImagen(compressedBase64);
          
          // Analizar imagen automáticamente
          console.log('[ImageUpload] Iniciando análisis de imagen...');
          setIsAnalyzing(true);
          try {
            console.log('[ImageUpload] Enviando request a /api/ia/analyze/img');
            const response = await fetch("/api/ia/analyze/img", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ image: compressedBase64 }),
            });

            console.log('[ImageUpload] Response status:', response.status);
            const data = await response.json();
            console.log('[ImageUpload] Response data:', data);

            if (response.ok && data.success && data.data) {
              // Cargar automáticamente la cantidad detectada
              const detectedNumber = data.data.toString();
              console.log('[ImageUpload] Número detectado:', detectedNumber);
              setCantidad(detectedNumber);
              toast({
                title: "Análisis completado",
                description: `Cantidad detectada: ${detectedNumber} kg`,
                variant: "success",
              });
            } else {
              console.log('[ImageUpload] No se detectó número o respuesta no exitosa');
              toast({
                title: "Advertencia",
                description: "No se pudo detectar un número en la imagen. Ingrese la cantidad manualmente.",
                variant: "default",
              });
            }
          } catch (error) {
            console.error('[ImageUpload] Error al analizar imagen:', error);
            toast({
              title: "Error",
              description: "Error al analizar la imagen. Ingrese la cantidad manualmente.",
              variant: "destructive",
            });
          } finally {
            console.log('[ImageUpload] Análisis finalizado');
            setIsAnalyzing(false);
          }
        };
        img.src = reader.result;
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
        // Guardar la última carga para pre-seleccionar en próximas cargas
        localStorage.setItem('cosechaUltimaCarga', JSON.stringify({
          campo: selectedCampo,
          sementera: selectedSementera,
        }));
        
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
                  isAnalyzing={isAnalyzing}
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

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>}>
      <CargarCosechaContent />
    </Suspense>
  );
}
