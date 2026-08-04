import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Text } from "@chakra-ui/react";
import { AXIS_TICK, GRID_STROKE, CHART_PALETTE } from "./chartTheme";
import ChartTooltip from "./ChartTooltip";
import type { CompetencyTrendPoint } from "../../../types/dashboard";

interface ScoreLineChartProps {
  data: CompetencyTrendPoint[];
  color?: string;
  height?: number;
}

/** Line chart rata-rata skor kompetensi per bulan (skala 0-4). */
export default function ScoreLineChart({
  data,
  color = CHART_PALETTE.amber,
  height = 200,
}: ScoreLineChartProps) {
  const isEmpty = data.every((point) => point.avg_score === 0);

  if (isEmpty) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" color="gray.400">
          Belum ada assessment disetujui dalam 6 bulan terakhir.
        </Text>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis
          domain={[0, 4]}
          tickCount={5}
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID_STROKE }} />
        <ReferenceLine y={3} stroke={GRID_STROKE} strokeDasharray="4 4" />

        <Line
          type="monotone"
          dataKey="avg_score"
          name="Rata-rata skor"
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5.5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}