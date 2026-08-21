import { pdfjs } from "react-pdf"

/*
Empacotado localmente via Vite (new URL + import.meta.url) em vez de
carregado de unpkg.com em tempo de execução. Dois motivos: (1) um worker
de módulo cross-origin com WASM interno (o PDF.js usa WASM pra alguns
codecs) é frágil com CSP — depender de um CDN externo puxava o app pra
um comportamento difícil de garantir sem testar num navegador real;
(2) supply-chain — a versão do worker ficava fora do nosso controle,
puxada de terceiro a cada carregamento.

IMPORTANTE: a dependência direta de "pdfjs-dist" no package.json está
fixada SEM `^` (versão exata, ex. "5.4.296"), igual ao que o próprio
`react-pdf` declara internamente — de propósito, pra sempre resolver
como uma cópia só no node_modules em vez de duas versões divergentes
(uma solta, outra embutida no react-pdf). Se a versão exata que o
react-pdf usa mudar numa atualização (`npm ls pdfjs-dist` mostra se
voltou a duplicar), atualize o pin aqui pra bater de novo — senão o
PDF.js recusa rodar ("API version does not match Worker version").
*/
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()