/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import environment from 'vite-plugin-environment';

import dotenv from 'dotenv';
import EnvironmentPlugin from "vite-plugin-environment";

dotenv.config();

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis.
      // (Makes it possible for WebWorker to use imports.)
      define: {
        DFX_NETWORK:'ic',
        global: 'globalThis',
      },
    },
  },
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: 'http://127.0.0.1:4943',
  //       changeOrigin: true,
  //     },
  //   },
  // },
  plugins: [
    // Maps all envars prefixed with 'CANISTER_' to process.env.*
    EnvironmentPlugin("all", { prefix: "CANISTER_" }),
    // Weirdly process not available to Webworker but import.meta.env will be.
    EnvironmentPlugin("all", { prefix: "CANISTER_", defineOn: 'import.meta.env' }),
    // Maps all envars prefixed with 'DFX_' to process.env.*
    EnvironmentPlugin("all", { prefix: "DFX_" }),
    // Weirdly process not available to Webworker but import.meta.env will be.
    EnvironmentPlugin("all", { prefix: "DFX_", defineOn: 'import.meta.env' }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: 'setupTests.ts',
  },
});
