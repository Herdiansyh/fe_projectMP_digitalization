import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "./components/ui/provider.tsx"; // Provider lokal

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* Cukup panggil Provider polos seperti ini */}
    <Provider>
      <App />
    </Provider>
  </StrictMode>,
);
