"use client";
import { useState, useEffect } from "react";
import { ListPallets } from "@/components/component/list-pallets";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || 'home';
  const [palletsData, setPalletsData] = useState([]);

  const fetchPalletList = async () => {
    try {
      const response = await fetch("/api/syndra/avicola/pallet/list", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.status === 200 && result.Estado) {
        const transformedData = result.List.map(pallet => ({
          IdPallet: pallet.IdPallet,
          Numero: pallet.Numero,
          location: pallet.Almacen.trim(),
          date: pallet.Fecha
        }));

        setPalletsData(transformedData);
      } else {
        console.error("Failed to fetch pallets:", result.Mensaje);
      }
    } catch (error) {
      console.error("Error fetching pallets:", error);
    }
  };

  useEffect(() => {
    fetchPalletList();
  }, []);

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
      <ListPallets pallets={palletsData} />
    </>
  );
}
