import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { StepNavigation } from "@/components/component/step-navigation"; // Asegúrate de tener la ruta correcta

export function EnterQuantity({ Cantidad, setCantidad, Galpon, IdArticulo, onPrevious, onCreate }) {
  const handleChange = (e) => {
    let value = parseFloat(e.target.value);

    if (isNaN(value)) {
      setCantidad("");
      return;
    }

    if (value < 0) {
      value = 0;
    } else if (value > 30) {
      value = 30;
    }

    if (value % 0.5 !== 0) {
      value = Math.floor(value * 2) / 2;
    }

    setCantidad(value);
  };

  const handleCreate = () => {
    // Llama a la función onCreate, que viene de Page.js
    if (IdArticulo && Cantidad) {
      onCreate(IdArticulo, Cantidad);
    }
  };

  return (
    <div className="grid gap-4 p-2 pt-1">
      <div className="grid gap-2">
        <Label htmlFor="Cantidad">Cantidad</Label>
        <Input
          id="Cantidad"
          type="number"
          step="0.5"
          placeholder="Ingresa la cantidad (múltiplos de 0.5)"
          value={Cantidad}
          onChange={handleChange}
          min="0"
          max="30"
        />
      </div>
      <StepNavigation 
        onPrevious={onPrevious} 
        onNext={handleCreate} 
        isNextDisabled={!Cantidad} 
      />
    </div>
  );
}
