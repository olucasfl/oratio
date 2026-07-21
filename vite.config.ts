import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { copyFileSync } from "node:fs"
import { resolve } from "node:path"

/*
Vite gera o manifest de build em dist/.vite/manifest.json — uma pasta
com nome começando em ponto pode não ser servida por alguns hosts
estáticos (tratada como "oculta"). Copia pra um caminho normal, que o
Service Worker usa pra descobrir e pré-cachear todos os chunks do
build atual (não só os poucos referenciados direto no index.html).
*/
function copyManifestPlugin(){
 return {
  name: "copy-build-manifest",
  closeBundle(){
   try{
    copyFileSync(
     resolve(__dirname, "dist/.vite/manifest.json"),
     resolve(__dirname, "dist/asset-manifest.json")
    )
   }catch(err){
    console.warn("Não foi possível copiar o manifest de build:", err)
   }
  }
 }
}

export default defineConfig({

plugins: [
react(),
copyManifestPlugin()
],

build: {

target: "esnext",

sourcemap: false,

minify: "esbuild",

manifest: true,

chunkSizeWarningLimit: 1000,

rollupOptions: {

output: {

manualChunks: {

react: ["react","react-dom"],

router: ["react-router-dom"],

icons: ["lucide-react"],

pdf: ["react-pdf","pdfjs-dist"],

markdown: ["react-markdown","remark-gfm"]

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