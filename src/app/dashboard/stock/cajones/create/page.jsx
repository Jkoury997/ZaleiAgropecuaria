"use client";

import { useState, useEffect } from "react";
import ScanBarcode from "@/components/component/scan-barcode";
import { EnterGalpon } from "@/components/component/enter-galpon";
import { EnterQuantity } from "@/components/component/enter-quantity";
import { ArticleDetails } from "@/components/ui/articules-details";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import shortUUID from "short-uuid";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast"; // Importa el hook de toast
import UltimoImpreso from "@/components/component/stock/cajones/ultimo-impreso";

// Carga dinámica del componente QrPrinter
const QrPrinter = dynamic(() => import("@/components/component/qr-pdf-generator"), { ssr: false });

export default function Page() {
    const [isFirstScanComplete, setIsFirstScanComplete] = useState(false);
    const [isScanning, setIsScanning] = useState(true);
    const [activeStep, setActiveStep] = useState(1);
    const [galpon, setGalpon] = useState("");
    const [cantidad, setCantidad] = useState("");
    const [dataArticulo, setDataArticulo] = useState(null);
    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // Estado para gestionar la carga
    const { toast } = useToast(); // Usa el hook para mostrar el toast
    const [ultimoImpreso, setUltimoImpreso] = useState(null);
    const [mostrarUltimoQR, setMostrarUltimoQR] = useState(false);



    const Steps = [1, 2, 3, 4];

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isFirstScanComplete) {
                event.preventDefault();
                event.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [isFirstScanComplete]);

    const handleScan = async (data) => {
        setIsScanning(false);
        setIsLoading(true);

        try {
            const response = await fetch("/api/syndra/catalogo/articulo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Codebar: data }),
            });

            const result = await response.json();

            if (response.ok) {
                setDataArticulo(result);
                setActiveStep(2);
                setIsFirstScanComplete(true);
            } else {

                toast({
                    title: "Error Codigo de Barras",
                    description: result.error || "Error al obtener los datos del artículo.",
                    variant: "destructive",
                  }); // Muestra el toast de error
                setIsScanning(true);
            }
        } catch (err) {

            toast({
                title: "Error API",
                description: "Error durante la solicitud a la API",
                variant: "destructive",
              }); // Muestra el toast de error
            setIsScanning(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrevious = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleCreate = async (IdArticulo, Cantidad) => {

        setIsLoading(true);

        try {
            const response = await fetch("/api/syndra/avicola/cajon/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ IdArticulo, Cantidad }),
            });

            const result = await response.json();
            console.log(result)

            if (result.Estado) {
                const uuid = shortUUID.generate();
                const qrDataObject = {
                    uuid,
                    IdArticulo,
                    Cantidad,
                    Galpon: galpon,
                    IdPaquete: result.IdPaquete,
                    Fecha: new Date().toLocaleDateString("es-AR"),
                };

                console.log(qrDataObject)

                setQrData(JSON.stringify(qrDataObject));
                
                toast({
                    title: "Cajon Creado",
                    description:"El cajón ha sido creado con éxito.",
                    variant: "success",
                  });
                
                  setUltimoImpreso({
                    uuid,
                    IdArticulo,
                    Cantidad,
                    Galpon: galpon,
                    IdPaquete: result.IdPaquete,
                    Fecha: new Date().toLocaleDateString("es-AR"),
                    dataArticulo: dataArticulo
                });
                console.log(ultimoImpreso)

                setActiveStep(4);
            } else {
                toast({
                    title: "Error Cajon",
                    description:"Error al crear el cajón 2.",
                    variant: "destructive",
                  }); // Muestra el toast de error
            }
        } catch (err) {
            toast({
                title: "Error Api",
                description: "Error al crear el cajón. aca",
                variant: "destructive",
              }); // Muestra el toast de error

        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAnother = () => {
        setCantidad("");
        setGalpon("");
        setQrData(null);
        setDataArticulo(null);
        setActiveStep(1);
        setIsScanning(true);
        setIsFirstScanComplete(false);
        setIsLoading(false); // Asegúrate de resetear el estado de carga también
    };

    return (
        <div className="container mx-auto px-2 py-8">
            {ultimoImpreso && activeStep !== 4  && (
    <div className="mt-4 text-center">
        <UltimoImpreso data={ultimoImpreso}></UltimoImpreso>
    </div>
)}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Crear Cajón</CardTitle>
                    <CardDescription className="text-center">
                        Utiliza este formulario para crear un nuevo cajón en el sistema.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <div className="flex justify-between mb-2">
                            {Steps.map((step) => (
                                <div
                                    key={step}
                                    className={`w-1/4 h-2 rounded-full ${
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
                            <Spinner size="lg"/>
                        </div>
                        
                    ) : (
                        <>
                            {activeStep === 1 && <ScanBarcode onScanSuccess={handleScan} />}

                            {activeStep === 2 && (
                                <>
                                    <ArticleDetails dataArticulo={dataArticulo} Galpon={galpon} />
                                    <EnterGalpon
                                        Galpon={galpon}
                                        setGalpon={setGalpon}
                                        onPrevious={handlePrevious}
                                        onNext={() => setActiveStep(3)}
                                    />
                                </>
                            )}

                            {activeStep === 3 && (
                                <>
                                    <ArticleDetails
                                        dataArticulo={dataArticulo}
                                        Galpon={galpon}
                                        Cantidad={cantidad}
                                    />
                                    <EnterQuantity
                                        Cantidad={cantidad}
                                        setCantidad={setCantidad}
                                        Galpon={galpon}
                                        IdArticulo={dataArticulo?.Articulo?.IdArticulo}
                                        onPrevious={handlePrevious}
                                        onCreate={handleCreate}
                                    />
                                </>
                            )}

                            {activeStep === 4 && (
                                <>
                                    <QrPrinter qrData={qrData} apiResponse={dataArticulo} />
                                    <div className="flex justify-center mt-5">
            <Button
                className="bg-white text-gray-950 border-gray-950 border rounded hover:text-white"
                onClick={handleCreateAnother}
            >
                Crear otro Cajón
            </Button>
        </div>
                                </>
                            )}

                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
