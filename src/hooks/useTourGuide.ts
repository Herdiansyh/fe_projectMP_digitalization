import { useState, useCallback, useEffect } from "react";

export interface TourStep {
  target: string;
  title: string;
  description: string;
}

export function useTourGuide(tourId: string, steps: TourStep[]) {
  const storageKey = `tour_seen_${tourId}`;
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (steps.length === 0) return;
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const timer = setTimeout(() => setIsOpen(true), 400);
      return () => clearTimeout(timer);
    }
  }, [storageKey, steps.length]);

  const start = useCallback(() => {
    setStepIndex(0);
    setIsOpen(true);
  }, []);

  const next = useCallback(() => {
    setStepIndex((prev) => {
      if (prev + 1 >= steps.length) {
        setIsOpen(false);
        localStorage.setItem(storageKey, "1");
        return prev;
      }
      return prev + 1;
    });
  }, [steps.length, storageKey]);

  const skip = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(storageKey, "1");
  }, [storageKey]);

  return {
    isOpen,
    stepIndex,
    currentStep: steps[stepIndex] ?? null,
    isLastStep: stepIndex === steps.length - 1,
    start,
    next,
    skip,
  };
}
