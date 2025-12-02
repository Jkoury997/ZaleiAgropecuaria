"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Plus, Filter } from "lucide-react";
import FiltrosCosecha from "@/components/component/stock/cosecha/filtros-cosecha";

function CosechaPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "agro";

  // Estados de datos
  const [campos, setCampos] = useState([]);
  const [cosechas, setCosechas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCampos, setIsLoadingCampos] = useState(false);
  const [filtrosActuales, setFiltrosActuales] = useState(null);

  // Cargar campos y filtros guardados al montar el componente
  useEffect(() => {
    fetchCampos();
    
    // Cargar filtros guardados desde localStorage
    const filtrosGuardados = localStorage.getItem('cosechaFiltros');
    if (filtrosGuardados) {
      try {
        const filtros = JSON.parse(filtrosGuardados);
        setFiltrosActuales(filtros);
      } catch (error) {
        console.error('Error al cargar filtros guardados:', error);
      }
    }
  }, []);

  const fetchCampos = async () => {
    setIsLoadingCampos(true);
    try {
      const response = await fetch("/api/syndra/catalogo/campos");
      const data = await response.json();
      setCampos(data.Campos || []);
    } catch (error) {
      console.error("Error al cargar campos:", error);
    } finally {
      setIsLoadingCampos(false);
    }
  };

  const handleBuscar = async (filtros) => {
    setFiltrosActuales(filtros);
    
    // Guardar filtros en localStorage
    localStorage.setItem('cosechaFiltros', JSON.stringify(filtros));
    
    setIsLoading(true);
    try {
      // Convertir fecha de yyyy-mm-dd a dd/mm/yyyy (sin usar Date para evitar UTC)
      const fechaFormateada = filtros.fecha 
        ? filtros.fecha.split('-').reverse().join('/')
        : '';
      
      const url = `/api/syndra/agro/cosecha/consultar?Sementera=${filtros.sementera}&Fecha=${fechaFormateada}`;
      const response = await fetch(url);
      const data = await response.json();
      setCosechas(data.Cosechas || []);
    } catch (error) {
      console.error("Error al cargar cosechas:", error);
      setCosechas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltrosActuales(null);
    setCosechas([]);
    
    // Limpiar filtros guardados de localStorage
    localStorage.removeItem('cosechaFiltros');
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

      {/* Componente de Filtros */}
      <FiltrosCosecha
        onBuscar={handleBuscar}
        onLimpiar={handleLimpiarFiltros}
        campos={campos}
        isLoadingCampos={isLoadingCampos}
        filtrosGuardados={filtrosActuales}
      />


      {/* Lista de Cosechas */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !filtrosActuales ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Seleccione los filtros y presione Buscar para ver las cosechas</p>
          </CardContent>
        </Card>
      ) : cosechas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <p>No se encontraron cosechas para los filtros seleccionados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {cosechas.map((cosecha, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {cosecha.Sementera || "Sementera"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Campo:</span>{" "}
                    {campos.find((c) => c.Codigo === filtrosActuales.campo)
                      ?.Descripcion || filtrosActuales.campo}
                  </div>
                  <div>
                    <span className="font-semibold">Cantidad:</span>{" "}
                    {cosecha.Cantidad} kg
                  </div>
                  <div>
                    <span className="font-semibold">Fecha:</span>{" "}
                    {new Date(cosecha.Fecha).toLocaleDateString()}
                  </div>
                  {cosecha.Grano && (
                    <div>
                      <span className="font-semibold">Grano:</span>{" "}
                      {cosecha.Grano}
                    </div>
                  )}
                  {cosecha.Imagen && (
                    <div className="mt-2">
                      <img
                        src={cosecha.Imagen}
                        alt="Cosecha"
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Botón flotante para agregar nueva cosecha */}
      <Button
        onClick={() => router.push(`/dashboard/stock/cosecha/cargar?from=${from}`)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>}>
      <CosechaPageContent />
    </Suspense>
  );
}
