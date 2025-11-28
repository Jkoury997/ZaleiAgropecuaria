import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export function PopupWarehouse({ pallet, isOpen, onClose, onSuccess }) {
  const [warehouses, setWarehouses] = useState([]);
  const [fromWarehouse, setFromWarehouse] = useState(pallet.location);
  const [toWarehouse, setToWarehouse] = useState("");
  const [alert, setAlert] = useState({ show: false, type: '', title: '', message: '' });

  useEffect(() => {
    fetchPalletWarehouse();
  }, []);

  const fetchPalletWarehouse = async () => {
    try {
      const response = await fetch("/api/syndra/catalogo/almacenespallets", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      console.log(result);

      if (response.status === 200 && result.Estado) {
        const transformedData = result.Almacenes.map(almacen => ({
          Codigo: almacen.Codigo,
          Descripcion: almacen.Descripcion,
        }));

        setWarehouses(transformedData);
      } else {
        console.error("Failed to fetch pallets:", result.Mensaje);
        showAlert("error", "Error", "Failed to fetch warehouses.");
      }
    } catch (error) {
      console.error("Error fetching pallets:", error);
      showAlert("error", "Error", "Error fetching warehouses.");
    }
  };

  const handleSubmit = async () => {
    const dataToSend = {
      IdPallet: pallet.IdPallet,
      AlmacenOrigen: fromWarehouse,
      AlmacenDestino: toWarehouse,
    };

    try {
      const response = await fetch("/api/syndra/avicola/pallet/move", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        console.log("Pallet moved successfully:", data);
        onSuccess("success", "Success", "Pallet moved successfully.");
        onClose();
      } else {
        console.error("Error moving pallet:", data);
        showAlert("error", "Error", "Failed to move pallet.");
      }
    } catch (error) {
      console.error("Error moving pallet:", error);
      showAlert("error", "Error", "Error moving pallet.");
    }
  };

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
    setTimeout(() => {
      setAlert({ show: false, type: '', title: '', message: '' });
    }, 5000); // Hide alert after 5 seconds
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Warehouse</DialogTitle>
          <DialogDescription>
            Select the warehouse you want to move from and the new warehouse to switch to.
          </DialogDescription>
          {alert.show && <Alert type={alert.type} title={alert.title} message={alert.message} />}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="from-warehouse" className="w-24">
              From:
            </Label>
            <Select id="from-warehouse" value={fromWarehouse} onValueChange={setFromWarehouse} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.Codigo} value={warehouse.Codigo}>
                      {warehouse.Descripcion}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="to-warehouse" className="w-24">
              To:
            </Label>
            <Select id="to-warehouse" value={toWarehouse} onValueChange={setToWarehouse}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.Codigo} value={warehouse.Codigo}>
                      {warehouse.Descripcion}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>
            Confirm
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
