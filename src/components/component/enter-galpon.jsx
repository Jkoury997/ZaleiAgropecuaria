import React from 'react';
import { Label } from "@/components/ui/label";
import { StepNavigation } from "@/components/component/step-navigation"; // Asegúrate de tener la ruta correcta

export function EnterGalpon({ Galpon, setGalpon, onPrevious, onNext }) {
  const handleChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setGalpon(value);
  };

  return (
    <div className="grid gap-4 p-2">
      <div className="grid gap-2">
        <Label htmlFor="Galpon">Número de Galpón</Label>
        <select
          id="Galpon"
          value={Galpon || ""}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="" disabled>
            Seleccionar número de galpón
          </option>
          {[...Array(9).keys()].map((i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>

      {Galpon && ( // Mostrar los botones solo si se ha seleccionado un galpón
        <StepNavigation 
          onPrevious={onPrevious} 
          onNext={onNext} 
          isNextDisabled={!Galpon} 
        />
      )}
    </div>
  );
}