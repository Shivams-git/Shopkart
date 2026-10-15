import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/customers": "http://localhost:5000",
			"/products": "http://localhost:5000",
			"/wishlist": "http://localhost:5000",
			"/cart": "http://localhost:5000",
			"/orders": "http://localhost:5000",
		},
	},
});
