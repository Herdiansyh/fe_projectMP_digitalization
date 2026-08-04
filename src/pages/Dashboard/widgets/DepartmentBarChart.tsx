import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Box, Text } from "@chakra-ui/react";
import { AXIS_TICK, GRID_STROKE, CHART_PALETTE } from "./chartTheme";
import ChartTooltip from "./ChartTooltip";
import type { DepartmentManpower } from "../../../types/dashboard";

interface DepartmentBarChartProps {
  data: DepartmentManpower[];
  height?: number;
}

/** Bar chart stacked manpower (karyawan + intern) per departemen. */
export default function DepartmentBarChart({
  data,
  height = 250,
}: DepartmentBarChartProps) {
  const isEmpty =
    data.length === 0 ||
    data.every((item) => item.employees + item.interns === 0);

  if (isEmpty) {
    return (
      <Box
        height={height}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text fontSize="sm" color="gray.400">
          Belum ada data manpower.
        </Text>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -14, bottom: 0 }} barSize={26}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} />
        <XAxis
          dataKey="name"
          tick={AXIS_TICK}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          content={<ChartTooltip />}
          cursor={{ fill: "rgba(148, 163, 184, 0.10)" }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />

        <Bar dataKey="employees" name="Karyawan" stackId="manpower" fill={CHART_PALETTE.blue} />
        <Bar
          dataKey="interns"
          name="Intern"
          stackId="manpower"
          fill={CHART_PALETTE.cyan}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}