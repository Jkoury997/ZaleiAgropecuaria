"use client"
import React, { useState, useEffect } from "react";
import QrScannerComponent from "@/components/component/qr-scanner";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import DepositoInfo from "@/components/ui/deposit-info";
import { Button } from "@/components/ui/button";
import ListPackets from "@/components/component/list-packed";
import StatusBadge from "@/components/ui/badgeAlert";
import { useToast } from "@/hooks/use-toast"; // Importa el hook de toast
import { Spinner } from "@/components/ui/spinner";


export default function Page() {
  const [isFirstScanComplete, setIsFirstScanComplete] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false); // Estado para manejar el indicador de carga
  const [successBadge, setSuccessBadge] = useState(null);
  const [errorBadge, setErrorBadge] = useState(null);
  const [availableDeposits, setAvailableDeposits] = useState([]);
  const [depositOrigin, setDepositOrigin] = useState(null);
  const [depositFinal, setDepositFinal] = useState(null);
  const [scannedPackages, setScannedPackages] = useState([]);
  const [scannedUUIDs, setScannedUUIDs] = useState([]);
  const { toast } = useToast(); // Usa el hook para mostrar el toast

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

  const fetchDeposits = async () => {
    setIsLoading(true); // Activar loading
    try {
      const response = await fetch("/api/syndra/catalogo/almacenespallets");
      const data = await response.json();
      if (response.ok && data.Estado) {
        setAvailableDeposits(data.Almacenes);
        return data.Almacenes;
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al obtener los depósitos",
          variant: "destructive",
        });
        return null;
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Error al realizar la solicitud",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false); // Desactivar loading
    }
  };

  const handleScanOrigin = async (scannedData) => {

    setIsLoading(true); // Mostrar indicador de carga
    const deposits = await fetchDeposits();

    if (!deposits) {
      toast({
        title: "Error",
        description: "No se pudieron obtener los depósitos.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const foundDeposit = deposits.find(
      (deposit) => deposit.Codigo === scannedData
    );

    if (foundDeposit) {
      setDepositOrigin(foundDeposit);
      toast({
        title: "Depósito Confirmado",
        description: "Depósito Origen confirmado.",
        variant: "success",
      });
      setActiveStep(2);
      setIsFirstScanComplete(true);
    } else {
      toast({
        title: "Error",
        description: "Depósito de origen no encontrado en la lista de depósitos disponibles.",
        variant: "destructive",
      });
    }

    setIsLoading(false); // Ocultar indicador de carga
  };

  const handleScanFinal = async (scannedData) => {

    setIsLoading(true); // Mostrar indicador de carga

    const foundDeposit = availableDeposits.find(
      (deposit) => deposit.Codigo === scannedData
    );

    if (foundDeposit && foundDeposit.Codigo === depositOrigin?.Codigo) {
      toast({
        title: "Error",
        description: "Depósito Final no puede ser igual al Depósito Origen.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (foundDeposit) {
      setDepositFinal(foundDeposit);
      toast({
        title: "Depósito Confirmado",
        description: "Depósito Final confirmado.",
        variant: "success",
      });
      setActiveStep(3);
    } else {
      toast({
        title: "Error",
        description: "Depósito final no encontrado en la lista de depósitos disponibles.",
        variant: "destructive",
      });
    }

    setIsLoading(false); // Ocultar indicador de carga
  };
  const handleScanPackage = async (scannedData) => {

    setErrorBadge(null)
    setSuccessBadge(null);

    setIsLoading(true); // Mostrar indicador de carga
    try {
      const parsedData = JSON.parse(scannedData);
      const { uuid, IdPaquete } = parsedData;
      console.log(scannedUUIDs);
      // Verificar si el UUID ya ha sido escaneado
      if (scannedUUIDs.includes(uuid)) {
        setSuccessBadge("");
        setErrorBadge(`El paquete ${IdPaquete} ya ha sido escaneado.`);
        return;
      }

      const paqueteExiste = await fetchCheckPaquete(IdPaquete)
      if (!paqueteExiste) {
        setSuccessBadge("");
        setErrorBadge(`El Paquete ${IdPaquete} no se encontró.`);
        return;
      }

      console.log(paqueteExiste)

      const almacenPaquete = paqueteExiste[0].Almacen.trim()

      if(almacenPaquete !== depositOrigin.Codigo){
        setSuccessBadge("");
        setErrorBadge(`El paquete ${IdPaquete} pertenece a un almacén de origen: ${almacenPaquete}.`);
        return
      }

      // Intentar mover el pallet
      const movePaquete = await fetchMovePaquete(IdPaquete);
      if (!movePaquete) {
        setSuccessBadge("");
        setErrorBadge(`Error al mover el pallet ${IdPaquete}.`);
        return;
      }
  

      // Añadir el UUID al array de UUIDs escaneados y el paquete a los paquetes escaneados
      scannedUUIDs.push(uuid);
      setScannedPackages((prevPackages) => [...prevPackages, parsedData]);
      
      setSuccessBadge(`Paquete ${IdPaquete} se movio con éxito.`);
      setErrorBadge("")
    } catch (error) {
      setErrorBadge("Error al procesar el paquete escaneado.");
    }finally {
         // Desactivar el bloqueo después de 2 segundos
    setTimeout(() => {
      console.log("Listo para el siguiente escaneo.");
    }, 2000);
      setIsLoading(false); // Desactivar loading
    }
  };

 // Función para verificar un paquete
const fetchCheckPaquete = async (IdPaquete) => {
  try {
      const response = await fetch(`/api/syndra/avicola/pallet/list/id?IdPallet=${IdPaquete}`, {
          method: 'GET',
      });

      if (!response.ok) {
          // Manejo de error si el servidor devuelve un estado no exitoso
          toast({
              title: "Error",
              description: "Depósito final no encontrado en la lista de depósitos disponibles.",
              variant: "destructive",
          });
          return false;
      }

      const data = await response.json();
      return data.List;
  } catch (error) {
      console.error("Error checking paquete:", error);
      setSuccessBadge("");
      setErrorBadge("Error al verificar el paquete.");
      return false;
  }
};

// Función para mover un paquete
const fetchMovePaquete = async (IdPaquete) => {
  try {
      const response = await fetch('/api/syndra/avicola/pallet/move', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              IdPallet: IdPaquete,
              AlmacenOrigen: depositOrigin.Codigo,
              AlmacenDestino: depositFinal.Codigo,
          }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.Estado) {
          return responseData.Estado;
      } else {
          setErrorBadge("Error al mover el paquete.");
          return false;
      }
  } catch (error) {
      console.error("Error moving paquete:", error);
      setSuccessBadge("");
      setErrorBadge("Error al mover el paquete.");
      return false;
  }
};




  const handleRestart = () => {

    setSuccessBadge(null);
    setErrorBadge(null);
    setAvailableDeposits([]);
    setDepositOrigin(null);
    setDepositFinal(null);
    setScannedPackages([]);
    setScannedUUIDs([]);
    setActiveStep(1);
  };

  return (
    <>
      {isLoading && (
        <div className="mb-4">
          <Alert type="info" title="Cargando" message="Por favor, espera..." />
        </div>
      )}

      <Card>
        <CardContent className="grid gap-4 p-1 pt-4 pb-4">
        
        {activeStep === 1 && (
  isLoading ? (
    <div className="flex justify-center items-center">
      <Spinner size="md" />
    </div>
  ) : (
    <QrScannerComponent
      onScanSuccess={handleScanOrigin}
      title="Deposito Origen"
      description="Escanear el QR del depósito de origen"
    />
  )
)}

{activeStep === 2 && (
  <>
    <DepositoInfo depositoOrigen={depositOrigin} />
    {isLoading ? (
      <div className="flex justify-center items-center">
        <Spinner size="md" />
      </div>
    ) : (
      <QrScannerComponent
        onScanSuccess={handleScanFinal}
        title="Depósito Final"
        description="Escanear el QR del depósito de destino"
      />
    )}
  </>
)}

{activeStep === 3 && (
  <>
    <DepositoInfo
      depositoOrigen={depositOrigin}
      depositoFinal={depositFinal}
    />
    {successBadge && <StatusBadge type="success" text={successBadge} />}
    {errorBadge && <StatusBadge type="error" text={errorBadge} />}

    {isLoading ? (
      <div className="flex justify-center items-center">
        <Spinner size="md" />
      </div>
    ) : (
      <QrScannerComponent
        onScanSuccess={handleScanPackage}
        title="Escanear Paquete"
      />
    )}

    {scannedPackages.length > 0 && (
      <>
        <ListPackets paquetes={scannedPackages} />
        <Button className="ms-4 me-4" onClick={handleRestart}>
          Finalizar
        </Button>
      </>
    )}
  </>
)}

        </CardContent>
      </Card>
    </>
  );
}
