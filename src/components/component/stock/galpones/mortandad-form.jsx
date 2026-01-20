"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Skull } from "lucide-react";

export default function MortandadForm({ galpon, lotes, onSubmit, onBack }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cantidades, setCantidades] = useState({});
  const [observaciones, setObservaciones] = useState("");
  const { toast } = useToast();

  const handleCantidadChange = (codigo, value) => {
    setCantidades(prev => ({
      ...prev,
      [codigo]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que al menos un lote tenga cantidad
    const hayDatos = Object.values(cantidades).some(c => c && parseInt(c) > 0);
    if (!hayDatos) {
      toast({
        title: "Error",
        description: "Debe ingresar al menos una cantidad de mortandad",
        variant: "destructive",
      });
      return;
    }

    // Formatear fecha a dd/mm/yyyy
    const [year, month, day] = fecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;

    // Preparar array con los lotes que tienen cantidades
    const lotesConCantidad = lotes
      .filter(lote => cantidades[lote.Codigo] && parseInt(cantidades[lote.Codigo]) > 0)
      .map(lote => ({
        Lote: lote.Codigo,
        Cantidad: parseInt(cantidades[lote.Codigo])
      }));

    onSubmit({
      fecha: fechaFormateada,
      galpon,
      lotes: lotesConCantidad,
      observaciones: observaciones || "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">
          <strong>Galpón:</strong> {galpon}
        </p>
      </div>

      <div>
        <Label htmlFor="fecha">Fecha</Label>
        <Input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          required
        />
      </div>

      {lotes && lotes.length > 0 ? (
        <div className="space-y-4">
          <Label className="text-base font-semibold">Mortandad por Lote</Label>
          {lotes.map((lote, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Skull className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Lote: {lote.Codigo}</span>
              </div>
              {lote.Descripcion && (
                <p className="text-sm text-gray-600">{lote.Descripcion}</p>
              )}
              <div>
                <Label htmlFor={`cantidad-${lote.Codigo}`}>Cantidad de aves muertas</Label>
                <Input
                  id={`cantidad-${lote.Codigo}`}
                  type="number"
                  placeholder="Ingrese cantidad"
                  value={cantidades[lote.Codigo] || ""}
                  onChange={(e) => handleCantidadChange(lote.Codigo, e.target.value)}
                  min="0"
                  step="1"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <p className="text-sm text-yellow-800">
            No se encontraron lotes activos en este galpón
          </p>
        </div>
      )}

      <div>
        <Label htmlFor="observaciones">Observaciones (opcional)</Label>
        <Textarea
          id="observaciones"
          placeholder="Ingrese observaciones adicionales"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Atrás
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={lotes && lotes.length === 0}
        >
          Registrar
        </Button>
      </div>
    </form>
  );
}
