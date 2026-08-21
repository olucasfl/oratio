import { describe, it, expect, vi } from "vitest"

/*
Trava a correção do bug "todos os PDFs pararam de funcionar": o worker
do PDF.js precisa vir do nosso próprio domínio (empacotado pelo Vite),
nunca de um CDN externo — um worker de módulo cross-origin com WASM
interno é frágil demais com o CSP configurado em vercel.json. Se algo
reintroduzir uma URL de CDN aqui (unpkg.com, cdnjs, etc.), este teste
falha antes de virar um "PDF não carrega mais mudo" em produção.

Mocka `react-pdf` em vez de deixar `pdfConfig.ts` importar o pdf.js de
verdade — o pdf.js real precisa de APIs de navegador (DOMMatrix) que o
jsdom não fornece, e isso é irrelevante pro que este teste verifica
(só a URL configurada, não o comportamento do PDF.js em si).
*/
vi.mock("react-pdf", () => ({
  pdfjs: {
    version: "5.4.296",
    GlobalWorkerOptions: {} as { workerSrc?: string },
  },
}))

describe("pdfConfig", () => {

  it("points the PDF.js worker at a bundled same-origin asset, not an external CDN", async () => {

    const { pdfjs } = await import("react-pdf")
    await import("./pdfConfig")

    const workerSrc = pdfjs.GlobalWorkerOptions.workerSrc

    expect(workerSrc).toBeTruthy()
    expect(workerSrc).not.toMatch(/^https?:\/\/(?!localhost)/)
    expect(workerSrc).toContain("pdf.worker")

  })

})
