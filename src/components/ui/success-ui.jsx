"use client"

import React, { useState, useEffect } from "react"
import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SuccessUI() {
    const [contador, setContador] = useState(4)

    useEffect(() => {
      const timer = contador > 0 && setInterval(() => setContador(contador - 1), 1000)
      return () => clearInterval(timer)
    }, [contador])
  
    useEffect(() => {
      if (contador === 0) {
        // Aquí puedes agregar la lógica para navegar a otra página o cerrar la pantalla
        console.log("Contador llegó a cero. Realizar acción...")
      }
    }, [contador])
  return (
      <Card className="w-full max-w-md shadow-none border-none justify-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-4">
            <Check className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">¡Acción Completada!</h2>
          <p className="text-gray-600 text-center mb-6">Tu acción se ha realizado con éxito.</p>
          <div className="text-2xl font-bold text-gray-600 mb-6">Volviendo en <span className="text-2xl">{contador}</span></div>
        </CardContent>
      </Card>
  )
}

