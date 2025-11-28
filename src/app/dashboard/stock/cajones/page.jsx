"use client"
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { usePathname } from 'next/navigation';


export default function Page() {
    const pathname = usePathname();

  return (
    <Link href={pathname+"/create"} passHref>
      <Button className="mx-auto text-center">Cargar</Button>
    </Link>
  );
}
