"use client"
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";


function CajonesPageContent() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || 'home';

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
      <Link href={pathname+"/create"} passHref>
        <Button className="mx-auto text-center">Cargar</Button>
      </Link>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner size="lg" /></div>}>
      <CajonesPageContent />
    </Suspense>
  );
}
