import type { TooltipContentProps } from "recharts";
import { Box, Flex, Text } from "@chakra-ui/react";
import { CHART_PALETTE } from "./chartTheme";

/** Custom tooltip recharts dengan styling rapi & konsisten. */
export default function ChartTooltip({
  active,
  payload,
  label,
}: Partial<TooltipContentProps>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="10px"
      boxShadow="lg"
      px={3}
      py={2}
      minW="130px"
    >
      <Text fontWeight="700" fontSize="13px" color="gray.700" mb={1}>
        {label}
      </Text>
      {payload.map((entry, index) => (
        <Flex
          key={String(entry.dataKey ?? entry.name ?? index)}
          align="center"
          gap={2}
          py={0.5}
        >
          <Box
            w="8px"
            h="8px"
            borderRadius="full"
            bg={entry.color ?? CHART_PALETTE.blue}
            flexShrink={0}
          />
          <Text fontSize="12px" color="gray.600">
            {entry.name}
          </Text>
          <Text fontSize="12px" fontWeight="700" color="gray.800" ml="auto">
            {Array.isArray(entry.value) ? entry.value.join(", ") : entry.value}
          </Text>
        </Flex>
      ))}
    </Box>
  );
}
