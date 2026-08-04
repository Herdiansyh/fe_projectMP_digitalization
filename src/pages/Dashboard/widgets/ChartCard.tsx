import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  height?: number;
}

/** Kartu container untuk chart dengan judul + subtitle, tinggi seragam. */
export default function ChartCard({
  title,
  subtitle,
  icon,
  children,
  height = 250,
}: ChartCardProps) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="16px"
      boxShadow="sm"
      p={5}
      display="flex"
      flexDirection="column"
      overflow="visible"
    >
      <Box mb={4}>
        <Flex align="center" gap={2}>
          {icon && <Box color="gray.400">{icon}</Box>}
          <Text
            fontWeight="700"
            fontSize="sm"
            color="gray.800"
            lineClamp={1}
          >
            {title}
          </Text>
        </Flex>
        {subtitle && (
          <Text fontSize="11px" color="gray.500" mt={0.5} lineClamp={1}>
            {subtitle}
          </Text>
        )}
      </Box>

      <Box height={`${height}px`} minH={0} overflow="hidden" position="relative">
        {children}
      </Box>
    </Box>
  );
}
