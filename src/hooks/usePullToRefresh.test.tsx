import { renderHook } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import type { ReactNode } from "react"
import { usePullToRefresh } from "./usePullToRefresh"
import { PullToRefreshContext, type PullToRefreshContextValue } from "../contexts/PullToRefreshContext"

function wrapperFor(ctx: PullToRefreshContextValue | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    if (!ctx) return <>{children}</>
    return <PullToRefreshContext.Provider value={ctx}>{children}</PullToRefreshContext.Provider>
  }
}

describe("usePullToRefresh", () => {

  it("registers a stable handler with the context on mount, and unregisters (null) on unmount", () => {
    const registerMock = vi.fn()
    const ctx = { register: registerMock }

    const { unmount } = renderHook(() => usePullToRefresh(() => {}), { wrapper: wrapperFor(ctx) })

    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(typeof registerMock.mock.calls[0][0]).toBe("function")

    unmount()

    expect(registerMock).toHaveBeenLastCalledWith(null)
  })

  it("does not throw and registers nothing when there is no PullToRefreshContext provider", () => {
    expect(() => renderHook(() => usePullToRefresh(() => {}))).not.toThrow()
  })

  it("does not register anything when enabled=false", () => {
    const registerMock = vi.fn()
    const ctx = { register: registerMock }

    renderHook(() => usePullToRefresh(() => {}, false), { wrapper: wrapperFor(ctx) })

    expect(registerMock).not.toHaveBeenCalled()
  })

  /*
  handlerRef existe justamente pra isso: o handler registrado no contexto
  precisa continuar chamando a versão MAIS RECENTE de onRefresh mesmo sem
  re-registrar -- senão telas que recriam onRefresh a cada render (a
  maioria) ficariam presas na primeira versão da função pra sempre.
  */
  it("the registered handler always calls the latest onRefresh, without re-registering", async () => {
    const registerMock = vi.fn()
    const ctx = { register: registerMock }
    const onRefresh1 = vi.fn().mockResolvedValue(undefined)
    const onRefresh2 = vi.fn().mockResolvedValue(undefined)

    const { rerender } = renderHook(
      ({ onRefresh }) => usePullToRefresh(onRefresh),
      { wrapper: wrapperFor(ctx), initialProps: { onRefresh: onRefresh1 } },
    )

    const registeredHandler = registerMock.mock.calls[0][0]

    rerender({ onRefresh: onRefresh2 })
    expect(registerMock).toHaveBeenCalledTimes(1) // não re-registrou

    await registeredHandler()

    expect(onRefresh2).toHaveBeenCalledTimes(1)
    expect(onRefresh1).not.toHaveBeenCalled()
  })

})
