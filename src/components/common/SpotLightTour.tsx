import React, { useEffect, useState } from "react";
import { Box, Text, Button, HStack } from "@chakra-ui/react";
import type { TourStep } from "../../hooks/useTourGuide";

interface SpotlightTourProps {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  onNext: () => void;
  onSkip: () => void;
}

const SpotlightTour: React.FC<SpotlightTourProps> = ({
  step,
  stepIndex,
  totalSteps,
  isLastStep,
  onNext,
  onSkip,
}) => {
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Lock scroll & interaksi ke background selama tour aktif
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRect(null);
    const el = document.querySelector(`[data-tour="${step.target}"]`);

    if (!el) {
      // Target tidak ada di DOM (mis. section sedang disembunyikan) — lewati step ini
      const timer = setTimeout(() => {
        if (!cancelled) onNext();
      }, 50);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    }

    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => {
      if (!cancelled) setRect(el.getBoundingClientRect());
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.target]);

  if (!rect) return null;

  const padding = 8;
  const viewportH = window.innerHeight;
  const viewportW = window.innerWidth;

  const rawTop = rect.top - padding;
  const rawLeft = rect.left - padding;
  const rawBottom = rect.bottom + padding;
  const rawRight = rect.right + padding;

  const clampedTop = Math.max(rawTop, 8);
  const clampedLeft = Math.max(rawLeft, 8);
  const clampedBottom = Math.min(rawBottom, viewportH - 8);
  const clampedRight = Math.min(rawRight, viewportW - 8);

  const highlightBox = {
    top: clampedTop,
    left: clampedLeft,
    width: clampedRight - clampedLeft,
    height: clampedBottom - clampedTop,
  };

  const spaceBelow = viewportH - (highlightBox.top + highlightBox.height);
  const showBelow = spaceBelow > 180;

  const estimatedTooltipHeight = 160;

  let tooltipTop = showBelow
    ? highlightBox.top + highlightBox.height + 12
    : highlightBox.top - 12;

  if (showBelow) {
    tooltipTop = Math.min(tooltipTop, viewportH - estimatedTooltipHeight - 16);
    tooltipTop = Math.max(tooltipTop, 16);
  } else {
    tooltipTop = Math.max(tooltipTop, estimatedTooltipHeight + 16);
    tooltipTop = Math.min(tooltipTop, viewportH - 16);
  }

  const tooltipLeft = Math.max(
    16,
    Math.min(highlightBox.left, viewportW - 336),
  );

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={99999}
      pointerEvents="auto"
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* Overlay gelap sekaligus jadi "wall" yang menangkap semua klik */}
      <Box
        position="absolute"
        top={`${highlightBox.top}px`}
        left={`${highlightBox.left}px`}
        width={`${highlightBox.width}px`}
        height={`${highlightBox.height}px`}
        borderRadius="8px"
        boxShadow="0 0 0 9999px rgba(0,0,0,0.6)"
        border="2px solid #1A5EA8"
        pointerEvents="none"
        transition="all 0.25s ease"
      />

      <Box
        position="absolute"
        top={`${tooltipTop}px`}
        left={`${tooltipLeft}px`}
        transform={showBelow ? undefined : "translateY(-100%)"}
        bg="white"
        rounded="lg"
        shadow="xl"
        p={4}
        maxW="320px"
        pointerEvents="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Text fontSize="11px" fontWeight="700" color="#1A5EA8" mb={1}>
          {stepIndex + 1} / {totalSteps}
        </Text>
        <Text fontSize="14px" fontWeight="700" color="gray.800" mb={1}>
          {step.title}
        </Text>
        <Text fontSize="13px" color="gray.600" mb={4}>
          {step.description}
        </Text>
        <HStack justify="space-between">
          <Button size="xs" variant="ghost" color="gray.500" onClick={onSkip}>
            Skip
          </Button>
          <Button size="xs" colorPalette="blue" bg="#1A5EA8" onClick={onNext}>
            {isLastStep ? "Selesai" : "Next →"}
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

export default SpotlightTour;
