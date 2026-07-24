import React from "react";
import { Box, Text } from "@chakra-ui/react";

const SIZE = 64;
const CENTER = SIZE / 2;
const RADIUS = SIZE / 2 - 2;

interface Props {
  score: number; // 0-4, boleh desimal, akan dibulatkan
  stationName: string;
  periodLabel?: string;
}

// Urutan kuadran: mulai dari atas (12 arah jam), searah jarum jam
// Q1: kanan-atas, Q2: kanan-bawah, Q3: kiri-bawah, Q4: kiri-atas
const QUADRANT_PATHS = [
  `M ${CENTER},${CENTER} L ${CENTER},${CENTER - RADIUS} A ${RADIUS},${RADIUS} 0 0,1 ${CENTER + RADIUS},${CENTER} Z`,
  `M ${CENTER},${CENTER} L ${CENTER + RADIUS},${CENTER} A ${RADIUS},${RADIUS} 0 0,1 ${CENTER},${CENTER + RADIUS} Z`,
  `M ${CENTER},${CENTER} L ${CENTER},${CENTER + RADIUS} A ${RADIUS},${RADIUS} 0 0,1 ${CENTER - RADIUS},${CENTER} Z`,
  `M ${CENTER},${CENTER} L ${CENTER - RADIUS},${CENTER} A ${RADIUS},${RADIUS} 0 0,1 ${CENTER},${CENTER - RADIUS} Z`,
];

const CompetencyDonutBadge: React.FC<Props> = ({
  score,
  stationName,
  periodLabel,
}) => {
  const filled = Math.max(0, Math.min(4, Math.round(score)));

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={1}
      style={{ width: "88px" }}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* 4 kuadran */}
        {QUADRANT_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill={i < filled ? "#1A5EA8" : "#f1f5f9"}
            stroke="#ffffff"
            strokeWidth={1.5}
          />
        ))}
        {/* Outline lingkaran luar */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={1.5}
        />
      </svg>
      <Text
        fontSize="12px"
        fontWeight={600}
        color="gray.700"
        textAlign="center"
      >
        {stationName}
      </Text>
      {periodLabel && (
        <Text fontSize="10px" color="gray.400" textAlign="center">
          {periodLabel}
        </Text>
      )}
      <Text fontSize="11px" fontWeight={700} color="#1A5EA8">
        {filled}/4
      </Text>
    </Box>
  );
};

export default CompetencyDonutBadge;
