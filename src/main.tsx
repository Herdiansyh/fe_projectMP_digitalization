import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx"; // Provider lokal
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aktifkan agar worklist (pendingTriggers) auto-refresh saat kembali ke tab
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        // Jangan retry untuk error 4xx (403 Forbidden, 404 Not Found, 422 Unprocessable)
        // karena ini bukan network glitch — server memang sengaja menolak
        const axiosErr = error as AxiosError;
        if (
          axiosErr?.response?.status !== undefined &&
          axiosErr.response.status >= 400 &&
          axiosErr.response.status < 500
        ) {
          return false;
        }
        // Retry maks 2x hanya untuk network error atau 5xx
        return failureCount < 2;
      },
    },
    // Mutations tidak retry secara default — tidak perlu konfigurasi tambahan
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider>
        <App />
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);
