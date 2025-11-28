"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Package, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Carga dinámica del componente QrPrinter
const QrPrinter = dynamic(() => import("@/components/component/qr-pdf-generator"), { ssr: false })

export default function UltimoImpreso({ data }) {
  const { IdPaquete, Galpon, Cantidad ,Fecha} = data
  const { dataArticulo, ...soloDatosQR } = data

  const componentRef = useRef(null)
  const [mostrarUltimoQR, setMostrarUltimoQR] = useState(false)

  return (
    <Card className="w-full max-w-md shadow-sm mb-2" ref={componentRef}>
      <CardContent className="p-3">
        {/* Encabezado y botón en la misma línea */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Último Paquete</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 flex items-center gap-1"
            onClick={() => setMostrarUltimoQR(!mostrarUltimoQR)}
          >
            <span className="text-xs">{mostrarUltimoQR ? "Ocultar" : "Ver"}</span>
            {mostrarUltimoQR ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Información en grid de 2 columnas */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ID:</span>
            <span className="font-medium">{IdPaquete}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Galpón:</span>
            <span>{Galpon}</span>
          </div>

          <div className="flex items-center justify-between ">
            <span className="text-muted-foreground">Cantidad:</span>
            <span>{Cantidad} unidades</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Fecha:</span>
            <span>{Fecha}</span>
          </div>
        </div>

        {/* QR condicional */}
        {mostrarUltimoQR && (
          <div className="mt-2 flex justify-center">
            <QrPrinter qrData={JSON.stringify(soloDatosQR)} apiResponse={data.dataArticulo} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

