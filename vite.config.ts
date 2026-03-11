import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({

plugins: [
react()
],

build: {

target: "esnext",

sourcemap: false,

minify: "esbuild",

chunkSizeWarningLimit: 1000,

rollupOptions: {

output: {

manualChunks: {

react: ["react","react-dom"],

router: ["react-router-dom"]

}

}

}

},

optimizeDeps: {

include: [
"react",
"react-dom",
"react-router-dom"
]

},

server: {

port: 5173

}

})