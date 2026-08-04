import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Text } from "@chakra-ui/react";
import { AXIS_TICK, GRID_STROKE, CHART_PALETTE } from "./chartTheme";
import ChartTooltip from "./ChartTooltip";
import type { FptkTrendPoint } from "../../../types/dashboard";

interface TrendAreaChartProps {
  data: FptkTrendPoint[];
  color?: string;
  height?: number;
}

/** Area chart tren FPTK per bulan (6 bulan terakhir). */
export default function TrendAreaChart({
  data,
  color = CHART_PALETTE.blue,
  height = 200,
}: TrendAreaChartProps) {
  const isEmpty = data.every((point) => point.total === 0);

  if (isEmpty) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" color="gray.400">
          Belum ada data dalam 6 bulan terakhir.
        </Text>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
        <defs>
          <linearGradient id="fptkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.22} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: GRID_STROKE }} />

        <Area
          type="monotone"
          dataKey="total"
          name="FPTK"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#fptkGrad)"
          dot={{ r: 3, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}