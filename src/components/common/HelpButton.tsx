import React from "react";
import { Box } from "@chakra-ui/react";
import { FiHelpCircle } from "react-icons/fi";

interface HelpButtonProps {
  onClick: () => void;
  label?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({ onClick, label = "Help" }) => (
  <Box
    as="button"
    onClick={onClick}
    display="inline-flex"
    alignItems="center"
    gap="6px"
    px="5px"
    py="3px"
    fontSize="12px"
    fontWeight={600}
    color="#1A5EA8"
    bg="#eff6ff"
    border="1px solid #bfdbfe"
    borderRadius="6px"
    cursor="pointer"
    whiteSpace="nowrap"
    _hover={{ bg: "#dbeafe" }}
    position={"absolute"}
    top={"14"}
    right={5}
  >
    <FiHelpCircle size={14} /> {label}
  </Box>
);

export default HelpButton;
