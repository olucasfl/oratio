import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// jsdom não implementa as APIs de scroll do elemento — vários
// componentes chamam scrollIntoView/scrollTo ao trocar de passo/página.
// Sem esse stub o teste estoura com "not a function" antes de chegar
// na asserção. É só uma lacuna do jsdom, não comportamento observável.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo
}

// jsdom não tem ResizeObserver — usado por hooks de medição de layout
// (usePublishHeightVar) e por libs de UI. Stub inerte: nunca dispara.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

// Sem isso, o DOM renderizado por um teste continua no document.body do
// próximo teste na mesma suíte — testes que usam getByText/getByRole
// passam a achar múltiplos elementos e falham de forma confusa.
afterEach(() => {
  cleanup()
})
