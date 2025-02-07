// @ts-nocheck
import { defineConfig } from "vitest/config";
import react from "@vitest/plugin-react";

export default defineConfig({
    plugins: [react()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: "./src/setupTests.js",
    }
})