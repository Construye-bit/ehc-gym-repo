/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [tailwindcss(), tanstackRouter({}), react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	test: {
		globals: true,
		environment: "happy-dom",
		setupFiles: ["./src/__tests__/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			exclude: [
				"node_modules/",
				"src/__tests__/",
				"**/*.d.ts",
				"**/*.config.*",
				"**/mockData.ts",
				"src/routeTree.gen.ts",
			],
		},
	},
});
