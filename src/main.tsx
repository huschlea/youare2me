// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.tsx"; // root component

/* ------------------------------------------------------------------ */
/* No Supabase client created here—every module imports the single     */
/* instance from  src/lib/supabaseClient.ts                            */
/* ------------------------------------------------------------------ */

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
