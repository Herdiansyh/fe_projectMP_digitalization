import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50:  { value: "#EBF2FB" },
          100: { value: "#C7DAEF" },
          200: { value: "#9DBDE3" },
          300: { value: "#6F9FD6" },
          400: { value: "#3B7CC4" },
          500: { value: "#1A5EA8" },
          600: { value: "#154D8C" },
          700: { value: "#103C70" },
          800: { value: "#0B2B54" },
          900: { value: "#061A38" },
        },
        accent: {
          50:  { value: "#FEF4E3" },
          100: { value: "#FDDFAD" },
          200: { value: "#FAC975" },
          300: { value: "#F7B240" },
          400: { value: "#F5A623" },
          500: { value: "#D4880A" },
          600: { value: "#B87A10" },
          700: { value: "#8C5C0A" },
          800: { value: "#603E06" },
          900: { value: "#3A2503" },
        },
      },
      fonts: {
        heading: { value: "Inter, sans-serif" },
        body:    { value: "Inter, sans-serif" },
      },
      radii: {
        sm: { value: "6px" },
        md: { value: "8px" },
        lg: { value: "12px" },
        xl: { value: "16px" },
      },
    },
    semanticTokens: {
      colors: {
        "brand.solid":        { value: "{colors.brand.500}" },
        "brand.solid.hover":  { value: "{colors.brand.600}" },
        "brand.muted":        { value: "{colors.brand.50}" },
        "brand.subtle":       { value: "{colors.brand.100}" },
        "accent.solid":       { value: "{colors.accent.400}" },
        "accent.muted":       { value: "{colors.accent.50}" },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);