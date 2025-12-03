import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import flowbite from "flowbite/plugin";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	// Use a relative base so the build works when served under `/main`
	// and also when opening the `index.html` directly during local testing.
	base: "./",
	plugins: [react()],
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
	server: {
		host: true, // ← wichtig für externen Zugriff
		allowedHosts: ["localhost", "127.0.0.1"], // ← Railway-Domain freigeben
		proxy: {
			"/api": {
				target: "http://localhost:3001",
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
