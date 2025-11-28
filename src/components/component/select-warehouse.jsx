import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function SelectWarehouse({ title, warehouse, setWarehouse }) {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        const response = await fetch("/api/syndra/catalogo/almacenespallets");

        if (!response.ok) {
          throw new Error("Error fetching warehouses");
        }

        const data = await response.json();

        if (data.Estado) {
          const transformedWarehouses = data.Almacenes.map(almacen => ({
            value: almacen.Codigo,
            label: almacen.Descripcion,
          }));

          setWarehouses(transformedWarehouses);
        } else {
          throw new Error(data.Mensaje || "Error desconocido al obtener almacenes");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWarehouse();
  }, []);

  return (
    <div className="grid gap-2">
      <Label htmlFor="warehouse">{title}</Label>
      {loading ? (
        <p>Cargando almacenes...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <Select value={warehouse} onValueChange={(value) => setWarehouse(value)}>
          <SelectTrigger id="warehouse">
            <SelectValue placeholder="Selecciona un almacén" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((warehouse) => (
              <SelectItem key={warehouse.value} value={warehouse.value}>
                {warehouse.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
