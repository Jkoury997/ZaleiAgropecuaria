"use client"
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a /auth/login
    router.push('/auth/login');
  }, [router]);

  return null; // O puedes devolver un indicador de carga si lo prefieres
}
