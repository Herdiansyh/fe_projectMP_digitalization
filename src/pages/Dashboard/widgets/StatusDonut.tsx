import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Box, Flex, Text } from "@chakra-ui/react";
import ChartTooltip from "./ChartTooltip";

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface StatusDonutProps {
  data: DonutSlice[];
  centerLabel: string;
  height?: number;
}

export default function StatusDonut({
  data,
  centerLabel,
  height = 220,
}: StatusDonutProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);
  const visible = data.filter((slice) => slice.value > 0);

  if (total === 0) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="sm" color="gray.400">
          Belum ada data.
        </Text>
      </Box>
    );
  }

  return (
    <>
      <Box position="relative" height={height} minH={0}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="68%"
              outerRadius="94%"
              paddingAngle={2}
              cornerRadius={6}
              strokeWidth={0}
            >
              {data.map((slice) => (
                <Cell key={slice.label} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <Flex
          position="absolute"
          inset={0}
          align="center"
          justify="center"
          direction="column"
          pointerEvents="none"
        >
          <Text fontSize="26px" fontWeight="800" color="gray.800" lineHeight={1}>
            {total}
          </Text>
          <Text fontSize="11px" color="gray.500">
            {centerLabel}
          </Text>
        </Flex>
      </Box>

      <Flex flexWrap="wrap" gapX={4} gapY={1.5} mt={3}>
        {visible.map((slice) => (
          <Flex key={slice.label} align="center" gap={1.5}>
            <Box w="8px" h="8px" borderRadius="full" bg={slice.color} />
            <Text fontSize="12px" color="gray.600">
              {slice.label}
            </Text>
            <Text fontSize="12px" fontWeight="700" color="gray.800">
              {slice.value}
            </Text>
          </Flex>
        ))}
      </Flex>
    </>
  );
}