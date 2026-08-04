import type { ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface KpiCardProps {
  label: string;
  value: number | string;
  hint?: string;
  icon: ReactNode;
  accent: string;
  tint: string;
  href?: string;
}

/** Kartu KPI ringkas: angka besar + label + ikon berwarna, bisa di-klik. */
export default function KpiCard({
  label,
  value,
  hint,
  icon,
  accent,
  tint,
  href,
}: KpiCardProps) {
  const navigate = useNavigate();
  const isClickable = Boolean(href);

  return (
    <Box
      as={isClickable ? "button" : "div"}
      onClick={isClickable ? () => navigate(href!) : undefined}
      w="100%"
      textAlign="left"
      bg="white"
      borderWidth="1px"
      borderColor="gray.100"
      borderRadius="16px"
      boxShadow="sm"
      p={5}
      position="relative"
      overflow="hidden"
      transition="all 0.15s ease"
      cursor={isClickable ? "pointer" : "default"}
      _hover={
        isClickable
          ? {
              boxShadow: "md",
              borderColor: "gray.200",
              transform: "translateY(-1px)",
            }
          : undefined
      }
    >
      <Box position="absolute" top={0} left={0} right={0} h="3px" bg={accent} />

      <Flex justify="space-between" align="center">
        <Box minW={0}>
          <Text
            fontSize="30px"
            fontWeight="800"
            lineHeight="1.15"
            color="gray.800"
          >
            {value}
          </Text>
          <Text fontSize="13px" color="gray.500" mt={1} lineClamp={1}>
            {label}
          </Text>
          {hint && (
            <Text fontSize="11px" color="gray.400" mt={0.5} lineClamp={1}>
              {hint}
            </Text>
          )}
        </Box>

        <Box
          w="44px"
          h="44px"
          borderRadius="12px"
          bg={tint}
          color={accent}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          {icon}
        </Box>
      </Flex>
    </Box>
  );
}
