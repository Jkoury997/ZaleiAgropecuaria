"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrinterIcon, QrCode, Share2Icon } from "lucide-react";
import QrView from "@/components/component/qr-view"; // Asegúrate de que la ruta sea correcta
import { useEffect, useState } from "react";
import PrintView from "@/components/component/qr-print";
import ShareQrView from "@/components/component/qr-share";


export default function Page() {
  const [success, setSuccess] = useState(null);
  const [availableDeposits, setAvailableDeposits] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeposits()
  }, []);


  const fetchDeposits = async () => {
    try {
      const response = await fetch("/api/syndra/catalogo/almacenespallets");
      const data = await response.json();
      if (response.ok && data.Estado) {
        setAvailableDeposits(data.Almacenes);
        console.log(data.Almacenes)
        return data.Almacenes;
      } else {
        setError(data.error || "Error al obtener los depósitos");
        return null;
      }
    } catch (err) {
      setError("Error al realizar la solicitud");
      return null;
    }
  };


  const ActionButtons = ({ Codigo, Descripcion }) => (
    <div className="flex space-x-2">
      <QrView Codigo={Codigo} Descripcion={Descripcion} />
      <PrintView Codigo={Codigo} Descripcion={Descripcion} />
    </div>
  );

  return (
    <> 
        {/* Vista de escritorio */}
        <div className="hidden md:block">
          <Card >
        <CardHeader >
          <CardTitle>Lista almacenes</CardTitle>
        </CardHeader>
        <CardContent >
          <Table >
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Codigo</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableDeposits.map((deposit, index) => (
                <TableRow key={deposit.Codigo}>
                  <TableCell>{index}</TableCell>
                  <TableCell>{deposit.Codigo}</TableCell>
                  <TableCell>{deposit.Descripcion}</TableCell>
                  <TableCell>
                    <ActionButtons Codigo={deposit.Codigo} Descripcion={deposit.Descripcion} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </CardContent>
          </Card>
        </div>

        {/* Vista móvil */}
        <div className="md:hidden  space-y-4 ">
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="ps-2">
          <CardTitle>Lista almacenes</CardTitle>
          </CardHeader>
            {availableDeposits.map((deposit, index) => (
            <Card key={deposit.Codigo} className="mb-2">
              
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{deposit.Codigo}</h3>
                  <span className="text-sm text-gray-500">ID: {index}</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{deposit.Descripcion}</p>
                <div className="flex justify-end">
                  <ActionButtons Codigo={deposit.Codigo} Descripcion={deposit.Descripcion} />
                </div>
              </CardContent>
              </Card>
           
          ))}
           </Card>
        </div>
     
        </>
    
  );
}
