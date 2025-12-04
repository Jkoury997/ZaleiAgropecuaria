"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, Skull } from "lucide-react";

function MortandadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "avicola";

  return (
    <>
      <Button
        variant="outline"
        onClick={() => router.push(`/dashboard?step=galpones`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Skull className="h-6 w-6" />
            Mortandad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center text-gray-500">
            <Skull className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Componente en desarrollo</p>
            <p className="text-sm mt-2">
              Aquí se registrará la mortandad en los galpones
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    }>
      <MortandadPageContent />
    </Suspense>
  );
}
