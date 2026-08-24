import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { saveLocal, getLocal, removeLocal } from "./localCache"

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe("saveLocal / getLocal", () => {

  it("round-trips data with the default 10-minute TTL", () => {
    saveLocal("k1", { a: 1 })
    expect(getLocal("k1")).toEqual({ a: 1 })
  })

  it("returns null when nothing is stored for that key", () => {
    expect(getLocal("missing")).toBeNull()
  })

  it("expires after the given TTL and removes the stale entry from storage", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    saveLocal("k1", { a: 1 }, 10)

    vi.setSystemTime(new Date("2026-01-01T00:11:00Z"))

    expect(getLocal("k1")).toBeNull()
    expect(localStorage.getItem("k1")).toBeNull()
  })

  it("is still valid the instant before the TTL elapses", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"))
    saveLocal("k1", { a: 1 }, 10)

    vi.setSystemTime(new Date("2026-01-01T00:09:59Z"))

    expect(getLocal("k1")).toEqual({ a: 1 })
  })

  it("returns null and cleans up the entry when the stored value is corrupted JSON", () => {
    localStorage.setItem("k1", "not-json{{{")

    expect(getLocal("k1")).toBeNull()
    expect(localStorage.getItem("k1")).toBeNull()
  })

})

describe("removeLocal", () => {

  it("removes a stored entry so a later getLocal returns null", () => {
    saveLocal("k1", { a: 1 })
    removeLocal("k1")

    expect(getLocal("k1")).toBeNull()
  })

})
