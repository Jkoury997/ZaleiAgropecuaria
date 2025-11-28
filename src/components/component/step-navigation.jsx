import React from 'react';
import { Button } from "@/components/ui/button";

export function StepNavigation({ onPrevious, onNext, isNextDisabled }) {
  return (
    <div className="flex justify-between mt-4">
      <Button variant="outline" onClick={onPrevious}>
        Anterior
      </Button>
      <Button variant="outline" onClick={onNext} disabled={isNextDisabled}>
        Siguiente
      </Button>
    </div>
  );
}
