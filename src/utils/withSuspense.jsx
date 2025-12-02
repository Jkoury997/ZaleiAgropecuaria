import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

/**
 * HOC para envolver componentes que usan useSearchParams en Suspense
 * Esto es requerido por Next.js 14 para evitar errores de prerendering
 */
export function withSuspense(Component, fallback = null) {
  return function WrappedComponent(props) {
    const defaultFallback = (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );

    return (
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props} />
      </Suspense>
    );
  };
}
