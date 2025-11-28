import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function ListPackets({ paquetes }) {
  console.log(paquetes);
  return (
    <Card className="w-full max-w-xl mx-auto border-none shadow-none">
      <CardContent>
        <ul className="space-y-4">
          {/* Invertimos el orden de los paquetes */}
          {[...paquetes].reverse().map((paquete) => (
            <li key={paquete.uuid} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">
                    Paquete: {paquete.IdPaquete}
                  </span>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Escaneado
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
