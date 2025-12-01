"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Filter, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function FiltrosCosecha({
  onBuscar,
  onLimpiar,
  campos = [],
  isLoadingCampos = false,
}) {
  const [sementeras, setSementeras] = useState([]);
  const [selectedCampo, setSelectedCampo] = useState("");
  const [selectedSementera, setSelectedSementera] = useState("");
  const [selectedFecha, setSelectedFecha] = useState(new Date());
  const [openCampo, setOpenCampo] = useState(false);
  const [openSementera, setOpenSementera] = useState(false);
  const [isLoadingSementeras, setIsLoadingSementeras] = useState(false);

  // Cargar sementeras cuando se selecciona un campo
  useEffect(() => {
    if (selectedCampo) {
      fetchSementeras(selectedCampo);
    } else {
      setSementeras([]);
      setSelectedSementera("");
    }
  }, [selectedCampo]);

  const fetchSementeras = async (codigoCampo) => {
    setIsLoadingSementeras(true);
    try {
      const response = await fetch(
        `/api/syndra/catalogo/sementeras?Almacen=${codigoCampo}`
      );
      const data = await response.json();
      setSementeras(data.Sementeras || []);
    } catch (error) {
      console.error("Error al cargar sementeras:", error);
    } finally {
      setIsLoadingSementeras(false);
    }
  };

  const handleBuscar = () => {
    if (selectedSementera && selectedFecha) {
      // Formatear fecha a yyyy-mm-dd
      const year = selectedFecha.getFullYear();
      const month = String(selectedFecha.getMonth() + 1).padStart(2, '0');
      const day = String(selectedFecha.getDate()).padStart(2, '0');
      const fechaFormateada = `${year}-${month}-${day}`;
      
      onBuscar({
        campo: selectedCampo,
        sementera: selectedSementera,
        fecha: fechaFormateada,
      });
    }
  };

  const handleLimpiar = () => {
    setSelectedCampo("");
    setSelectedSementera("");
    setSelectedFecha(new Date());
    setSementeras([]);
    onLimpiar();
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Búsqueda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Campo Combobox */}
          <div className="space-y-2">
            <Label>Campo</Label>
            <Popover open={openCampo} onOpenChange={setOpenCampo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCampo}
                  className="w-full justify-between"
                  disabled={isLoadingCampos}
                >
                  {isLoadingCampos ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Cargando...
                    </span>
                  ) : selectedCampo ? (
                    campos.find((campo) => campo.Codigo === selectedCampo)
                      ?.Descripcion
                  ) : (
                    "Seleccione un campo..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar campo..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron campos.</CommandEmpty>
                    <CommandGroup>
                      {campos.map((campo) => (
                        <CommandItem
                          key={campo.Codigo}
                          value={campo.Descripcion}
                          onSelect={() => {
                            setSelectedCampo(campo.Codigo);
                            setOpenCampo(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCampo === campo.Codigo
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {campo.Descripcion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Sementera Combobox */}
          <div className="space-y-2">
            <Label>Sementera</Label>
            <Popover open={openSementera} onOpenChange={setOpenSementera}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSementera}
                  className="w-full justify-between"
                  disabled={!selectedCampo || isLoadingSementeras}
                >
                  {isLoadingSementeras ? (
                    <span className="flex items-center gap-2">
                      <Spinner size="sm" />
                      Cargando...
                    </span>
                  ) : selectedSementera ? (
                    sementeras.find(
                      (sem) => sem.Codigo === parseInt(selectedSementera)
                    )?.Descripcion
                  ) : (
                    "Seleccione una sementera..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Buscar sementera..." />
                  <CommandList>
                    <CommandEmpty>No se encontraron sementeras.</CommandEmpty>
                    <CommandGroup>
                      {sementeras.map((sementera) => (
                        <CommandItem
                          key={sementera.Codigo}
                          value={sementera.Descripcion}
                          onSelect={() => {
                            setSelectedSementera(sementera.Codigo.toString());
                            setOpenSementera(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedSementera === sementera.Codigo.toString()
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {sementera.Descripcion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha */}
          <div className="space-y-2">
            <Label>Fecha</Label>
            <DatePicker
              selected={selectedFecha}
              onChange={(date) => setSelectedFecha(date)}
              dateFormat="dd/MM/yyyy"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleLimpiar}>
            Limpiar Filtros
          </Button>
          <Button 
            onClick={handleBuscar}
            disabled={!selectedSementera || !selectedFecha}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
