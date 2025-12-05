"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export default function PesoAlimentosForm({ galpon, onSubmit, onBack }) {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [kilos, setKilos] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [imagen, setImagen] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    
    if (file) {
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          console.log('[ImageUpload] Imagen comprimida, longitud:', compressedBase64.length);
          console.log('[ImageUpload] Tamaño aproximado:', (compressedBase64.length / 1024 / 1024).toFixed(2), 'MB');
          
          setImagen(compressedBase64);
          
          console.log('[ImageUpload] Iniciando análisis de imagen...');
          setIsAnalyzing(true);
          try {
            console.log('[ImageUpload] Enviando request a /api/ia/analyze/img');
            const response = await fetch("/api/ia/analyze/img", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ image: compressedBase64 }),
            });

            console.log('[ImageUpload] Response status:', response.status);
            const data = await response.json();
            console.log('[ImageUpload] Response data:', data);

            if (response.ok && data.success && data.data) {
              const detectedNumber = data.data.toString();
              console.log('[ImageUpload] Número detectado:', detectedNumber);
              setKilos(detectedNumber);
              toast({
                title: "Análisis completado",
                description: `Peso detectado: ${detectedNumber} kg`,
                variant: "success",
              });
            } else {
              console.log('[ImageUpload] No se detectó número o respuesta no exitosa');
              toast({
                title: "Advertencia",
                description: "No se pudo detectar un número en la imagen. Ingrese el peso manualmente.",
                variant: "default",
              });
            }
          } catch (error) {
            console.error('[ImageUpload] Error al analizar imagen:', error);
            toast({
              title: "Error",
              description: "Error al analizar la imagen. Ingrese el peso manualmente.",
              variant: "destructive",
            });
          } finally {
            console.log('[ImageUpload] Análisis finalizado');
            setIsAnalyzing(false);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!kilos || parseFloat(kilos) <= 0) {
      toast({
        title: "Error",
        description: "Debe ingresar un peso válido",
        variant: "destructive",
      });
      return;
    }

    // Formatear fecha a dd/mm/yyyy
    const [year, month, day] = fecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;

    onSubmit({
      fecha: fechaFormateada,
      kilos,
      observaciones: observaciones || "",
      imagen: imagen || "",
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

      <div>
        <Label>Foto del contador (opcional)</Label>
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            id="photo-upload"
          />
          <label htmlFor="photo-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              asChild
            >
              <span>
                <Camera className="mr-2 h-4 w-4" />
                Tomar Foto
              </span>
            </Button>
          </label>
          {imagen && (
            <div className="mt-2">
              <img
                src={imagen}
                alt="Preview"
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="kilos">Kilos</Label>
        <Input
          id="kilos"
          type="number"
          placeholder={isAnalyzing ? "Analizando imagen..." : "Ingrese el peso en kg"}
          value={kilos}
          onChange={(e) => setKilos(e.target.value)}
          min="0"
          step="0.01"
          disabled={isAnalyzing}
          required
        />
        {isAnalyzing && (
          <p className="text-sm text-blue-600 mt-1 flex items-center gap-2">
            <Spinner size="sm" />
            Detectando peso en la imagen...
          </p>
        )}
      </div>

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
          disabled={!kilos || isAnalyzing}
        >
          Registrar
        </Button>
      </div>
    </form>
  );
}
