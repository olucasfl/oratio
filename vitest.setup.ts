import "@testing-library/jest-dom/vitest"
import { afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

// Sem isso, o DOM renderizado por um teste continua no document.body do
// próximo teste na mesma suíte — testes que usam getByText/getByRole
// passam a achar múltiplos elementos e falham de forma confusa.
afterEach(() => {
  cleanup()
})
