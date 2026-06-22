"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "../../theme"; // <-- 1. Ubah import ke file theme kustom kamu
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";

export function Provider(props: ColorModeProviderProps) {
  return (
    // 2. Gunakan 'system' kustom kamu di sini, bukan defaultSystem lagi
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
