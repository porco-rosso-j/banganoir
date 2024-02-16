import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// https://vitejs.dev/config/
import copy from "rollup-plugin-copy";
import fs from "fs";
import path from "path";

const wasmContentTypePlugin = {
	name: "wasm-content-type-plugin",
	configureServer(server) {
		server.middlewares.use(async (req, res, next) => {
			if (req.url.endsWith(".wasm")) {
				res.setHeader("Content-Type", "application/wasm");
				const newPath = req.url.replace("deps", "dist");
				const targetPath = path.join(__dirname, newPath);
				const wasmContent = fs.readFileSync(targetPath);
				return res.end(wasmContent);
			}
			next();
		});
	},
};

export default defineConfig({
	plugins: [
		react(),
		nodePolyfills({
			include: ["fs", "readline", "crypto", "util", "stream"],
		}),
		copy({
			targets: [
				{ src: "node_modules/**/*.wasm", dest: "node_modules/.vite/dist" },
			],
			copySync: true,
			hook: "buildStart",
		}),
		wasmContentTypePlugin,
	],
	//plugins: [react()],
	optimizeDeps: {
		esbuildOptions: {
			target: "esnext",
		},
		include: ["@porco/noir-otp-lib"],
		// exclude: ["@porco/noir-otp-lib"],
	},
	build: {
		target: "esnext",
	},
});
