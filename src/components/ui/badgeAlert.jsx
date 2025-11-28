import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export default function StatusBadge({ type = "success", text }) {
  // Definir las configuraciones para cada tipo
  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: "bg-green-100",
      textColor: "text-green-800",
      hoverColor: "hover:bg-green-200",
      defaultText: "Operación exitosa"
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      hoverColor: "hover:bg-red-200",
      defaultText: "Error en la operación"
    }
  };

  const { icon: Icon, bgColor, textColor, hoverColor, defaultText } = config[type];
  const [isVisible, setIsVisible] = useState(false);

  // Iniciar la animación cuando el componente se monta
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Movimiento de entrada
  const badgeAnimation = isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0";
  const transitionClasses = "transition-all transform-gpu ease-out duration-500";

  return (
    <Badge variant="secondary" className={`${bgColor} ${textColor} ${hoverColor} flex items-center ${badgeAnimation} ${transitionClasses}`}>
      <Icon className="w-4 h-4 mr-1" />
      {text || defaultText}
    </Badge>
  );
}