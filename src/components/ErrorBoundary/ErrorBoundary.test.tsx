import { describe, it, expect, beforeEach, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ErrorBoundary from "./ErrorBoundary"

function Boom(): never {
  throw new Error("boom")
}

/*
Suprime o console.error que o React (e o próprio ErrorBoundary) imprime
de propósito quando captura o erro — não é ruído de teste quebrado, é o
comportamento esperado sendo exercitado.
*/
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {})
  localStorage.clear()
})

describe("ErrorBoundary", () => {

  it("renders the fallback instead of crashing the whole tree when a child throws", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )

    expect(screen.getByText("Algo deu errado")).toBeInTheDocument()
  })

  it("renders children normally when nothing throws", () => {
    render(
      <ErrorBoundary>
        <p>tudo certo</p>
      </ErrorBoundary>
    )

    expect(screen.getByText("tudo certo")).toBeInTheDocument()
  })

  it("records the crash to a bounded local error log instead of only logging to console", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )

    const raw = localStorage.getItem("oratio_error_log")
    expect(raw).not.toBeNull()

    const log = JSON.parse(raw!)
    expect(log).toHaveLength(1)
    expect(log[0].message).toBe("boom")
    expect(typeof log[0].timestamp).toBe("string")
  })

  it("keeps only the most recent 20 entries in the local error log", () => {
    const existing = Array.from({ length: 20 }, (_, i) => ({
      message: `old-${i}`,
      timestamp: new Date().toISOString(),
    }))
    localStorage.setItem("oratio_error_log", JSON.stringify(existing))

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    )

    const log = JSON.parse(localStorage.getItem("oratio_error_log")!)
    expect(log).toHaveLength(20)
    expect(log[log.length - 1].message).toBe("boom")
    expect(log[0].message).toBe("old-1") // o mais antigo (old-0) foi descartado
  })

  it("calls onReset instead of doing a full page reload when provided", () => {
    const onReset = vi.fn()

    render(
      <ErrorBoundary onReset={onReset}>
        <Boom />
      </ErrorBoundary>
    )

    fireEvent.click(screen.getByText("Voltar ao início"))

    expect(onReset).toHaveBeenCalledTimes(1)
  })

})
