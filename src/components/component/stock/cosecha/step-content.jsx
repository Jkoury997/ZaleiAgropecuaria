"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Spinner } from "@/components/ui/spinner";

export default function StepContent({
  activeStep,
  campos,
  sementeras,
  selectedCampo,
  setSelectedCampo,
  selectedSementera,
  setSelectedSementera,
  cantidad,
  setCantidad,
  imagen,
  handleImageUpload,
  isLoading,
  isAnalyzing,
  setActiveStep,
  handleSubmit,
}) {
  const [openCampo, setOpenCampo] = useState(false);
  const [openSementera, setOpenSementera] = useState(false);

  switch (activeStep) {
    case 1:
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Campo</Label>
            <Popover open={openCampo} onOpenChange={setOpenCampo}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCampo}
                  className="w-full justify-between"
                  disabled={isLoading}
                >
                  {isLoading ? (
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
              <PopoverContent className="w-full p-0" align="start">
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

          <div className="space-y-2">
            <Label>Sementera</Label>
            <Popover open={openSementera} onOpenChange={setOpenSementera}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openSementera}
                  className="w-full justify-between"
                  disabled={!selectedCampo || isLoading}
                >
                  {isLoading ? (
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
              <PopoverContent className="w-full p-0" align="start">
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

          <Button
            onClick={() => setActiveStep(2)}
            disabled={!selectedCampo}
            className="w-full"
          >
            Continuar
          </Button>
        </div>
      );

    case 2:
      return (
        <div className="space-y-4">
            <div>
            <Label>Foto*</Label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                id="photo-upload"
                required
              />
              <label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <span>
                    <Camera className="mr-2 h-4 w-4" />
                    Tomar Foto
                  </span>
                </Button>
              </label>
              {imagen && (
                <div className="mt-2">
                  <img
                    src={imagen}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="cantidad">Cantidad (kg)</Label>
            <Input
              id="cantidad"
              type="number"
              placeholder={isAnalyzing ? "Analizando imagen..." : "Ingrese la cantidad en kg"}
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              min="0"
              step="0.01"
              disabled={isAnalyzing}
            />
            {isAnalyzing && (
              <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
                <Spinner size="sm" />
                Detectando cantidad en la imagen...
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveStep(1)}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button
              onClick={() => setActiveStep(3)}
              disabled={!cantidad}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </div>
      );

    case 3:
      return (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
            <h3 className="font-semibold">Resumen de Cosecha</h3>
            <p>
              <strong>Campo:</strong>{" "}
              {campos.find((c) => c.Codigo === selectedCampo)?.Descripcion}
            </p>
            <p>
              <strong>Sementera:</strong>{" "}
              {
                sementeras.find(
                  (s) => s.Codigo === parseInt(selectedSementera)
                )?.Descripcion
              }
            </p>
            <p>
              <strong>Cantidad:</strong> {cantidad} kg
            </p>
            <p>
              <strong>Foto:</strong> {imagen ? "Sí" : "No"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveStep(2)}
              className="flex-1"
            >
              Atrás
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Confirmar y Cargar
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
