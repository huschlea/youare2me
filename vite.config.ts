import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <-- make sure this import exists

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- and this call
  ],
});
